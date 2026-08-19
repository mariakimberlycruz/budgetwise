import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_BUDGET_PERCENTAGES,
  DEFAULT_CURRENCY,
  DEFAULT_THEME,
} from '@/constants/settings';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSettings, updateSettings as updateSettingsApi } from '@/services/settings';
import { configureMoney } from '@/utils/money';

const SettingsContext = createContext(undefined);

export const DEFAULT_SETTINGS = {
  currency: DEFAULT_CURRENCY,
  budget_needs: DEFAULT_BUDGET_PERCENTAGES.needs,
  budget_savings: DEFAULT_BUDGET_PERCENTAGES.savings,
  budget_wants: DEFAULT_BUDGET_PERCENTAGES.wants,
  theme: DEFAULT_THEME,
};

export function SettingsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const systemScheme = useColorScheme();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Apply the active currency app-wide whenever it changes.
  useEffect(() => {
    configureMoney({ code: settings.currency });
  }, [settings.currency]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const saved = await getSettings();
        if (!cancelled) {
          setSettings((prev) => ({ ...prev, ...saved }));
        }
      } catch {
        // keep defaults on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const updateSettings = useCallback(
    async (patch) => {
      const previous = settings;
      // Apply optimistically so theme/currency update immediately.
      setSettings((prev) => ({ ...prev, ...patch }));
      if (!isAuthenticated) {
        return;
      }
      try {
        const saved = await updateSettingsApi({
          currency: previous.currency,
          budget_needs: previous.budget_needs,
          budget_savings: previous.budget_savings,
          budget_wants: previous.budget_wants,
          theme: previous.theme,
          ...patch,
        });
        setSettings((prev) => ({ ...prev, ...saved }));
      } catch (err) {
        // Roll back the optimistic update and surface the error to the caller.
        setSettings(previous);
        throw err;
      }
    },
    [isAuthenticated, settings],
  );

  const colorScheme = useMemo(() => {
    if (settings.theme === 'dark') {
      return 'dark';
    }
    if (settings.theme === 'light') {
      return 'light';
    }
    return systemScheme ?? 'light';
  }, [settings.theme, systemScheme]);

  const value = useMemo(
    () => ({ settings, updateSettings, colorScheme }),
    [settings, updateSettings, colorScheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
