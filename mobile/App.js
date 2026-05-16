import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './app/Context';

import HomeScreen from './app/screens/HomeScreen';
import TraceScreen from './app/screens/TraceScreen';
import ResultScreen from './app/screens/ResultScreen';
import SimulationScreen from './app/screens/SimulationScreen';
import OperationsScreen from './app/screens/OperationsScreen';

const Tab = createBottomTabNavigator();
const CommandStack = createNativeStackNavigator();
const AnalysisStack = createNativeStackNavigator();

function CommandStackScreen() {
  return (
    <CommandStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <CommandStack.Screen name="Home" component={HomeScreen} />
      <CommandStack.Screen name="Trace" component={TraceScreen} />
    </CommandStack.Navigator>
  );
}

function AnalysisStackScreen() {
  return (
    <AnalysisStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <AnalysisStack.Screen name="Result" component={ResultScreen} />
      <AnalysisStack.Screen name="Simulation" component={SimulationScreen} />
    </AnalysisStack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <NavigationContainer theme={{ colors: { background: '#0A0A0A' } }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#141414',
              borderTopColor: '#2A2A2A',
            },
            tabBarActiveTintColor: '#F59E0B',
            tabBarInactiveTintColor: '#9CA3AF',
          }}
        >
          <Tab.Screen name="Command" component={CommandStackScreen} />
          <Tab.Screen name="Analysis" component={AnalysisStackScreen} />
          <Tab.Screen name="Operations" component={OperationsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
