const fs = require('fs');
const path = require('path');
// Constants
const LISTS_DIR = './lists';
const DELIMITER = ' ::: '; // Unique separator

// Initialize data array
let items = [];

// Ensure the lists directory exists on startup
if (!fs.existsSync(LISTS_DIR)) {
    try {
        fs.mkdirSync(LISTS_DIR);
        console.log(`Created directory: ${LISTS_DIR}`);
    } catch (err) {
        console.error('Error creating lists directory:', err);
    }
}

// --- HELPER FUNCTIONS ---

// Generates a safe file path and prevents directory traversal
function getFilePath(listName) {
    // Remove characters that aren't letters, numbers, spaces, underscores, or hyphens
    const safeName = listName.replace(/[^a-z0-9_\- ]/gi, '').trim();
    return path.join(LISTS_DIR, `${safeName}.json`);
}

// Reads a specific list file and returns the array
function readList(listName) {
    const filePath = getFilePath(listName);
    
    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(data);
        return Array.isArray(items) ? items : [];
    } catch (error) {
        console.error(`Error reading list ${listName}:`, error);
        return [];
    }
}

// Saves an array to a specific list file
function saveList(listName, items) {
    const filePath = getFilePath(listName);
    try {
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
        return true;
    } catch (err) {
        console.error(`Error saving list ${listName}:`, err);
        return false;
    }
}

// Helper to split "User ::: Movie" into parts
function parseItem(rawString) {
    const parts = rawString.split(DELIMITER);
    return { user: parts[0], movie: parts[1] };
}

module.exports = {
    // 1. Returns an array of available list names (filenames without .json)
    getLists: () => {
        try {
            const files = fs.readdirSync(LISTS_DIR);
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
        } catch (err) {
            console.error('Error getting lists:', err);
            return [];
        }
    },

    // 2. Creates a new empty list file
    createList: (listName) => {
        const filePath = getFilePath(listName);
        if (fs.existsSync(filePath)) return false; // List already exists

        return saveList(listName, []);
    },

    // 3. Get all items from a specific list
    getAll: (listName) => {
        return readList(listName).map(parseItem);
    },
    
    // 4. Add item to a specific list
    add: (listName, movie, username) => {
        const items = readList(listName);
        
        // Check duplicates based on the movie name part only
        const exists = items.some(i => parseItem(i).movie.toLowerCase() === movie.toLowerCase());
        if (exists) return false;

        // Store as: Username ::: MovieName
        const entry = `${username}${DELIMITER}${movie}`;
        items.push(entry);
        
        saveList(listName, items);
        return true;
    },
    
    // 5. Remove item from a specific list
    remove: (listName, movie) => {
        const items = readList(listName);
        
        // Find index by checking the movie part
        const index = items.findIndex(i => parseItem(i).movie.toLowerCase() === movie.toLowerCase());
        
        if (index === -1) return false;
        // remove one element from the items array, starting at the specified 'index'
        items.splice(index, 1);
        saveList(listName, items);
        return true;
    },

    // 6. Pop random item from a specific list
    popRandom: (listName) => {
        const items = readList(listName);
        
        if (items.length === 0) return null;

        // Pick a random index
        const randomIndex = Math.floor(Math.random() * items.length);
        const rawItem = items[randomIndex];
        
        // Remove it from the array
        items.splice(randomIndex, 1);
        saveList(listName, items);
        
        return parseItem(rawItem);
    }
};