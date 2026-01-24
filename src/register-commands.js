// This file must be run once after any change is made to the list of commands for the bot
// But after that, does not need to be run unless a command is changed
// Thus, it is not connected to index.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Define our commands
const commands = [
    new SlashCommandBuilder()
        .setName('movie-menu')
        .setDescription('Opens the Movie Wheel Control Panel'),           
]
.map(command => command.toJSON());

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.GUILD_ID
            ),
            {body: commands}
        );

        console.log('Slash commands registered sucessfully');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();