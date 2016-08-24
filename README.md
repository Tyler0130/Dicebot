# Dice Bot
Do you play Dungeons & Dragons, or other table top games that require dice?
Well, this discord bot may just be what you're looking for.

This simple bot will roll any dice from 1 to a thousand (Not recommended).

Straight out of the metaphorical box, if you /roll, you’ll get a single six
sided die, now if you happened to /roll 5d20, you’ll be rolling five, twenty
sided die, all of this is configurable inside the _settings.json_ file.

It even comes with a TTS toggle, which means you can enable voice output for
all of your dice rolls so those who are away from the computer getting a drink
can still follow alone with who rolled what die.

Commands
All of these commands are prefixed with what ever you set "prefix" to inside
the _settings.json_ file.

* roll - Are you feeling lucky? Roll the dice! The roll command can take
arguments such as 2d20 which will throw two, twenty sided dice.
* ping - A server response.
* help - Alias for commands.
* commands - Pulls up the command list.

The following commands are for the server owner ***ONLY***.

* info - This will display memory usage and uptime of the bot.
* voice - This will toggle TTS for the output of the bot.
* reboot - Restarts the bot.
