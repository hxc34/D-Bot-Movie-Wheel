// This file must be run once after any change is made to the list of commands for the bot
// But after that, does not need to be run unless a command is changed
// Thus, it is not connected to index.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Define our commands
const commands = [
    new SlashCommandBuilder()
        .setName('movie-add')
        .setDescription('Adds an item to the Movie Wheel')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('The item to add')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('movie-remove')
        .setDescription('Removes an item from the Movie Wheel')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('The item to remove')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('movie-list')
        .setDescription('Shows all items in the Movie Wheel'),

        new SlashCommandBuilder()
        .setName('movie-spin')
        .setDescription('Spins the wheel to Randomly pick a movie and removes it from the wheel'),    
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