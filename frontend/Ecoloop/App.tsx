import React, {useEffect} from "react";
import {AppRegistry, PermissionsAndroid} from "react-native";
import {NativeBaseProvider} from "native-base";
import {ApplicationProvider} from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import light_theme from "./themes/light_theme.json";
import messaging from "@react-native-firebase/messaging";
import PushNotification, {Importance} from "react-native-push-notification";
import config from "./config";
import {Camera} from "react-native-vision-camera";
import RootNavigation from "./app/navigation/RootNavigation";

PushNotification.createChannel({
  channelId: "ecoloop",
  channelName: "ecoloop",
  channelDescription: "",
  playSound: true,
  soundName: "notification.mp3",
  importance: Importance.HIGH,
  vibrate: true,
});

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  PushNotification.localNotification({
    message: remoteMessage.notification.body,
    title: remoteMessage.notification.title,
    channelId: "ecoloop",
  });
});

async function registerDeviceToken(token: string) {
  return fetch(config.API_ENDPOINT + "/notifications/device-token", {
    method: "post",
    body: JSON.stringify({token: token}),
    headers: {"Content-Type": "application/json"},
  });
}

function App() {
  const [hasPermission, setHasPermission] = React.useState(false);

  useEffect(() => {
    const checkCameraPermission = async () => {
      const permission = await Camera.getCameraPermissionStatus();
      if (permission === "authorized") {
        setHasPermission(true);
      } else {
        const newPermission = await Camera.requestCameraPermission();
        setHasPermission(newPermission === "authorized");
      }
    };

    checkCameraPermission();
  }, []);

  async function requestUserPermission() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  async function getToken() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      registerDeviceToken(token);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      PushNotification.localNotification({
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        channelId: "ecoloop",
      });
    });

    return unsubscribe;
  }, []);

  return (
      <ApplicationProvider {...eva} theme={{...eva.light, ...light_theme}}>
        <NativeBaseProvider>
          <RootNavigation/>
        </NativeBaseProvider>
      </ApplicationProvider>
  );
}

function HeadlessCheck({isHeadless}: { isHeadless: boolean }) {
  return isHeadless ? null : <App/>;
}

AppRegistry.registerComponent("main", () => HeadlessCheck);

export default App;