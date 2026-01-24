const fs = require('fs');
const DATA_FILE = './movie_data.json';
const DELIMITER = ' ::: '; // Unique separator

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

// Helper to save to the file
function saveData() {
    try {
        // null for the replacer parameter; null means no filtering — all properties of the original object are included for stringification.
        // 2 → Each nested level is indented with 2 space for redability; Can be a number (# of spaces) or a string (e.g., '\t' for tabs)
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
        console.log('Saved Data Sucessfully');
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

// Helper to split "User ::: Movie" into parts
function parseItem(rawString) {
    const parts = rawString.split(DELIMITER);
    return { user: parts[0], movie: parts[1] };
}

// Export functions to be used by other js files
module.exports = {
    // Return object { user, movie }
    getAll: () => items.map(parseItem),
    
    add: (movie, username) => {
        // Check duplicates based on the movie name part only
        const exists = items.some(i => parseItem(i).movie.toLowerCase() === movie.toLowerCase());
        if (exists) return false;

        // Store as: Username ::: MovieName
        const entry = `${username}${DELIMITER}${movie}`;
        items.push(entry);
        saveData();
        return true;
    },
    
    remove: (movie) => {
        // Find index by checking the movie part of the string
        const index = items.findIndex(i => parseItem(i).movie.toLowerCase() === movie.toLowerCase());
        
        if (index === -1) return false;
        // remove one element from the items array, starting at the specified 'index'
        items.splice(index, 1);

        saveData();
        return true;
    },

    popRandom: () => {
        if (items.length === 0) return null;

        // Pick a random index
        const randomIndex = Math.floor(Math.random() * items.length);

        // Get the item
        const rawItem = items[randomIndex];
        
        items.splice(randomIndex, 1);
        saveData();
        
        return parseItem(rawItem);
    }
};