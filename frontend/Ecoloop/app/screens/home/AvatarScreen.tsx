import React, {useEffect, useRef, useState} from "react";
import {Animated, StyleSheet, TouchableOpacity} from "react-native";
import {Alert, Button, Image, Spinner, Text, View} from "native-base";
import BackgroundContainer from "../../common/BackgroundContainer";
import {getFieldFromLocalDatabase} from "../../database/database";
import {getImageUrlAndBase64} from "../../services/apiService";
import Share from "react-native-share";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import CommonTitle from "../../common/CommonTitle";
import config from "../../../config";

function AvatarScreen() {
  const navigation = useNavigation();
  const [imageBase64, setImageBase64] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [dayStreak, setDayStreak] = useState(null);
  const [userId, setUserId] = useState(null);
  const [rewardCount, setRewardCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  const loadAvatar = async () => {
    try {
      const {url, base64} = await getImageUrlAndBase64("full_body");
      setImageBase64(base64);
      setImageUrl(url);
    } catch (err) {
      console.error("Error loading avatar:", err.message);
      setError("Erro ao carregar o avatar. Tente novamente.");
    }
  };

  const handleTakeReward = async () => {
    try {
      if (rewardCount <= 0) return;

      // Make the API call using fetch
      const response = await fetch(
        `${config.API_ENDPOINT}/user/${userId}/takeReward`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const res = await response.text();
        console.log(res)
        navigation.navigate('RecyclingStack', {
          screen: 'GiftScreen',
        });
      } else {
        const errorData = await response.text();
        console.error('Error taking reward 1 :', errorData);
        Alert.alert('Erro', 'Não foi possível resgatar o presente');
      }
    } catch (error) {
      console.error('Error taking reward 2 :', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar resgatar o presente');
    }
  };

  const fetchUserData = async () => {
    try {
      const id = await getFieldFromLocalDatabase("user_id");
      setUserId(id);

      if (id) {
        const responseVisit = await fetch(`${config.API_ENDPOINT}/user/${id}/visit`, {
          method: "POST",
        });
        if (!responseVisit.ok) {
          console.error("Failed to mark visit user data:", responseVisit.statusText);
        }

        const response = await fetch(`${config.API_ENDPOINT}/user/${id}`, {
          method: "GET",
        });

        if (response.ok) {
          const result = await response.json();
          setDayStreak(result.streakVisits);
          setRewardCount(result.rewardCounter)
        } else {
          console.error("Failed to fetch user data:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      (async () => {
        await Promise.all([loadAvatar(), fetchUserData()]);
      })();
    }
  }, [isFocused]);

  useEffect(() => {
    // Stop any running animations
    badgeScale.stopAnimation();
    badgeOpacity.stopAnimation();

    if (!loading && dayStreak !== null) {
      if (rewardCount > 0) {
        // Start bounce animation if dayStreak >= rewardStreak
        Animated.sequence([
          Animated.timing(badgeOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(badgeScale, {
                toValue: 1.1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(badgeScale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      } else {
        // Ensure badge is hidden when dayStreak < rewardStreak
        Animated.timing(badgeOpacity, {
          toValue: 100,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [loading, dayStreak, rewardCount]);

  const handleRetry = () => {
    (async () => {
      setLoading(true);
      await Promise.all([loadAvatar(), fetchUserData()]);
      setLoading(false);
    })();
  };

  const handleClaimGift = () => {
    navigation.navigate("ClaimGiftScreen");
  };

  const handleEditAvatar = () => {
    navigation.navigate("AvatarEditScreen");
  };

  const handleShareWithFriends = async () => {
    if (!imageUrl) {
      console.error("No image to share!");
      return;
    }

    try {
      await Share.open({
        title: "Partilhar Avatar",
        message: "Olha o meu avatar!",
        url: imageUrl,
        type: "image/png",
      });
    } catch (error) {
      if (error.message !== "User did not share") {
        console.error("Error sharing image:", error.message);
      }
    }
  };

  return (
    <BackgroundContainer>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="green.500" accessibilityLabel="Loading avatar"/>
          <Text style={styles.loadingText}>A carregar avatar...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={handleRetry} colorScheme="red" style={styles.retryButton}>
            Tentar novamente
          </Button>
        </View>
      ) : (
        <>
          <CommonTitle text="O seu avatar!"/>
          {imageBase64 && (
            <View style={styles.imageWrapper}>
              <Image
                source={{uri: `data:image/png;base64,${imageBase64}`}}
                alt="Avatar"
                style={styles.avatarImage}
              />
              {/* Badge overlay with animation */}
              {dayStreak && rewardCount > 0 &&
                  <Text style={[
                    styles.claimText,
                    rewardCount === 1 ? styles.singleRewardText : styles.multiRewardText
                  ]}>
                    {rewardCount === 1 ? 'Clique para abrir o 🎁' : `Clique para abrir um 🎁 de ${rewardCount}`}
                  </Text>
              }

              <Animated.View
                style={[
                  styles.streakBadge,
                  {
                    opacity: badgeOpacity,
                    transform: [{scale: badgeScale}],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={rewardCount > 0 ? handleTakeReward : null}
                  disabled={rewardCount === 0}
                >
                  <Text style={styles.streakText}>
                    {(() => {
                      const iconMap = [
                        '🌱', '🌿', '🌴', '🌳', '🔥',
                        '🌱', '🌿', '🌴', '🌳', '🔥'
                      ];

                      const index = (dayStreak - 1) % 5;
                      return `${iconMap[index]} ${dayStreak} visitas em streak`;
                    })()}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button onPress={handleEditAvatar} colorScheme="gray" style={styles.roundedButton}>
              Editar avatar
            </Button>
            <Button onPress={handleShareWithFriends} colorScheme="green" style={styles.roundedButton}>
              Partilhar com amigos
            </Button>
          </View>
        </>
      )}
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    width: "90%",
    marginTop: 40,
  },
  roundedButton: {
    width: "100%",
    borderRadius: 30,
    marginBottom: 10,
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 300,
    height: 550,
    position: "relative",
  },
  avatarImage: {
    width: 300,
    height: 575,
    marginTop: 80,
    marginBottom: 20,
  },
  streakBadge: {
    position: "absolute",
    top: 25,
    left: -35,
    backgroundColor: "#e6f8e4",
    borderColor: "#037025",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  claimText: {
    position: "absolute",
    top: 2,
    left: -19,
    fontSize: 13,
  },
  singleRewardText: {
    left: -7,
  },
  multiRewardText: {
    left: -31,
  },
  streakText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 10,
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "700",
    borderColor: "#151515",
    fontStyle: "italic",
    color: "#151515",
    textAlign: "center",
    marginTop: 4,
  }
});

export default AvatarScreen;