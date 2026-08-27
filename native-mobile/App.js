import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Users, Inbox, TrendingUp, Sliders } from 'lucide-react-native';

import { FinanceProvider, useFinance } from './src/context/FinanceContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BrothersScreen } from './src/screens/BrothersScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { TransfersScreen } from './src/screens/TransfersScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { COLORS } from './src/utils/theme';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { currentUser, loading } = useFinance();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#10b981' />
      </View>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: styles.tabLabel
        }}
      >
        <Tab.Screen
          name='Dashboard'
          component={DashboardScreen}
          options={{
            tabBarLabel: 'الرئيسية',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
          }}
        />
        <Tab.Screen
          name='Brothers'
          component={BrothersScreen}
          options={{
            tabBarLabel: 'الإخوة والسلع',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
          }}
        />
        <Tab.Screen
          name='Requests'
          component={RequestsScreen}
          options={{
            tabBarLabel: 'الطلبات',
            tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />
          }}
        />
        <Tab.Screen
          name='Transfers'
          component={TransfersScreen}
          options={{
            tabBarLabel: 'العمليات',
            tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />
          }}
        />
        <Tab.Screen
          name='Settings'
          component={SettingsScreen}
          options={{
            tabBarLabel: 'الإعدادات',
            tabBarIcon: ({ color, size }) => <Sliders size={size} color={color} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <StatusBar style='light' backgroundColor='#0b1320' />
      <MainNavigator />
    </FinanceProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b1320',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabBar: {
    backgroundColor: '#131f33',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800'
  }
});
