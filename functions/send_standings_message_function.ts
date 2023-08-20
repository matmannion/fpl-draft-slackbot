import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SetupDatastore from "../datastores/setup_datastore.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";
import {
  BasicInfo,
  GameInfo,
  LeagueEntryDetails,
  LeagueInfo,
  LeagueStandings,
} from "../types/fpl.ts";

/**
 * This custom function will pull the stored league from the datastore
 * and send the standings to the channel.
 */
export const SendStandingsMessageFunction = DefineFunction({
  callback_id: "send_standings_message_function",
  title: "Sending the Standings Message",
  description: "Calculate the FPL Draft standings and send to the channel",
  source_file: "functions/send_standings_message_function.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel where the event was triggered",
      },
    },
    required: ["channel"],
  },
});

export default SlackFunction(SendStandingsMessageFunction, async (
  { inputs, client },
) => {
  // Querying datastore for stored messages
  const messages = await client.apps.datastore.query<
    typeof SetupDatastore.definition
  >({
    datastore: SetupDatastore.name,
    expression: "#channel = :mychannel",
    expression_attributes: { "#channel": "channel" },
    expression_values: { ":mychannel": inputs.channel },
  });

  if (!messages.ok) {
    return { error: `Failed to gather setup info: ${messages.error}` };
  }

  // Find the league details
  for (const item of messages["items"]) {
    const { channel, league } = item;

    const text = await buildStandings(client, league);
    if (!text.text) {
      return { error: `Error generating text: ${text.error}` };
    }

    const message = await client.chat.postMessage({
      channel,
      text: text.text,
    });

    if (!message.ok) {
      return { error: `Failed to send standings message: ${message.error}` };
    }
  }

  return {
    outputs: {},
  };
});

async function buildStandings(client: SlackAPIClient, league: number) {
  const users = await client.users.list();
  if (!users.ok) {
    return { error: `Failed to list users: ${users.error}` };
  }

  const members = users.members as { id: string; real_name?: string }[];

  const gameInfo = (await fetch(
    "https://draft.premierleague.com/api/game",
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    },
  ).then((r) => r.json())) as GameInfo;

  const basicInfo = (await fetch(
    "https://draft.premierleague.com/api/bootstrap-static",
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    },
  ).then((r) => r.json())) as BasicInfo;

  const leagueDetails = (await fetch(
    `https://draft.premierleague.com/api/league/${league}/details`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    },
  ).then((r) => r.json())) as LeagueInfo;

  const rankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return ":first_place_medal:";
      case 2:
        return ":second_place_medal:";
      case 3:
        return ":third_place_medal:";
      default:
        return `${rank}.`;
    }
  };

  const playerName = (player: LeagueEntryDetails) => {
    const member = members.find((u) =>
      u.real_name?.toLowerCase().startsWith(
        player.player_first_name.toLowerCase(),
      ) &&
      u.real_name?.toLowerCase().endsWith(
        player.player_last_name.toLowerCase(),
      )
    ) ?? members.find((u) => {
      if (u.real_name?.includes(" ")) {
        const [firstName, lastName] = u.real_name.toLowerCase().split(" ", 2);

        return firstName.startsWith(player.player_first_name.toLowerCase()) &&
          lastName.startsWith(player.player_last_name.toLowerCase());
      }

      return false;
    }) ?? members.find((u) => {
      if (u.real_name?.includes(" ")) {
        const [firstName] = u.real_name.toLowerCase().split(" ", 2);

        return firstName.endsWith(player.player_first_name.toLowerCase());
      }

      return false;
    });

    return member
      ? `<@${member.id}>`
      : `${player.player_first_name} ${player.player_last_name}`;
  };

  const standingsStr = leagueDetails.standings.map((s) => {
    const player = leagueDetails.league_entries.find((d) =>
      d.id === s.league_entry
    )!;

    return `${
      rankEmoji(s.rank)
    } <https://draft.premierleague.com/entry/${player.entry_id}/event/${gameInfo.current_event}|${player.entry_name}> (${
      playerName(player)
    }) - ${s.total}`;
  }).join("\n");

  const standingsThisWeek: LeagueStandings[] = [];
  [...leagueDetails.standings].sort((
    a,
    b,
  ) => b.event_total - a.event_total).forEach((s) => {
    if (standingsThisWeek.length < 3) {
      standingsThisWeek.push({ ...s, rank: standingsThisWeek.length + 1 });
    } else if (
      standingsThisWeek[standingsThisWeek.length - 1].event_total ===
        s.event_total
    ) {
      standingsThisWeek.push({
        ...s,
        rank: standingsThisWeek[standingsThisWeek.length - 1].rank,
      });
    }
  });

  const standingsThisWeekStr = standingsThisWeek.map((s) => {
    const player = leagueDetails.league_entries.find((d) =>
      d.id === s.league_entry
    )!;

    return `${
      rankEmoji(s.rank)
    } <https://draft.premierleague.com/entry/${player.entry_id}/event/${gameInfo.current_event}|${player.entry_name}> (${
      playerName(player)
    }) - ${s.event_total}`;
  }).join("\n");

  const nextGameweek = basicInfo.events.data.find((gw) =>
    gw.id === gameInfo.next_event
  )!;

  const formatDateTime = (input: string) =>
    new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(input));

  return {
    text: `Gameweek ${gameInfo.current_event} is ${
      gameInfo.current_event_finished ? "finished" : "in progress"
    }.

:star: *Here's the current standings after Gameweek ${gameInfo.current_event}* :star:

${standingsStr}

Top three this gameweek:

${standingsThisWeekStr}

Gameweek ${gameInfo.next_event} deadlines:

Trades: ${formatDateTime(nextGameweek.trades_time)}
Free transfers (waivers): ${formatDateTime(nextGameweek.waivers_time)}
Pick team: ${formatDateTime(nextGameweek.deadline_time)}`,
  };
}
