import React, { useEffect, useState } from "react";
import { Button, Layout, Text } from "@ui-kitten/components";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundContainer from "../../common/BackgroundContainer";
import config from "../../../config";
import { fetchUserData } from "../../services/UserApi";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSave, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  getFieldFromLocalDatabase,
  removeFieldFromLocalDatabase,
} from "../../database/database";
import { equipAsset } from "../../services/rpmService";
import {
  getImageUrlAndBase64,
  sendItem,
  updateUsingItems,
} from "../../services/apiService";
import CommonTitle from "../../common/CommonTitle";

const API_ENDPOINT = config.API_ENDPOINT;

const CloseIcon = ({ color }) => (
  <FontAwesomeIcon icon={faXmark} size={25} color={color} />
);
const SaveIcon = ({ color }) => (
  <FontAwesomeIcon icon={faSave} size={25} color={color} />
);

function AvatarEditScreen() {
  const navigation = useNavigation();
  const [totalAssets, setTotalAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState({});
  const [avatarId, setAvatarId] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  //For sending an item
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const initializeData = async () => {
    setLoading(true);
    try {
      const [token, userId, avatarId] = await Promise.all([
        getFieldFromLocalDatabase("token"),
        getFieldFromLocalDatabase("user_id"),
        getFieldFromLocalDatabase("avatar_id"),
      ]);

      if (token) setToken(token);
      if (userId) setUserId(userId);
      if (avatarId) setAvatarId(avatarId);

      const user = await fetchUserData(userId);
      const unlocking_response = await fetch(`${API_ENDPOINT}/avatar/unlocking?userId=${userId}`)

      const unlocking = await unlocking_response.json()

      const allIds = [...user.usingAssets, ...user.availableAssets, ...unlocking.map(u => Object.keys(u)).flat()];
      const body = JSON.stringify({ ids: allIds });

      const response = await fetch(`${API_ENDPOINT}/avatar/getByList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.ok && unlocking_response.ok) {
        const assets = await response.json();

        for (var i = 0; i < assets.length; i++) {
            for(var j = 0; j < unlocking.length; j++) {
              if (assets[i].id in unlocking[j]) {
                assets[i].unlocking = unlocking[j][assets[i].id]
              }
            }
        }

        setTotalAssets(assets);

        const initialSelected = {};
        user.usingAssets.forEach((id) => {
          const asset = assets.find((item) => item.id === id);
          if (asset) initialSelected[asset.type] = id;
        });
        setSelectedAssets(initialSelected);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) initializeData();
  }, [isFocused]);

  const categorizedAssets = totalAssets.reduce((categories, asset) => {
    let type;

    if ("unlocking" in asset && asset.unlocking.length < 4) {
      console.log("true");
      type = "unlocking";
    } else {
      type = asset.type;
    }

    if (!categories[type]) categories[type] = [];
    categories[type].push(asset);
    return categories;
  }, {});

  //console.log(categorizedAssets["unlocking"]);

  const allTypes = [
    "headwear",
    "facemask",
    "glasses",
    "top",
    "bottom",
    "footwear",
    "unlocking",
  ];

  allTypes.forEach((type) => {
    if (!categorizedAssets[type]) categorizedAssets[type] = [];
  });

  const handleSelectAsset = (type, assetId) => {
    setSelectedAssets((prev) => ({ ...prev, [type]: assetId }));
  };

  const handleApply = async () => {
    try {
      console.log("Selected Assets:", selectedAssets);
      console.log("avatarId:", avatarId);
      console.log("token:", token);
      setLoading(true);

      await equipAsset(avatarId, Object.values(selectedAssets), token);
      console.log("Equipped");

      await updateUsingItems(userId, Object.values(selectedAssets));
      console.log("Items updated backend");

      await removeFieldFromLocalDatabase("avatar_base_64_half");
      await removeFieldFromLocalDatabase("avatar_base_64_full");

      await getImageUrlAndBase64("full_body");
      await getImageUrlAndBase64("half_body");

      navigation.navigate("AvatarScreen");
    } catch (error) {
      console.error("Error applying assets:", error);
      alert("Failed to apply assets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate("AvatarScreen");
  };

  const handleSendItem = async () => {
    if (username.trim()) {
      try {
        console.log(`Sending ${selectedItem.name} to ${username}`);
        await sendItem(userId, username, selectedItem.id);
        setErrorMessage("");
        alert(`Item enviado para ${username}!`);

        setModalVisible(false);
        setUsername("");

        await initializeData();
      } catch (error) {
        console.log("Erro ao enviar item: ", error.message);
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage("Por favor, insira um nome de utilizador.");
    }
  };

  const handleCancelSendItem = () => {
    setUsername("");
    setErrorMessage("");
    setModalVisible(false);
  };

  const renderCarousel = (type, assets) => (
    <View key={type} style={styles.carouselSection}>
      <Text style={styles.carouselTitle}>
        {printType(type) + " (" + assets.length + ")"}
      </Text>
      {assets.length === 0 ? (
        <Text style={styles.emptyMessage}>Sem artigos desbloquados</Text>
      ) : (
        <FlatList
          data={assets}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isItemInUse = selectedAssets[type] === item.id;

            if (type == "unlocking") {
              return (
                <TouchableOpacity disabled style={[styles.imageContainer]}>
                  {!item.unlocking.includes(1) && (
                    <View style={styles.overlay1} />
                  )}
                  {!item.unlocking.includes(2) && (
                    <View style={styles.overlay2} />
                  )}
                  {!item.unlocking.includes(3) && (
                    <View style={styles.overlay3} />
                  )}
                  {!item.unlocking.includes(4) && (
                    <View style={styles.overlay4} />
                  )}
                  <Image
                    source={{ uri: item.iconUrl }}
                    style={styles.carouselImage}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                onPress={() => handleSelectAsset(type, item.id)}
                onLongPress={() => {
                  if (!isItemInUse) {
                    setSelectedItem(item);
                    setModalVisible(true);
                  } else {
                    alert("Este item está em uso. Não pode ser enviado.");
                  }
                }}
                style={[
                  styles.imageContainer,
                  selectedAssets[type] === item.id &&
                    styles.selectedImageContainer,
                ]}
              >
                <Image
                  source={{ uri: item.iconUrl }}
                  style={styles.carouselImage}
                />
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );

  return (
    <BackgroundContainer>
      <Layout
        style={{
          flex: 1,
          alignItems: "center",
          backgroundColor: "transparent",
          marginBottom: 30,
        }}
      >
        <CommonTitle text="Personalize o seu avatar!" />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.rejectButton}
            accessoryLeft={() => <CloseIcon color={"rgba(255,255,255,1)"} />}
            onPress={handleCancel}
          ></Button>
          {!loading && (
            <Button
              style={styles.applyButton}
              accessoryLeft={() => <SaveIcon color={"rgba(255,255,255,1)"} />}
              onPress={handleApply}
            ></Button>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={"#bab86c"} />
            <Text style={styles.loadingText}>
              Estamos a realizar o processamento ...
            </Text>
            <Text style={styles.loadingText}>Por favor aguarde</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.longPressText}>
              Prima e mantenha num item para enviá-lo
            </Text>
            {allTypes.map((type) =>
              renderCarousel(type, categorizedAssets[type])
            )}
          </ScrollView>
        )}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedItem && (
                <>
                  <Image
                    source={{ uri: selectedItem.iconUrl }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>
                    Insira o nome de utilizador para o qual pretende enviar o
                    item
                  </Text>
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Insira o nome de utilizador"
                value={username}
                onChangeText={setUsername}
              />
              {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
              <Button onPress={handleSendItem} style={styles.sendButton}>
                Enviar!
              </Button>
              <Button
                onPress={handleCancelSendItem}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </Modal>
      </Layout>
    </BackgroundContainer>
  );
}

function printType(val) {
  switch (val) {
    case "hair":
      return "Cabelo";
    case "headwear":
      return "Chapéus";
    case "facemask":
      return "Máscaras";
    case "glasses":
      return "Óculos";
    case "top":
      return "Parte superior";
    case "bottom":
      return "Parte inferior";
    case "outfit":
      return "Outfit completo";
    case "footwear":
      return "Calçado";
    case "unlocking":
      return "A desbloquear";
  }
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    marginTop: 15,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Radioz",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "flex-end",
  },
  applyButton: {
    marginVertical: 20,
    marginLeft: 15,
    width: "20%",
    alignSelf: "flex-end",
    textAlign: "right",
    borderRadius: 20,
    backgroundColor: "#046e05",
    borderColor: "transparent",
  },
  rejectButton: {
    marginVertical: 20,
    width: "20%",
    alignSelf: "flex-end",
    textAlign: "right",
    borderRadius: 100,
    backgroundColor: "#af3939",
    borderColor: "transparent",
  },
  scrollViewContent: {
    paddingBottom: 20,
    marginBottom: 90,
  },
  carouselSection: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
    marginLeft: 10,
    textAlign: "left",
  },
  imageContainer: {
    marginHorizontal: 10,
    borderColor: "#c9e0b4",
    borderWidth: 3,
    backgroundColor: "#bfd5be",
    borderRadius: 35,
    shadowColor: "#e8f1e1",
    shadowRadius: 100,
    elevation: 3,
  },
  overlay1: {
    position: "absolute",
    backgroundColor: "rgba(128, 128, 128, 0.80)",
    width: "50%",
    height: "50%",
    top: 0,
    left: 0,
    borderTopLeftRadius: 35,
    zIndex: 10,
    opacity: 300,
  },
  overlay2: {
    position: "absolute",
    backgroundColor: "rgba(128, 128, 128, 0.80)",
    width: "50%",
    height: "50%",
    top: 0,
    right: 0,
    borderTopRightRadius: 35,
    zIndex: 10,
    opacity: 300,
  },
  overlay3: {
    position: "absolute",
    backgroundColor: "rgba(128, 128, 128, 0.80)",
    width: "50%",
    height: "50%",
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 35,
    zIndex: 10,
    opacity: 300,
  },
  overlay4: {
    position: "absolute",
    backgroundColor: "rgba(128, 128, 128, 0.80)",
    width: "50%",
    height: "50%",
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 35,
    zIndex: 10,
    opacity: 300,
  },
  selectedImageContainer: {
    marginHorizontal: 10,
    borderColor: "#3a7a31",
    borderWidth: 3,
    backgroundColor: "#9eec9a",
    borderRadius: 35,
    shadowColor: "#294d60",
    shadowRadius: 100,
    elevation: 3,
  },
  carouselImage: {
    width: 100,
    height: 100,
  },
  emptyMessage: {
    fontSize: 20,
    fontWeight: "700",
    borderColor: "#151515",
    fontStyle: "italic",
    color: "#151515",
    textAlign: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "700",
    borderColor: "#151515",
    fontStyle: "italic",
    color: "#151515",
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 5,
    color: "black",
  },
  sendButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  longPressText: {
    color: "gray",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginTop: 0,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default AvatarEditScreen;
