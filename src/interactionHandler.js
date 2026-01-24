const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const storage = require('./storage.js');

module.exports = async (interaction) => {
    
    // Handle the initial Slash Command to spawn buttons
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'movie-menu') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn-add').setLabel('Add Movie').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn-remove').setLabel('Remove Movie').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('btn-list').setLabel('List All').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('btn-spin').setLabel('Spin Wheel').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
            );

            await interaction.reply({ content: '🎬 **Movie Wheel Controls**', components: [row] });
        }
        return;
    }

    // Handle Button Clicks
    if (interaction.isButton()) {
        const { customId } = interaction;

        if (customId === 'btn-list') {
            const items = storage.getAll();
            if (items.length === 0) {
                await interaction.reply({ content: '📭 The movie wheel is empty.', ephemeral: true });
            } else {
                // Format the display list; creates a new array populated with the results (a movie name, and a username)
                const listString = items.map(i => `**${i.movie}** (Added by ${i.user})`).join('\n- ');
                await interaction.reply({ content: `📋 Current items:\n- ${listString}`, ephemeral: true });
            }
        } 
        
        else if (customId === 'btn-spin') {
            const result = storage.popRandom();
            if (result) {
                await interaction.reply(`🎲 You drew: **${result.movie}**\n👤 Added by: ${result.user}`);
            } else {
                await interaction.reply({ content: '📭 The list is empty, nothing to draw!', ephemeral: true });
            }
        }
        // For Add/Remove, we need user input, so we show a Modal
        else if (customId === 'btn-add' || customId === 'btn-remove') {
            const action = customId === 'btn-add' ? 'add' : 'remove';
            
            const modal = new ModalBuilder()
                .setCustomId(`modal-${action}`)
                .setTitle(`${action === 'add' ? 'Add' : 'Remove'} Movie`);

            const input = new TextInputBuilder()
                .setCustomId('movie-input')
                .setLabel("Movie Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(input);
            modal.addComponents(firstActionRow);
            
            await interaction.showModal(modal);
        }
        return;
    }

    // Handle Modal Submissions (Data Entry)
    if (interaction.isModalSubmit()) {
        const movieName = interaction.fields.getTextInputValue('movie-input');

        if (interaction.customId === 'modal-add') {
            // We now pass the username to storage
            const success = storage.add(movieName, interaction.user.username);
            
            if (success) {
                await interaction.reply(`✅ Added: **${movieName}**`);
            } else {
                await interaction.reply({ content: '❌ That movie is already in the wheel.', ephemeral: true });
            }
        } 
        
        else if (interaction.customId === 'modal-remove') {
            const success = storage.remove(movieName);
            if (success) {
                await interaction.reply(`🗑 Removed: **${movieName}**`);
            } else {
                await interaction.reply({ content: '❌ Movie not found.', ephemeral: true });
            }
        }
    }
};