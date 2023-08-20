import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const Datastore = DefineDatastore({
  name: "config",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    league: {
      type: Schema.types.integer,
    },
    author: {
      type: Schema.slack.types.user_id,
    },
  },
});
type DatastoreSchema = typeof Datastore.definition;

export default Datastore;
