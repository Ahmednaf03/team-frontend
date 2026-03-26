import Dexie from 'dexie';
import { encrypt, decrypt } from './encryptionService';

// Initialize Dexie database
const db = new Dexie('offlineSyncDB');

// Define database schema
// id is auto-incremented. We index 'timestamp' for sorted retrieval.
db.version(1).stores({
  requests: '++id, timestamp'
});

/**
 * Adds an intercepted offline request to IndexedDB.
 * The payload is encrypted before storage.
 * @param {Object} config - The Axios request configuration.
 */
export const addOfflineRequest = async (config) => {
  try {
    // Only extract necessary serializable fields from Axios config
    const requestPayload = {
      url: config.url,
      method: config.method,
      data: config.data,       // Typically a JSON string or object
      headers: config.headers,
    };

    // Convert the request payload to a string
    const payloadString = JSON.stringify(requestPayload);

    // Encrypt the payload string using the existing encryption service
    const encryptedPayload = encrypt(payloadString);

    // Store in IndexedDB
    await db.requests.add({
      encryptedData: encryptedPayload,
      timestamp: Date.now(),
    });

    // Notify UI that queue changed
    window.dispatchEvent(new Event('offlineQueueUpdated'));

    console.log('[Offline Sync] Request queued and encrypted successfully.');
  } catch (error) {
    console.error('[Offline Sync] Failed to add offline request:', error);
  }
};

/**
 * Retrieves all offline requests from IndexedDB, sorted by oldest first.
 * The payload is decrypted back to the original request object.
 * @returns {Promise<Array>} List of decrypted request objects with their DB IDs.
 */
export const getOfflineRequests = async () => {
  try {
    // Fetch all requests ordered by timestamp (oldest first for FIFO)
    const storedRequests = await db.requests.orderBy('timestamp').toArray();

    return storedRequests.map((record) => {
      try {
        // Decrypt the payload
        const decryptedString = decrypt(record.encryptedData);
        // Parse back to original object
        const requestPayload = JSON.parse(decryptedString);

        return {
          id: record.id,
          ...requestPayload,
        };
      } catch (err) {
        console.error(`[Offline Sync] Failed to decrypt record ID ${record.id}:`, err);
        return null;
      }
    }).filter(Boolean); // Remove any records that failed to decrypt
  } catch (error) {
    console.error('[Offline Sync] Failed to grab offline requests:', error);
    return [];
  }
};

/**
 * Removes a request from IndexedDB once it has been successfully synced.
 * @param {number} id - The ID of the database record to remove.
 */
export const removeOfflineRequest = async (id) => {
  try {
    await db.requests.delete(id);
    window.dispatchEvent(new Event('offlineQueueUpdated'));
    console.log(`[Offline Sync] Record ID ${id} removed from queue.`);
  } catch (error) {
    console.error(`[Offline Sync] Failed to remove record ID ${id}:`, error);
  }
};

export default db;
