const storage = require('./storage.js');

module.exports = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'movie-add') {
        const item = interaction.options.getString('item');
        const success = storage.add(item);
        
        if (success) {
            await interaction.reply(`✅ Added: **${item}**`);
        } else {
            await interaction.reply({ content: '❌ That movie is already in the wheel.', ephemeral: true });
        }
    } 
    
    else if (commandName === 'movie-remove') {
        const item = interaction.options.getString('item');
        const success = storage.remove(item);

        if (success) {
            await interaction.reply(`🗑 Removed: **${item}**`);
        } else {
            await interaction.reply({ content: '❌ Movie not found.', ephemeral: true });
        }
    } 
    
    else if (commandName === 'movie-list') {
        const items = storage.getAll();
        if (items.length === 0) {
            await interaction.reply('📭 The movie wheel is empty.');
        } else {
            await interaction.reply(`📋 Current items:\n- ${items.join('\n- ')}`);
        }
    }
};