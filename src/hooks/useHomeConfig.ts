import { useState, useEffect, useCallback } from 'react';
import type { HomeConfig } from '@/types/admin';
import { defaultHomeConfig } from '@/data/mock-admin';

const HOME_CONFIG_KEY = 'dnb_home_config';

export function useHomeConfig() {
  const [config, setConfig] = useState<HomeConfig>(() => {
    try {
      const stored = localStorage.getItem(HOME_CONFIG_KEY);
      if (stored) return JSON.parse(stored) as HomeConfig;
    } catch { /* ignore */ }
    return defaultHomeConfig;
  });

  // Re-read on storage events (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === HOME_CONFIG_KEY && e.newValue) {
        try { setConfig(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const saveConfig = useCallback((next: HomeConfig) => {
    setConfig(next);
    localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(next));
  }, []);

  return { config, saveConfig };
}
