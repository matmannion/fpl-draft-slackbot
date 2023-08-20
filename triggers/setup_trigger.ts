import { Trigger } from "deno-slack-api/types.ts";
import SetupWorkflow from "../workflows/setup_workflow.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the SetupWorkflow workflow.
 */
const trigger: Trigger<typeof SetupWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup FPL Draft updates",
  description: "Sets a FPL Draft league for a channel to get updates.",
  workflow: `#/workflows/${SetupWorkflow.definition.callback_id}`,
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
