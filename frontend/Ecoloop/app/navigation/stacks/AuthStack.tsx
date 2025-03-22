import {createStackNavigator} from "@react-navigation/stack";
import * as React from "react";
import {AvatarSelectionScreen, LoginScreen, LookalikeAvatarScreen, RegisterScreen} from "../../screens/auth";

const AuthStack = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AvatarSelectionScreen"
        component={AvatarSelectionScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LookalikeAvatarScreen"
        component={LookalikeAvatarScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
