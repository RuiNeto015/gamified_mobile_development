import {createStackNavigator} from "@react-navigation/stack";
import * as React from "react";
import {AvatarEditScreen, AvatarScreen,} from "../../screens/home/index";

const AvatarStack = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AvatarScreen"
        component={AvatarScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AvatarEditScreen"
        component={AvatarEditScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
};

export default AvatarStack;
