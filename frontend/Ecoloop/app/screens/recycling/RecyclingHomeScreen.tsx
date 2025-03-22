import React, {useEffect, useState} from "react";
import {Image, SafeAreaView, StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "@ui-kitten/components";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faQrcode} from "@fortawesome/free-solid-svg-icons";
import config from "../../../config";
import BackgroundContainer from "../../common/BackgroundContainer";
import CustomModal from "../../common/ModalError";
import {getFieldFromLocalDatabase} from '../../database/database';
import {fetchUserData} from "../../services/UserApi";
import CommonTitle from "../../common/CommonTitle";

const USER_ID = "6737a9caa26a6418b970f764";
const API_ENDPOINT = config.API_ENDPOINT;
const USER_API = `${API_ENDPOINT}/user/${USER_ID}`;

const QRIcon = ({color = "#000"}) => (
  <FontAwesomeIcon icon={faQrcode} size={32} color={color}/>
);

function RecyclingHomeScreen() {
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const theme = useTheme();

  const [userData, setUserData] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [avatarId, setAvatarId] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleQrCodePress = () => {
    if (userData) {
      navigation.navigate("ReadingQrCodeScreen", {
        userData: userData,
        rpmData: {
          avatarId: avatarId,
          token: token
        }
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [token, userId, avatarId] = await Promise.all([
          getFieldFromLocalDatabase("token"),
          getFieldFromLocalDatabase("user_id"),
          getFieldFromLocalDatabase("avatar_id")
        ]);

        if (token) {
          console.log('Token found:', token);
          setToken(token);
        } else {
          console.warn("No token found");
        }

        if (userId) {
          console.log('User ID found:', userId);
          setUserId(userId);
        } else {
          console.warn("No user found");
        }

        if (avatarId) {
          console.log('Avatar ID found:', avatarId);
          setAvatarId(avatarId);
        } else {
          console.warn("No avatarId found");
        }

        const user = await fetchUserData(userId);
        setUserData(user);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) initializeData();
  }, [isFocused]);

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <CommonTitle text="Vamos reciclar" />

        </View>

        <View style={styles.imgContainer}>
          <Image style={styles.img} source={require("../../images/lets_recycle.png")}/>
        </View>

        {userData && (
          <>
            <View style={styles.userDataContainer}>
              <Text category="h6" style={{marginBottom: 0, textAlign: 'center'}}>
                {userData.ecoMonthProgressDto.monthEcoXp > 0
                  ? `Parabéns, ${userData.username}!`
                  : `Vamos começar, ${userData.username}?`
                }
              </Text>
              <Text category="h6" style={{marginTop: 10, textAlign: 'center'}}>
                {userData.ecoMonthProgressDto.monthEcoXp > 0
                  ? `Ganhou ${userData.ecoMonthProgressDto.monthEcoXp} Eco XP este mês!`
                  : `Comece a acumular Eco XP e ajude o meio ambiente!`
                }
              </Text>
            </View>

            {userData.todayContributions < 2 &&
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleQrCodePress}
                        accessoryLeft={() => <QRIcon color={theme["background-basic-color-1"]}/>}
                    >
                        Ler o QR code
                    </Button>
                </View>
            }

            {/*Reached the limit*/}
            {userData.todayContributions >= 2 &&
                <View style={styles.blockedSection}>
                    <Image style={styles.imgWarning} source={require("../../images/confetti.png")}/>
                    <Text category="h6" style={{marginTop: 10, textAlign: 'center'}}>
                        Atingiu o seu limite diário
                    </Text>
                    <Text category="h6" style={{marginTop: 2, textAlign: 'center'}}>
                        de 2 reciclagens!
                    </Text>
                </View>
            }

          </>
        )}

        <CustomModal
          visible={errorVisible}
          onClose={() => setErrorVisible(false)}
          isError={true}
          errorMessage={errorMessage}
        />

      </SafeAreaView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#000000",
  },
  img: {
    width: 300,
    height: 300,
  },
  imgWarning: {
    width: 60,
    height: 60,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 60,
  },
  cameraWrapper: {
    width: 400,
    height: 550,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: "center",
    paddingVertical: 0,
  },
  imgContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  userDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  blockedSection: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 70,
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