import React, { useState, useEffect } from 'react';
import { Badge, Tooltip } from 'antd';
import { DisconnectOutlined, SyncOutlined } from '@ant-design/icons';
import { getOfflineRequests } from '../../services/offlineSyncDB';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);

  const checkQueue = async () => {
    const queue = await getOfflineRequests();
    setQueueCount(queue.length);
  };

  useEffect(() => {
    // Check queue size initially
    checkQueue();

    const handleOnline = () => {
      setIsOnline(true);
      // Let the sync manager replay requests, then UI clears 
      setTimeout(checkQueue, 3500); 
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Custom event triggered by addOfflineRequest
    window.addEventListener('offlineQueueUpdated', checkQueue);

    // We can also poll once every few seconds if we suspect missed events
    const pollId = setInterval(checkQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineQueueUpdated', checkQueue);
      clearInterval(pollId);
    };
  }, []);

  // Don't render anything if online and queue is empty
  if (isOnline && queueCount === 0) return null; 

  return (
    <div style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
      {!isOnline ? (
        <Tooltip title={`${queueCount} actions waiting to sync`}>
          <Badge count={queueCount} color="#f5222d" size="small">
            <DisconnectOutlined style={{ fontSize: '22px', color: '#ff4d4f' }} />
          </Badge>
        </Tooltip>
      ) : (
        <Tooltip title={`Syncing ${queueCount} actions with the server...`}>
          <Badge count={queueCount} color="#1890ff" size="small">
            <SyncOutlined spin style={{ fontSize: '22px', color: '#1890ff' }} />
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};

export default OfflineIndicator;
