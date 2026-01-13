// Destructing: Importing a set amount of things from SOMETHING (in this case, the discord.js package)
// Client: A new class that represents our bot
// Intents: a set of permissions that a discord bot can use, in order to gain access to a set of events
require('dotenv').config();
const {Client, IntentsBitField} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// log a message to console when the bot is ready(started up sucessfully)
// Note here that 'c' represents the client
client.on('clientReady', (c) => {
    console.log(`${c.user.tag} The bot is online.`);
});

// bot logins using its token
client.login(process.env.TOKEN);