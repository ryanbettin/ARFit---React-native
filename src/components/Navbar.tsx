import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//@ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import Historico from '../screens/Historico';
import Metas from '../screens/Metas';
import Perfil from '../screens/Perfil';

const Tab = createBottomTabNavigator();
const PRIMARY_COLOR = '#0776A0';
const INACTIVE_COLOR = '#999999';

export default function Navbar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 5,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Grupos':
              iconName = 'grid-outline';
              break;
            case 'Histórico':
              iconName = 'time-outline';
              break;
            case 'Metas':
              iconName = 'checkmark-done-outline';
              break;
            case 'Perfil':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 6 : 4,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      })}
    >

      <Tab.Screen name="Grupos" component={HomeScreen} />
      <Tab.Screen name="Histórico" component={Historico} />
      <Tab.Screen name="Metas" component={Metas} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
