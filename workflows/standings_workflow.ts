import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendStandingsMessageFunction } from "../functions/send_standings_message_function.ts";

/**
 * The SendStandingsMessageWorkFlow will retrieve the standings message
 * from the datastore and send it to the specified channel, on a schedule.
 */
export const SendStandingsMessageWorkflow = DefineWorkflow({
  callback_id: "send_standings_message",
  title: "Send Standings Message",
  description: "Posts the standings for a FPL Draft league on a schedule.",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
});

SendStandingsMessageWorkflow.addStep(SendStandingsMessageFunction, {
  channel: SendStandingsMessageWorkflow.inputs.channel,
});

export default SendStandingsMessageWorkflow;