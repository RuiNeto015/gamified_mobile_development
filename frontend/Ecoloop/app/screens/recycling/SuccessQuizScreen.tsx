import React, {useEffect, useState} from "react";
import {SafeAreaView, Image, StyleSheet, View} from "react-native";
import {Button, Text, useTheme, Spinner} from "@ui-kitten/components";
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faGift, faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import BackgroundContainer from "../../common/BackgroundContainer";
import CommonTitle from "../../common/CommonTitle";
import {getImageUrlAndBase64} from "../../services/apiService";


const SuccessQuizScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [imageBase64, setImageBase64] = useState(null);
  const [error, setError] = useState(null);

  const rpmData = route.params?.rpmData || {};

  useEffect(() => {
    if (!isFocused) return;

    const loadAvatar = async () => {
      try {
        setError(null); // Reset error state before loading
        const {base64} = await getImageUrlAndBase64("half_body");
        setImageBase64(base64);
      } catch (err) {
        console.error("Error loading avatar:", err.message);
        setError("Erro ao carregar o avatar. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [isFocused, rpmData]);

  return (
    <BackgroundContainer>
      <SafeAreaView style={styles.safeArea}>
        <Header/>
        <CanvasLoader
          imageBase64={imageBase64}
          loading={loading}
          error={error}
          onRetry={() => setLoading(true)}
        />
        <PrizeSection data={route.params?.data || {}} navigation={navigation} theme={theme}/>
      </SafeAreaView>
    </BackgroundContainer>
  );
};

// Header Component
const Header = () => (
  <View style={styles.headerContainer}>
    <CommonTitle text="Boa, parabéns!"/>
  </View>
);

// Canvas Loader with Spinner, Error Handling, and Retry
const CanvasLoader = ({imageBase64, loading, error, onRetry}) => (
  <View style={styles.canvasContainer}>
    {loading ? (
      <View style={styles.loadingContainer}>
        <Spinner size="large" status="info"/>
        <Text style={styles.loadingText}>Carregando avatar...</Text>
      </View>
    ) : error ? (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={onRetry} status="danger" size="small">
          Tentar novamente
        </Button>
      </View>
    ) : (
      <View style={styles.imageWrapper}>
        <Image
          style={styles.backgroundGif}
          source={{uri: "https://cdn-images-1.medium.com/v2/resize:fit:1200/1*sfzYb5vo_niw6-psPdhUkw.gif"}}
        />
        {/* Avatar Image */}
        {imageBase64 && (
          <Image
            source={{uri: `data:image/png;base64,${imageBase64}`}}
            alt="Avatar"
            style={styles.avatarImage}
          />
        )}
      </View>
    )}
  </View>
);

// Prize Section with Buttons
const PrizeSection = ({data, navigation, theme}) => (
  <View style={styles.prizeContainer}>
    <Text category="h3">Resposta certa!</Text>
    <Text category="h6" style={styles.description}>
      Como recompensa ganhou um presente 🎁
    </Text>

    <View style={styles.buttonContainer}>
      <Button
        onPress={() => navigation.navigate("GiftScreen", {data})}
        accessoryLeft={() => <GiftBox theme={theme}/>}
      >
        Quero abrir!
      </Button>
      <Button
        onPress={() => navigation.navigate("RecyclingHomeScreen")}
        accessoryLeft={() => <ThumbsDownIcon theme={theme}/>}
        status="danger"
      >
        Recusar!
      </Button>
    </View>
  </View>
);

// Custom Icons
const GiftBox = ({theme}) => (
  <FontAwesomeIcon icon={faGift} size={32} color={theme["background-basic-color-1"]}/>
);

const ThumbsDownIcon = ({theme}) => (
  <FontAwesomeIcon icon={faThumbsDown} size={32} color={theme["background-basic-color-1"]}/>
);

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 60,
  },
  headerContainer: {
    alignItems: "center",
  },
  canvasContainer: {
    flex: 1,
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "gray",
    fontSize: 16,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: 400,
    height: 800,
    position: "relative",
  },
  backgroundGif: {
    ...StyleSheet.absoluteFillObject,
    width: 400,
    height: 800,
    resizeMode: 'cover',
    opacity: 0.5
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  prizeContainer: {
    alignItems: "center",
    paddingBottom: 60,
  },
  description: {
    textAlign: "center",
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 20,
  },
});

export default SuccessQuizScreen;