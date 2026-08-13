import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getHealth } from '@/services/health';
import { API_BASE_URL } from '@/utils/api-config';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [apiStatus, setApiStatus] = useState('checking');
  const [health, setHealth] = useState(undefined);

  const refreshHealth = useCallback(async () => {
    setApiStatus('checking');
    try {
      const result = await getHealth();
      setHealth(result);
      setApiStatus('online');
    } catch {
      setHealth(undefined);
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const value = useMemo(
    () => ({ apiBaseUrl: API_BASE_URL, apiStatus, health, refreshHealth }),
    [apiStatus, health, refreshHealth],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
