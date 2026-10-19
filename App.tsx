import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { Routes } from './src/routes';

// Suprime warning cosmético do Expo Go em dispositivos físicos quando o servidor
// de desenvolvimento não consegue estabelecer conexão HMR (Hot Module Replacement).
// Não afeta a funcionalidade do aplicativo.
LogBox.ignoreLogs(['Cannot connect to Expo CLI']);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}