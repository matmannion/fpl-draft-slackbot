import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

import SetupDatastore from "../datastores/setup_datastore.ts";
import { SendStandingsMessageWorkflow } from "../workflows/standings_workflow.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This custom function will take the initial form input, store it
 * in the datastore and create an event trigger to listen for
 * user_joined_channel events in the specified channel.
 */
export const SetupFunction = DefineFunction({
  callback_id: "setup_function",
  title: "FPL Draft Setup",
  description: "Sets up FPL Draft updates in a channel",
  source_file: "functions/setup_function.ts",
  input_parameters: {
    properties: {
      league: {
        type: Schema.types.integer,
        description: "The league ID",
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to post in",
      },
      author: {
        type: Schema.slack.types.user_id,
        description:
          "The user ID of the person who created the welcome message",
      },
    },
    required: ["league", "channel"],
  },
});

export default SlackFunction(
  SetupFunction,
  async ({ inputs, client }) => {
    const { channel, league, author } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof SetupDatastore.definition
    >({
      datastore: SetupDatastore.name,
      item: { id: uuid, channel, league, author },
    });

    if (!putResponse.ok) {
      return { error: `Failed to save setup: ${putResponse.error}` };
    }

    // Search for any existing triggers for the welcome workflow
    const triggers = await findMessageTrigger(client, channel);
    if (triggers.error) {
      return { error: `Failed to lookup existing triggers: ${triggers.error}` };
    }

    // Create a trigger if none exists
    if (!triggers.exists) {
      const newTrigger = await saveMessageTrigger(client, channel);
      if (!newTrigger.ok) {
        return {
          error: `Failed to create scheduled trigger: ${newTrigger.error}`,
        };
      }
    }

    return { outputs: {} };
  },
);

/**
 * findUserJoinedChannelTrigger returns if the user_joined_channel trigger
 * exists for the "Send Welcome Message" workflow in a channel.
 */
export async function findMessageTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ error?: string; exists?: boolean; trigger_id?: string }> {
  // Collect all existing triggers created by the app
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  if (!allTriggers.ok) {
    return { error: allTriggers.error };
  }

  // Find scheduled triggers for the "Send Standings Message"
  // workflow in the specified channel
  const triggers = allTriggers.triggers.filter((trigger) => (
    trigger.workflow.callback_id ===
      SendStandingsMessageWorkflow.definition.callback_id &&
    trigger.type === TriggerTypes.Scheduled &&
    trigger.inputs.channel?.value === channel
  ));

  // Return if any matching triggers were found
  const exists = triggers.length > 0;
  return { exists };
}

/**
 * saveMessageTrigger creates a new scheduled trigger
 * for the "Send Standings Message" workflow in a channel.
 */
export async function saveMessageTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ ok: boolean; error?: string }> {
  // Start tomorrow at 8am
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 1);
  scheduleDate.setHours(8, 0, 0, 0);

  const triggerResponse = await client.workflows.triggers.create<
    typeof SendStandingsMessageWorkflow.definition
  >({
    name: "Every Tuesday at 8am",
    workflow:
      `#/workflows/${SendStandingsMessageWorkflow.definition.callback_id}`,
    type: TriggerTypes.Scheduled,
    description: "Send the FPL Draft standings at 8am every Tuesday morning",
    inputs: {
      channel: { value: channel },
    },
    schedule: {
      start_time: scheduleDate.toUTCString(),
      frequency: {
        type: "weekly",
        repeats_every: 1,
        on_days: ["Tuesday"],
      },
    },
  });

  if (!triggerResponse.ok) {
    return { ok: false, error: triggerResponse.error };
  }
  return { ok: true };
}
