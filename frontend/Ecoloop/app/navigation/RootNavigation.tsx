import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigation from './BottomTabNavigation';
import {NavigationContainer} from '@react-navigation/native';
import {AuthStack} from './stacks';
import {getFieldFromLocalDatabase} from '../database/database';


function RootNavigation() {
  const Stack = createStackNavigator();

  // State to track whether the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Tracks initialization

  const checkAndNavigateToHome = async () => {
    try {
      const user_id = await getFieldFromLocalDatabase('user_id');
      const avatar_id = await getFieldFromLocalDatabase('avatar_id');
      const token = await getFieldFromLocalDatabase('token');
      const api_token = await getFieldFromLocalDatabase('api_token');

      if (user_id && avatar_id && token && api_token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking fields from database:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAndNavigateToHome();
  }, []);

  if (loading) {
    return (
      <></>
    );
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={isLoggedIn ? "BottomTabNavigation" : "AuthStack"}
      >
        <Stack.Screen name="BottomTabNavigation" component={BottomTabNavigation}/>
        <Stack.Screen name="AuthStack" component={AuthStack}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigation;