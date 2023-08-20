import { Manifest } from "deno-slack-sdk/mod.ts";
import { SetupWorkflow } from "./workflows/setup_workflow.ts";
import { SendStandingsMessageWorkflow } from "./workflows/standings_workflow.ts";
import SetupDatastore from "./datastores/setup_datastore.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "CreateiQ FPL Draft",
  description: "Automatically post updates about the CiQ draft FPL league",
  icon: "assets/fpl_app_icon.png",
  workflows: [
    SetupWorkflow,
    SendStandingsMessageWorkflow,
  ],
  outgoingDomains: [
    "draft.premierleague.com",
  ],
  datastores: [
    SetupDatastore,
  ],
  botScopes: [
    "commands",
    "channels:read",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "datastore:read",
    "datastore:write",
    "triggers:read",
    "triggers:write",
    "users:read",
  ],
});
