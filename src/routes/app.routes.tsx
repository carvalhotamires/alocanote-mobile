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
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
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
