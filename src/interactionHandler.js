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

    // Spawn Inital Select Menu For Selecting/Creating Movie Wheels when user uses slash command
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'movie-menu') {
            const lists = storage.getLists();

            // Create the select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('menu-select-list')
                .setPlaceholder('📂 Select a Movie Wheel to manage...');

            // Always Add "Create New" option
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('➕ Create New Wheel')
                    .setValue('option_create_new')
                    .setDescription('Start a fresh movie wheel')
            );

            // Add existing lists AKA Movie Wheels as options for selection
            lists.forEach(list => {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`📄 ${list}`)
                        .setValue(list)
                );
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);
            try {
                await interaction.reply({ content: '🗄️ **Load a Wheel**', components: [row] });
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }

        }
        return;
    }

    // Handle when User Picked a Wheel or Created new Wheel
    if (interaction.isStringSelectMenu()) {
        const selectedValue = interaction.values[0];

        // Handle If the user Created a New Wheel
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
            try {
                await interaction.showModal(modal);
            } catch (err) {
                console.error(`Failed to show modal. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
            return;
        }

        // We Handle if an Existing Wheel is Selected, which means we need to Show Buttons
        // We embed the wheel  name into the button IDs using the separator "__"
        const listName = selectedValue;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn-add__${listName}`).setLabel('Add').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`btn-remove__${listName}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`btn-list__${listName}`).setLabel('List').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`btn-spin__${listName}`).setLabel('Spin').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
            new ButtonBuilder().setCustomId(`btn-delete__${listName}`).setLabel('Delete').setStyle(ButtonStyle.Danger)
        );
        try {
            // Update the original Discord UI to remove the select menu and show button controls
            await interaction.update({
                content: `📂 Selected Wheel: **${listName}**\nUse the controls below.`,
                components: [row]
            });
        } catch (err) {
            console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
        }

        return;
    }

    // Handle all the user button clicks
    if (interaction.isButton()) {
        const { action, listName } = parseId(interaction.customId);

        if (action === 'btn-list') {
            const items = storage.getAll(listName);
            try {
                if (items.length === 0) {
                    await interaction.reply({ content: `📭 The wheel **${listName}** is empty.`, ephemeral: true });
                } else {
                    const listString = items.map(i => `**${i.movie}** (by <${i.user}>)`).join('\n- ');
                    await interaction.reply({ content: `📋 Items in **${listName}**:\n- ${listString}`, ephemeral: true });
                }
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        else if (action === 'btn-spin') {
            const result = storage.popRandom(listName);
            // Wrapped in a try/catch to prevent crashes from double-clicks/timeouts/ratelimits/other Discord issues
            try {
                if (result) {
                    const addedById = result.userId ? `<@${result.userId}>` : 'Unknown';
                    const addedByUser = result.user;
                    await interaction.reply(`🎲 From **${listName}** you drew:\n# 🎬 ${result.movie}\n(Added by: ${addedById}; with Name: ${addedByUser})`);
                } else {
                    await interaction.reply({ content: '📭 This wheel is empty, nothing to draw!', ephemeral: true });
                }
            }
            catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        // For Add/Remove, we need to show a modal, to allow user to enter the wheel name
        else if (action === 'btn-add' || action === 'btn-remove') {
            const modalAction = action === 'btn-add' ? 'add' : 'remove';

            const modal = new ModalBuilder()
                .setCustomId(`modal-${modalAction}__${listName}`)
                .setTitle(`${modalAction === 'add' ? 'Add to' : 'Remove from'} ${listName}`);

            const input = new TextInputBuilder()
                .setCustomId('movie-input')
                .setLabel("Movie Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            // Wrapped in a try/catch to prevent crashes from double-clicks/timeouts/ratelimits/other Discord issues
            try {
                await interaction.showModal(modal);
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        // 1. User clicked the first Delete button -> Show confirmation
        else if (action === 'btn-delete') {
            try {
                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`btn-confirm-delete__${listName}`).setLabel('⚠️ Yes, Delete').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`btn-cancel-delete__${listName}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
                );

                await interaction.update({
                    content: `🚨 **WARNING:** Are you sure you want to permanently delete the wheel **${listName}**?\n*This action cannot be undone.*`,
                    components: [confirmRow]
                });
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        // 2. User clicked "Yes, Delete" -> Actually delete it
        else if (action === 'btn-confirm-delete') {
            const success = storage.deleteList(listName);
            try {
                if (success) {
                    await interaction.update({
                        content: `🗑️ The movie wheel **${listName}** was permanently deleted.`,
                        components: []
                    });
                } else {
                    await interaction.reply({ content: '❌ Could not delete the wheel (it may not exist).', ephemeral: true });
                }
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        // 3. User clicked "Cancel" -> Restore the original menu
        else if (action === 'btn-cancel-delete') {
            try {
                const originalRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`btn-add__${listName}`).setLabel('Add').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`btn-remove__${listName}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`btn-list__${listName}`).setLabel('List').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`btn-spin__${listName}`).setLabel('Spin').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
                    new ButtonBuilder().setCustomId(`btn-delete__${listName}`).setLabel('Delete').setStyle(ButtonStyle.Danger)
                );

                await interaction.update({
                    content: `📂 Selected Wheel: **${listName}**\nDeletion cancelled. Use the controls below.`,
                    components: [originalRow]
                });
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }

        return;
    }

    // Handling what UI changes happen after the user enters input in a Modal (text box) and submits
    if (interaction.isModalSubmit()) {
        const { action, listName } = parseId(interaction.customId);

        // If user was entering text for a wheel name, we need to bring up the buttons once the wheel is sucessfully created
        if (interaction.customId === 'modal-create-list') {
            const newListName = interaction.fields.getTextInputValue('list-name-input');
            const success = storage.createList(newListName);
            try {
                if (success) {
                    // Immediately show the button controls for interacting with the new wheel
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`btn-add__${newListName}`).setLabel('Add').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`btn-remove__${newListName}`).setLabel('Remove').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId(`btn-list__${newListName}`).setLabel('List').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`btn-spin__${newListName}`).setLabel('Spin').setStyle(ButtonStyle.Primary).setEmoji('🎲'),
                        new ButtonBuilder().setCustomId(`btn-delete__${newListName}`).setLabel('Delete').setStyle(ButtonStyle.Danger)
                    );

                    await interaction.reply({
                        content: `✅ Created new wheel: **${newListName}**`,
                        components: [row]
                    });
                } else {
                    await interaction.reply({ content: '❌ A wheel with that name already exists or the name is invalid.', ephemeral: true });
                }
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }

            return;
        }

        const movieName = interaction.fields.getTextInputValue('movie-input');
        // If user was entering text to add a movie, we need to bring up the outcome of their action to inform the user
        if (action === 'modal-add') {
            const success = storage.add(listName, movieName, interaction.user.username, interaction.user.id);
            try {
                if (success) {
                    await interaction.reply(`✅ Added **${movieName}** to wheel *${listName}*`);
                } else {
                    await interaction.reply({ content: '❌ That movie is already in this wheel.', ephemeral: true });
                }
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }

        }
        // If user was entering text to remove a movie, we need to bring up the outcome of their action to inform the user
        else if (action === 'modal-remove') {
            const success = storage.remove(listName, movieName);
            try {
                if (success) {
                    await interaction.reply(`🗑 Removed **${movieName}** from wheel *${listName}*`);
                } else {
                    await interaction.reply({ content: '❌ Movie not found in this wheel.', ephemeral: true });
                }
            } catch (err) {
                console.error(`Failed to show modal for ${listName}. User may have double-clicked or lagged or Discord may have bugged out.`);
            }
        }
    }
};