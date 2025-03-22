import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = "AppDatabase.db";
const database_version = "1.0";
const database_displayname = "SQLite React Native Database";
const database_size = 200000;

// Open and setup the database
export const getDatabaseConnection = async () => {
    const db = await SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
    );

    // Create the table if it doesn't exist
    await db.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            token TEXT,
            user_id TEXT,
            avatar_id TEXT,
            avatar_base_64_full TEXT,
            avatar_base_64_half TEXT,
            api_token TEXT
        );`
    );

    // Ensure the single row exists
    await db.executeSql(
        `INSERT OR IGNORE INTO users (id, token, user_id, avatar_id, avatar_base_64_full, avatar_base_64_half,
                                      api_token)
         VALUES (1, NULL, NULL, NULL, NULL, NULL, NULL);`
    );

    return db;
};

export const setFieldToLocalDatabase = async (field, value) => {
    try {
        const db = await getDatabaseConnection();
        await db.executeSql(`UPDATE users SET ${field} = ? WHERE id = 1;`, [value]);
    } catch (error) {
        console.error(`Error updating ${field} in database:`, error);
    }
};

export const getFieldFromLocalDatabase = async (field) => {
    try {
        const db = await getDatabaseConnection();
        const result = await db.executeSql(`SELECT ${field} FROM users WHERE id = 1;`);
        if (result[0]?.rows?.length > 0) {
            return result[0].rows.item(0)[field];
        }
    } catch (error) {
        console.error(`Error retrieving ${field} from database:`, error);
    }
    return null;
};

export const removeFieldFromLocalDatabase = async (field) => {
    try {
        const db = await getDatabaseConnection();
        await db.executeSql(`UPDATE users SET ${field} = NULL WHERE id = 1;`);
        return true;
    } catch (error) {
        console.error(`Error removing ${field} from database:`, error);
        return false;
    }
};
export const getAllFieldsFromLocalDatabase = async () => {
    try {
        const db = await getDatabaseConnection();
        const result = await db.executeSql(`SELECT * FROM users WHERE id = 1;`);
        if (result[0]?.rows?.length > 0) {
            return result[0].rows.item(0);
        }
    } catch (error) {
        console.error("Error retrieving all user data from database:", error);
    }
    return {};
};
