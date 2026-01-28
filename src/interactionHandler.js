const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder 
} = require('discord.js');

const storage = require('./storage.js');

// Helper to extract [action, listName] from ids like "btn-add__horror"
const parseId = (id) => {
    const parts = id.split('__');
    return { 
        action: parts[0], 
        listName: parts[1] || null 
    };
};

module.exports = async (interaction) => {
    
    // --- 1. HANDLE SLASH COMMAND (Spawn the Dropdown) ---
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'movie-menu') {
            const lists = storage.getLists();

            // Create the dropdown menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('menu-select-list')
                .setPlaceholder('📂 Select a Movie Wheel to manage...');

            // Add "Create New" option always
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('➕ Create New Wheel')
                    .setValue('option_create_new')
                    .setDescription('Start a fresh movie wheel')
            );

            // Add existing lists as options
            lists.forEach(list => {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`📄 ${list}`)
                        .setValue(list)
                );
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: '🗄️ **Load a Wheel**', components: [row] });
        }
        return;
    }

    // --- 2. HANDLE SELECT MENU (User Picked a Wheel or "Create New") ---
    if (interaction.isStringSelectMenu()) {
        const selectedValue = interaction.values[0];

        // Case A: Create New Wheel
        if (selectedValue === 'option_create_new') {
            const modal = new ModalBuilder()
                .setCustomId('modal-create-list')
                .setTitle('Create New Wheel');

            const input = new TextInputBuilder()
                .setCustomId('list-name-input')
                .setLabel("Wheel Name")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("e.g. Comedy, Action, Animated")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
            return;
        }

        // Case B: Existing Wheel Selected -> Show Buttons
        // We embed the wheel  name into the button IDs using the separator "__"
        const listName = selectedValue;
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn-add__${listName}`).setLabel('Add').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`btn-remove__${listName}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`btn-list__${listName}`).setLabel('List').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`btn-spin__${listName}`).setLabel('Spin').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
        );

        // Update the original message to remove the dropdown and show controls
        await interaction.update({ 
            content: `📂 Selected Wheel: **${listName}**\nUse the controls below.`, 
            components: [row] 
        });
        return;
    }

    // --- 3. HANDLE BUTTON CLICKS ---
    if (interaction.isButton()) {
        const { action, listName } = parseId(interaction.customId);

        if (action === 'btn-list') {
            const items = storage.getAll(listName);
            if (items.length === 0) {
                await interaction.reply({ content: `📭 The wheel **${listName}** is empty.`, ephemeral: true });
            } else {
                const listString = items.map(i => `**${i.movie}** (by ${i.user})`).join('\n- ');
                await interaction.reply({ content: `📋 Items in **${listName}**:\n- ${listString}`, ephemeral: true });
            }
        } 
        
        else if (action === 'btn-spin') {
            const result = storage.popRandom(listName);
            if (result) {
                await interaction.reply(`🎲 From **${listName}** you drew:\n# 🎬 ${result.movie}\n(Added by: ${result.user})`);
            } else {
                await interaction.reply({ content: '📭 This wheel is empty, nothing to draw!', ephemeral: true });
            }
        }

        // For Add/Remove, show a modal, passing the listName along
        else if (action === 'btn-add' || action === 'btn-remove') {
            const modalAction = action === 'btn-add' ? 'add' : 'remove';
            
            // ID becomes: modal-add__horror
            const modal = new ModalBuilder()
                .setCustomId(`modal-${modalAction}__${listName}`)
                .setTitle(`${modalAction === 'add' ? 'Add to' : 'Remove from'} ${listName}`);

            const input = new TextInputBuilder()
                .setCustomId('movie-input')
                .setLabel("Movie Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
        return;
    }

    // --- 4. HANDLE MODAL SUBMISSIONS ---
    if (interaction.isModalSubmit()) {
        const { action, listName } = parseId(interaction.customId);

        // Handle "Create List"
        if (interaction.customId === 'modal-create-list') {
            const newListName = interaction.fields.getTextInputValue('list-name-input');
            const success = storage.createList(newListName);

            if (success) {
                // Immediately show the controls for the new list
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`btn-add__${newListName}`).setLabel('Add').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`btn-remove__${newListName}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`btn-list__${newListName}`).setLabel('List').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`btn-spin__${newListName}`).setLabel('Spin').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
                );

                await interaction.reply({ 
                    content: `✅ Created new wheel: **${newListName}**`, 
                    components: [row] 
                });
            } else {
                await interaction.reply({ content: '❌ A wheel with that name already exists or the name is invalid.', ephemeral: true });
            }
            return;
        }

        const movieName = interaction.fields.getTextInputValue('movie-input');

        if (action === 'modal-add') {
            const success = storage.add(listName, movieName, interaction.user.username);
            if (success) {
                await interaction.reply(`✅ Added **${movieName}** to wheel *${listName}*`);
            } else {
                await interaction.reply({ content: '❌ That movie is already in this wheel.', ephemeral: true });
            }
        } 
        
        else if (action === 'modal-remove') {
            const success = storage.remove(listName, movieName);
            if (success) {
                await interaction.reply(`🗑 Removed **${movieName}** from wheel *${listName}*`);
            } else {
                await interaction.reply({ content: '❌ Movie not found in this wheel.', ephemeral: true });
            }
        }
    }
};