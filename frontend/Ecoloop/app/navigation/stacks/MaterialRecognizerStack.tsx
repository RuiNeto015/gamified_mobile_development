import {createStackNavigator} from "@react-navigation/stack";
import * as React from "react";
import {
    MaterialRecognizerHomeScreen,
    MaterialRecognizerResultScreen
} from "../../screens/materialRecognizer/index";

const MaterialRecognizerStack = () => {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MaterialRecognizerHomeScreen"
                component={MaterialRecognizerHomeScreen}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="MaterialRecognizerResultScreen"
                component={MaterialRecognizerResultScreen}
                options={{headerShown: false}}
            />
        </Stack.Navigator>
    );
};

export default MaterialRecognizerStack;
