# Fantasy Premier League Draft Slackbot

A draft for the [FPL Draft](https://draft.premierleague.com/) game, heavily inspired by https://www.fplbot.app/
but only designed to give regular updates.

To install, use the Slack CLI:

- [Install and authorize the Slack CLI](https://api.slack.com/automation/cli/install)
- Run `slack deploy`

The bot's simple and designed for two workflows, one to setup with the league ID (you can find this in the URLs
when you're navigating around the FPL Draft site) and another to post updates immediately if desired. Otherwise,
it will set up a trigger to post updates at 8am UK every Tuesday morning.
