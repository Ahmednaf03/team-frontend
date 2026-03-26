import toast from 'react-hot-toast';
import { getOfflineRequests, removeOfflineRequest } from './offlineSyncDB';
import axiosClient from './axiosClient';

/**
 * Initializes the global window 'online' event listener.
 * When a connection is restored, it iterates chronologically
 * through IndexedDB, submitting each queued request.
 */
export const initSyncManager = () => {
  window.addEventListener('online', async () => {
    console.log('[Sync Manager] Re-established network connection. Checking offline queue...');
    
    // 1. Grab all encrypted offline requests (decrypted on retrieval)
    const requests = await getOfflineRequests();

    if (requests.length === 0) {
      return; 
    }

    toast.loading(`Syncing ${requests.length} offline actions...`, { id: 'sync-toast' });

    let successCount = 0;
    let failCount = 0;

    // 2. Replay each request chronologically
    for (const req of requests) {
      try {
        await axiosClient({
          url: req.url,
          method: req.method,
          data: req.data,
          headers: req.headers
        });

        // 3. Remove from local DB on success (200 OK)
        await removeOfflineRequest(req.id);
        successCount++;

      } catch (err) {
        console.error(`[Sync Manager] Failed to replay request ${req.id}`, err);
        failCount++;
        // If the request fails again (e.g. server validation, 500 error), 
        // it stays in IndexedDB to be retried next time or requires manual intervention.
      }
    }

    // 4. Update UI Feedback
    if (successCount === requests.length) {
      toast.success('All offline actions synced successfully!', { id: 'sync-toast' });
    } else {
      toast.error(`Synced ${successCount} actions. ${failCount} failed.`, { id: 'sync-toast' });
    }
  });
};
