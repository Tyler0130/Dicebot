const Discord = require('discord.js'),
    bot = new Discord.Client({
        forceFetchUsers: true,
        autoReconnect: true,
        guildCreateTimeout: 0
    });

var settings = require("./settings.json"); // Grab all the settings.
var voice = false;
var hours = new Date().getHours();
var minutes = new Date().getMinutes();
var log = (msg) => {
    bot.sendMessage(settings.channelid, msg);
};

const winston = require('winston');
winston.add(winston.transports.File, {
    filename: 'logs/dicebot.log'
});
winston.remove(winston.transports.Console);

function GetUptime() {
    let sec_num = parseInt(process.uptime(), 10);
    let days = Math.floor(sec_num / 86400);
    sec_num %= 86400;
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (days < 10) days = "0" + days;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    let time = '';
    if (days != '00') time += `${days} ${days == '01' ? 'day' : 'days'} `;
    if (days != '00' || hours != '00') time += `${hours} ${hours == '01' ? 'hour' : 'hours'} `;
    if (days != '00' || hours != '00' || minutes != '00') time += `${minutes} ${minutes == '01' ? 'minute' : 'minutes'} `;
    if (days != '00' || hours != '00' || minutes != '00' || seconds != '00') time += `${seconds} ${seconds == '01' ? 'second' : 'seconds'} `;
    return time;
}

let unit = ['', 'K', 'M', 'G', 'T', 'P'];

function bytesToSize(input, precision) {
    let index = Math.floor(Math.log(input) / Math.log(1024));
    if (unit >= unit.length) return input + ' B';
    return (input / Math.pow(1024, index)).toFixed(precision) + ' ' + unit[index] + 'B'
}

const Stats = {
    Messages: {
        Received: 0,
        Sent: 0
    }
};

bot.on("ready", () => {
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    let bootup = [
        '```xl',
        'BOOT TIME STATISTICS',
        `• Time     : ${hours}:${minutes}`,
        `• Users    : ${bot.users.length}`,
        `• Servers  : ${bot.servers.length}`,
        `• Channels : ${bot.channels.length}`,
        '```'
    ];
    log(bootup);
    bot.setPlayingGame("with dice");
});

bot.on('message', msg => {
    var params = msg.content.split(" ").slice(1);
    var prefix = settings.prefix;
    var lmsg = msg.content.toLowerCase();
    var commands = [
        '```',
        `All of these commands are prefixed with ${prefix}`,
        '',
        `roll       - Are you feeling lucky? Roll the dice!`,
        `           - The roll command can take arguments such as 2d20, which`,
        `           - will throw two, twenty sided dice.`,
        ``,
        `ping       - Another server response.`,
        `help       - Alias for commands.`,
        `commands   - Pulls up the command list.`,
        '',
        `The following commands are for the server owner ONLY.`,
        '',
        `info       - This will display memory usage and uptime of the bot.`,
        `voice      - This will toggle TTS for the output of the bot.`,
        `reboot     - Restarts the bot.`,
        '```'
    ];

    if (msg.author.equals(bot.user)) {
        Stats.Messages.Sent++
    } else {
        Stats.Messages.Received++;
    }

    // Ignore messages if they don't start with the prefix.
    if (!lmsg.startsWith(prefix)) {
        return;
    } else

    // Make the bot ignore itself and other bots.
    if (msg.author.equals(bot.user) || msg.author.bot) {
        return;
    } else

    // If the bot is PM'ed reply with the commands
    if (msg.channel.isPrivate) {
        bot.sendMessage(msg, commands);
    } else

    // If the user issues help or commands, display the commands
    if (lmsg.startsWith(prefix + "help") || lmsg.startsWith(prefix + "commands")) {
        bot.sendMessage(msg, commands);
    } else

    // Typical ping/pong server response.
    if (lmsg.startsWith(prefix + "ping")) {
        bot.sendMessage(msg, `Pong! \`${Date.now() - msg.timestamp} ms\``);
    } else

    // Doing (prefix)roll without any arguments will roll a single default die of 6 sides,
    // when supplied with an argument 2d20 for example, it'll roll two twenty sided die.
    //TODO Fix upper and lower limits for the dice roll.
    if (lmsg.startsWith(prefix + "roll")) {
        let name = params[0];
        if (!name) {
            bot.sendMessage(msg, msg.author + " rolled a " + Math.floor(Math.random() * settings.defaultdie + 1), {
                tts: voice
            });
        } else {
            var output = [];
            var dice = name.split("d")[0];
            var face = name.split("d")[1];
            for (var i = 0; i < dice; i++) {
                output.push(Math.floor(Math.random() * face + 1));
            }
            bot.sendMessage(msg, msg.author + " rolled a " + output, {
                tts: voice
            });
        }
    } else

    // This is for the server owner to toggle TTS on or off (default off);
    // TODO Owner arrays, with add/remove commands.
    if (lmsg.startsWith(prefix + "voice")) {
        if (msg.author.id != settings.owner) {
            return;
        } else {
            if (voice === true) {
                voice = false;
                bot.sendMessage(msg, "Voice disabled.");
            } else {
                voice = true;
                bot.sendMessage(msg, "Voice enabled.", {
                    tts: voice
                });
            }
        }
    }

    if (lmsg.startsWith(prefix + "info")) { // Stats code given to me by datitisev from the DiscordAPI server.
        if (msg.author.id != settings.owner) {
            return;
        } else {
            let MemoryUsing = bytesToSize(process.memoryUsage().rss, 3)
            let Uptime = GetUptime();

            let message = [
                '```xl',
                'STATISTICS',
                `• Memory Usage : ${MemoryUsing}`,
                `• Uptime: ${Uptime}`,
                `• Messages Sent: ${Stats.Messages.Sent}`,
                `• Messages Received: ${Stats.Messages.Received}`,
                '```',
            ];
            bot.sendMessage(msg, message);
        }
    } else

    // This is the "reboot" command, without any auto starting modules (pm2 and forever for example)
    // will just terminate the process and require a manual start. But when used in conjuntion with
    // said modules, it will restart the process thus creating the reboot like system.
    //
    // Once you've started the reboot command, when promted "Are you sure?" if you respond with anything
    // other than "yes" or "y" the reboot sequence will be aborted.

    if (lmsg.startsWith(prefix + "reboot")) {
        if (msg.author.id != settings.owner) {
            return;
        } else {
            // Prompting the user for a response.
            bot.awaitResponse(msg, "Are you sure?")
                .then(nextMessage => {
                    // Expecting 'yes' or 'y' as short hand.
                    if (nextMessage.content.toLowerCase() === "yes" || nextMessage.content.toLowerCase() === "y") {
                        bot.sendMessage(settings.channelid, "Rebooting...").then(() => {
                            process.exit();
                        });
                    } else {
                        // If it gets anything else other than 'yes/y' will abort the reboot.
                        bot.sendMessage(msg, "Reboot aborted.");
                    }
                });
        }
    } else
});

// Catch discord.js errors
bot.on('error', e => {
    winston.error(e);
});
bot.on('warn', e => {
    winston.warn(e);
});
bot.on('debug', e => {
    winston.info(e);
});

bot.loginWithToken(settings.token);
