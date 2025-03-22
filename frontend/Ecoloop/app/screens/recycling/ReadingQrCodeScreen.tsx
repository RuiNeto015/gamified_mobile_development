import React, {useEffect, useRef, useState} from "react";
import {Image, Linking, SafeAreaView, StyleSheet, View} from "react-native";
import {Button, Card, Modal, Text, useTheme} from "@ui-kitten/components";
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCamera, faXmark} from "@fortawesome/free-solid-svg-icons";
import NetInfo from "@react-native-community/netinfo";
import config from "../../../config";
import BackgroundContainer from "../../common/BackgroundContainer";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import {Pressable} from "native-base";
import {useAppState} from '@react-native-community/hooks'
import CommonTitle from "../../common/CommonTitle";

const API_ENDPOINT = config.API_ENDPOINT;

const CloseIcon = ({color}) => <FontAwesomeIcon icon={faXmark} size={32} color={color}/>;

function RecyclingHomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const cameraRef = useRef(null);

  const [user, setUserData] = useState(route.params.userData);
  const [rpmData, setRpmData] = useState(route.params.rpmData);

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === "active";

  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [scanning, setScanning] = useState(false);

  const tips = [
    "Certifique-se de que há boa iluminação.",
    "O QR code deve cobrir perto da totalidade da câmara.",
  ];

  const openCameraSettings = () => {
    Linking.openSettings();
  };

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRecycleOperation = async (token) => {
    try {
      const isConnected = await NetInfo.fetch().then((state) => state.isConnected);
      if (!isConnected) {
        setErrorMessage("Sem internet! Verifique a sua conexão.");
        setErrorVisible(true);
        return;
      }
      const response = await fetch(`${API_ENDPOINT}/user/${user.id}/recycle?qr=` + token);
      if (response.status === 200) {
        const result = await response.json();
        navigation.navigate("SuccessQRScreen", {data: result, rpmData : rpmData});
      } else {
        setErrorMessage("Houve um pequeno erro, tente novamente.");
        setErrorVisible(true);
      }
    } catch (error) {
      console.error("Error in recycle operation:", error);
      setErrorMessage("Houve um pequeno erro, tente novamente.");
      setErrorVisible(true);
      setScanning(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (!scanning && codes.length > 0) {
        setScanning(true);
        const token = codes[0].value;
        handleRecycleOperation(token);
      }
    }
  });

  const handleCancelPress = () => {
    navigation.navigate("RecyclingHomeScreen");
  };

  if (!hasPermission) {
    return (
      <BackgroundContainer>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.noPermissionContainer}>
            <Text style={styles.noPermissionText}>Não tem permissão para usar a câmara!</Text>
            <Pressable onPress={openCameraSettings}>
              <Text style={styles.permissionLinkText}>Altere as permissões nas Definições</Text>
            </Pressable>
            <Image source={require("../../images/camera_permission_denied.png")} resizeMode="cover"/>
          </View>
        </SafeAreaView>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.safeArea}>
        <CommonTitle text="Aponte a câmara"/>
        <Text style={styles.instructionText2}>para o QR code no contentor!</Text>
        <Text style={styles.tipText}>{tips[currentTipIndex]}</Text>
        <View style={styles.container}>
          {device && (
            <View style={styles.cameraWrapper}>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                codeScanner={codeScanner}
                photoQualityPrioritization="speed"
              />
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button onPress={handleCancelPress} status="danger"
                  accessoryLeft={() => <CloseIcon color={theme["background-basic-color-1"]}/>}>
            Cancelar
          </Button>
        </View>

        <Modal visible={errorVisible} backdropStyle={styles.backdrop} onBackdropPress={() => setErrorVisible(false)}>
          <Card disabled={true}>
            <Text category="h6" style={{marginBottom: 10}}>Ocorreu algum erro</Text>
            <Text>{errorMessage}</Text>
            <Button style={{marginTop: 20}} onPress={() => setErrorVisible(false)}>OK</Button>
          </Card>
        </Modal>
      </SafeAreaView>
    </BackgroundContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 60,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraWrapper: {
    width: 350,
    height: 450,
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noPermissionText: {
    fontSize: 21,
    color: "#333333",
    marginBottom: 10,
  },
  userDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  instructionText1: {
    fontSize: 21,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: "#000000"
  },
  instructionText2: {
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: "#000000"
  },
  permissionLinkText: {
    fontSize: 16,
    color: "#1E90FF",
    textDecorationLine: "underline",
  },
  tipText: {
    fontSize: 16,
    fontFamily: 'Arial',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
    color: "#666666"
  },
  buttonContainer: {
    alignItems: "center",
    paddingBottom: 70,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default RecyclingHomeScreen;