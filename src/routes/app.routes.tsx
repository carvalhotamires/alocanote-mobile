import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Notebooks } from '../screens/Notebooks';
import { MinhasReservas } from '../screens/MinhasReservas';
import { NovaReserva } from '../screens/NovaReserva';
import { AppStackParamList, AppTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4B0082',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1.5,
          borderTopColor: '#D1D5DB',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Notebooks"
        component={Notebooks}
        options={{
          tabBarLabel: 'Notebooks',
        }}
      />
      <Tab.Screen
        name="MinhasReservas"
        component={MinhasReservas}
        options={{
          tabBarLabel: 'Minhas Reservas',
        }}
      />
    </Tab.Navigator>
  );
}

export function AppRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NovaReserva"
        component={NovaReserva}
        options={{
          title: 'Agendar Notebook',
          headerStyle: { backgroundColor: '#4B0082' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}
