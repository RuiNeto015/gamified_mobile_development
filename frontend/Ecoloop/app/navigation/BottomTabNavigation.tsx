import {faGears, faMagnifyingGlass, faRecycle, faTrophy, faUser,} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {DefaultTheme} from "@react-navigation/native";
import {Layout, useTheme} from "@ui-kitten/components";
import * as React from "react";
import SettingsScreen from "../screens/settings/SettingsScreen";
import {MaterialRecognizerStack, RecyclingStack} from "./stacks";
import {MonthlyChallenge} from "../screens/monthlyChallenge";
import AvatarStack from "./stacks/AvatarStack";

const BottomTabNavigation = () => {
  const Tab = createBottomTabNavigator();
  const theme = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme["background-basic-color-1"],
    },
  };

  const activeIconColor = theme["color-primary-500"];
  const inactiveIconColor = theme["background-alternative-color-1"];

  return (
    <Layout style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 60,
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            shadowColor: theme["background-basic-color-1"],
            shadowOpacity: 0.15,
            shadowOffset: {width: 0, height: 4},
            shadowRadius: 10,
            elevation: 5,
            backgroundColor: "#bab86c",
            // backgroundColor: theme["background-basic-color-1"],
          },
        }}
      >
        <Tab.Screen
          name="AvatarStack"
          component={AvatarStack}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faUser}
                size={20}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            ),
          }}
        />
        <Tab.Screen
          name="MonthlyChallengeScreen"
          component={MonthlyChallenge}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faTrophy}
                size={20}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            ),
          }}
        />
        <Tab.Screen
          name="RecyclingStack"
          component={RecyclingStack}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faRecycle}
                size={30}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            ),
          }}
          listeners={({navigation}) => ({
            tabPress: () => {
              navigation.navigate('RecyclingStack', {screen: 'RecyclingHomeScreen'});
            },
          })}
        />
        <Tab.Screen
          name="MaterialRecognizerStack"
          component={MaterialRecognizerStack}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                size={20}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <FontAwesomeIcon
                icon={faGears}
                size={20}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </Layout>
  );
};

export default BottomTabNavigation;
