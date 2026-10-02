import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { initializeDatabase } from '../../storage/database';
import { ErrorState, LoadingState } from './AsyncState';

type StartupState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

// No feature provider mounts until schema migrations and first-run seeds have finished.
export const DatabaseGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, themeMode } = useTheme();
  const [state, setState] = useState<StartupState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    initializeDatabase().then(
      () => {
        if (isActive) setState({ status: 'ready' });
      },
      (error: unknown) => {
        if (isActive) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to initialize the database.',
          });
        }
      }
    );
    return () => {
      isActive = false;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  };

  if (state.status === 'ready') return <>{children}</>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {state.status === 'loading' ? <LoadingState /> : <ErrorState message={state.message} onRetry={retry} />}
    </SafeAreaView>
  );
};
