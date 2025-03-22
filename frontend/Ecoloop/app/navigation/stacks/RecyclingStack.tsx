import {createStackNavigator} from "@react-navigation/stack";
import * as React from "react";
import {
  QuizQuestionsScreen,
  ReadingQrCodeScreen,
  RecyclingHomeScreen,
  SuccessQRScreen,
  SuccessQuizScreen,
  GiftScreen
} from "../../screens/recycling/index";

const RecyclingStack = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="RecyclingHomeScreen"
    >
      <Stack.Screen
        name="RecyclingHomeScreen"
        component={RecyclingHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="GiftScreen"
        component={GiftScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SuccessQRScreen"
        component={SuccessQRScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SuccessQuizScreen"
        component={SuccessQuizScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuizQuestionsScreen"
        component={QuizQuestionsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ReadingQrCodeScreen"
        component={ReadingQrCodeScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default RecyclingStack;
