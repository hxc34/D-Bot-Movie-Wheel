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
                await interaction.reply({ content: `📋 Current items:\n- ${items.join('\n- ')}`, ephemeral: true });
            }
        } 
        
        else if (customId === 'btn-spin') {
            const item = storage.popRandom();
            if (item) {
                await interaction.reply(`🎲 You drew: **${item}**`);
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
        const item = interaction.fields.getTextInputValue('movie-input');

        if (interaction.customId === 'modal-add') {
            const success = storage.add(item);
            if (success) {
                await interaction.reply(`✅ Added: **${item}**`);
            } else {
                await interaction.reply({ content: '❌ That movie is already in the wheel.', ephemeral: true });
            }
        } 
        
        else if (interaction.customId === 'modal-remove') {
            const success = storage.remove(item);
            if (success) {
                await interaction.reply(`🗑 Removed: **${item}**`);
            } else {
                await interaction.reply({ content: '❌ Movie not found.', ephemeral: true });
            }
        }
    }
};