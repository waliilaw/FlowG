/**
 * Hook for managing 0G Network status and initialization
 */

import { useState, useEffect, useCallback } from 'react';
import type { NetworkStatusInfo } from '@/lib/0g';
import { initializeZGNetwork } from '@/lib/0g';

export function useZGNetwork() {
  const [status, setStatus] = useState<NetworkStatusInfo>({
    compute: 'disconnected',
    storage: 'disconnected',
    da: 'disconnected',
    chain: 'disconnected',
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeNetwork = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await initializeZGNetwork();
      updateStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize 0G Network');
      console.error('Failed to initialize 0G Network:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const updateStatus = useCallback(() => {
    // For now, return a default status - this would need a client instance
    setStatus({
      compute: 'connected',
      storage: 'connected',
      chain: 'connected',
      da: 'connected'
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  const reconnect = async () => {
    await initializeNetwork();
  };

  return {
    status,
    isInitializing,
    error,
    reconnect,
    updateStatus,
  };
}