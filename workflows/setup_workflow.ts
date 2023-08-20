import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SetupFunction } from "../functions/setup_function.ts";

/**
 * The SetupWorkflow opens a form where the user creates standings updates.
 * The trigger for this workflow is found in `/triggers/setup_trigger.ts`
 */
export const SetupWorkflow = DefineWorkflow({
  callback_id: "setup_workflow",
  title: "Setup FPL Draft updates",
  description: "Sets a FPL Draft league for a channel to get updates.",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

/**
 * This step uses the OpenForm Slack function. The form has two
 * inputs -- a FPL Draft league id and a channel id for that message to
 * be posted in.
 */
const SetupWorkflowForm = SetupWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Setup FPL Draft updates",
    submit_label: "Submit",
    description: ":soccer: Post FPL Draft updates in a channel automatically!",
    interactivity: SetupWorkflow.inputs.interactivity,
    fields: {
      required: ["channel", "league"],
      elements: [
        {
          name: "league",
          title: "FPL Draft League ID",
          type: Schema.types.integer,
        },
        {
          name: "channel",
          title: "Select a channel to post this message in",
          type: Schema.slack.types.channel_id,
          default: SetupWorkflow.inputs.channel,
        },
      ],
    },
  },
);

/**
 * This step takes the form output and passes it along to a custom
 * function which sets the posts up.
 * See `/functions/setup_function.ts` for more information.
 */
SetupWorkflow.addStep(SetupFunction, {
  league: SetupWorkflowForm.outputs.fields.league,
  channel: SetupWorkflowForm.outputs.fields.channel,
  author: SetupWorkflow.inputs.interactivity.interactor.id,
});

/**
 * This step uses the SendEphemeralMessage Slack function.
 * An ephemeral confirmation message will be sent to the user
 * creating the welcome message, after the user submits the above
 * form.
 */
SetupWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: SetupWorkflow.inputs.interactivity.interactor.id,
  message:
    `FPL Draft League updates for this channel have been successfully set up! :soccer:`,
});

export default SetupWorkflow;
