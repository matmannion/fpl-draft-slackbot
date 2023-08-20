import { Trigger } from "deno-slack-api/types.ts";
import SendStandingsMessageWorkflow from "../workflows/standings_workflow.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the SendStandingsMessage workflow.
 */
const trigger: Trigger<typeof SendStandingsMessageWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Post FPL Draft standings",
  description: "Posts FPL Draft standings for the current channel.",
  workflow: `#/workflows/${SendStandingsMessageWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default trigger;
