const fs = require('fs');
const DATA_FILE = './movie_data.json';

// Initialize data array
let items = [];

// Check if the file does NOT exist
if (!fs.existsSync(DATA_FILE)) {
    // Create the file with an empty array
    items = [];
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
        console.log('Created new data file.');
    } catch (err) {
        console.error('Error creating data file:', err);
    }
} else {
    // File exists, so read it
    try {
        items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (!Array.isArray(items)) items = [];
    } catch (error) {
        console.error('Error reading data file:', error);
        items = [];
    }
}


// Save function (internal use)
function saveData() {
    try {
    // null for the replacer parameter; null means no filtering — all properties of the original object are included for stringification.
    // 2 → Each nested level is indented with 2 space for redability; Can be a number (# of spaces) or a string (e.g., '\t' for tabs)
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

// Export functions to be used by other js files
module.exports = {
    getAll: () => items,
    
    add: (item) => {
        if (items.includes(item)) return false;
        items.push(item);
        saveData();
        return true;
    },
    
    remove: (item) => {
        const index = items.indexOf(item);
        if (index === -1) return false;
        // remove one element from the items array, starting at the specified 'index'
        items.splice(index, 1);
        saveData();
        return true;
    }
};