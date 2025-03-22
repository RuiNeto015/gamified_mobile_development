import React, {useEffect, useRef, useState} from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import CommonTitle from "../../common/CommonTitle";
import {fetchGift} from "../../services/apiService";
import {getFieldFromLocalDatabase} from "../../database/database";
import {StyleService} from "@ui-kitten/components";
import Toast, {BaseToast} from "react-native-toast-message";
import {Button} from "native-base";

const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{borderLeftColor: "green"}}
            contentContainerStyle={{paddingHorizontal: 12}}
            text1Style={{
                fontSize: 15,
                fontWeight: "400",
            }}
            text2Style={{
                fontSize: 15,
            }}
        />
    ),
};

export default function GiftScreen() {
    const navigation = useNavigation();
    const [open, setOpen] = useState(false);
    const [opened, setOpened] = useState(false);
    const [giftData, setGiftData] = useState(null);
    const [loading, setLoading] = useState(true);
    const scale = useRef(new Animated.Value(0.1)).current;
    const [isLast, setIsLast] = useState(false);

    useEffect(() => {
        fetchGiftData();
    }, []);

    useEffect(() => {
        if (open) {
            const timeout = setTimeout(() => {
                if (isLast) {
                    Toast.show({
                        type: "success",
                        text1: "Parabéns",
                        text2: "Desbloqueou todas as partes do item 👏🏼",
                    });
                }
                setOpened(true);
                triggerZoomIn();
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [open]);

    // Reset scale when the component re-focuses to trigger zoom again
    useFocusEffect(
        React.useCallback(() => {
            setOpen(false);
            setOpened(false);
            setGiftData(null);
            setLoading(true);
            fetchGiftData();
            scale.setValue(0.1);
            setIsLast(false)
        }, [])
    );

    const fetchGiftData = async () => {
        try {
            const userId = await getFieldFromLocalDatabase("user_id");
            const data = await fetchGift(userId);
            console.log(data)
            //simao
            if (data.unlockedParts.length === 3) {
                setIsLast(true);
            }

            setGiftData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching gift data:", error);
            setLoading(false);
        }
    };

    const handleOk = async () => {
        navigation.navigate("AvatarStack", {screen: "AvatarEditScreen"});
    };

    // Zoom-in animation
    const triggerZoomIn = () => {
        Animated.timing(scale, {
            toValue: 1, // Zoom-in to 1.5x
            duration: 1000, // Duration of the zoom-in animation (1000ms = 1 second)
            useNativeDriver: true, // Optimize animation performance
        }).start();
    };

    // Render both highlighted part and other parts (gray)
    const renderHighlightedParts = (unlockedParts, currentPart) => {
        const positions = {
            1: {top: 0, left: 0},
            2: {top: 0, left: "50%"},
            3: {top: "50%", left: 0},
            4: {top: "50%", left: "50%"},
        };

        return Object.keys(positions).map((key) => {
            const part = parseInt(key);
            const isUnlocked = unlockedParts.includes(part);
            const isCurrentPart = part === currentPart;

            let backgroundColor = "transparent"; // Default background for non-unlocked/gray parts

            if (isCurrentPart) {
                backgroundColor = "rgba(0, 255, 0, 0.3)";
            } else if (isUnlocked) {
                backgroundColor = "transparent";
            } else {
                backgroundColor = "rgba(128, 128, 128, 0.8)";
            }

            return (
                <View
                    key={key}
                    style={[
                        styles.highlightBorder,
                        {...positions[part], backgroundColor},
                    ]}
                />
            );
        });
    };

    return (
        <View style={styles.backgroundWrapper}>
            <Toast config={toastConfig}/>
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.headerText}>Parabéns!</Text>
                    <Text style={styles.headerText}>Ganhou um Presente</Text>
                </View>

                {!open && !loading && (
                    <Pressable
                        onPress={() => {
                            setOpen(true);
                        }}
                    >
                        <Image
                            source={require("../../../assets/gifs/present-shaking.gif")}
                            style={styles.image}
                        />
                    </Pressable>
                )}

                {open && !opened && !loading && (
                    <Image
                        source={require("../../../assets/gifs/present-opening.gif")}
                        style={styles.image}
                    />
                )}

                {opened && giftData && !loading && (
                    <>
                        <View style={styles.imageContainer}>
                            <Animated.View
                                style={[
                                    styles.fullImage,
                                    {transform: [{scale}]}, // Apply zoom-in animation to ImageBackground
                                ]}
                            >
                                <ImageBackground
                                    source={{uri: giftData.item.iconUrl}}
                                    style={styles.fullImage}
                                >
                                    {renderHighlightedParts(
                                        giftData.unlockedParts,
                                        giftData.part
                                    )}
                                </ImageBackground>
                            </Animated.View>
                        </View>

                        <Text style={styles.unlockText1}>
                            {giftData.part
                                ? `Desbloqueou a parte ${giftData.part.toString()}! 🎁`
                                : "Desbloqueou uma parte!"}
                        </Text>

                        <Text style={styles.unlockText2}>
                            Acede à aba de edição do avatar para verificares o progresso.
                        </Text>

                        <Button onPress={handleOk} colorScheme="green" style={styles.roundedButton}>
                            <Text style={styles.redeemText}>Recolher!</Text>
                        </Button>
                    </>
                )}

                {!opened && !loading && (
                    <Text style={styles.instructionText}>
                        Clique no presente para abri-lo!
                    </Text>
                )}

                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#00FF00"
                        style={styles.loadingIndicator}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#DBF3D2",
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        marginBottom: 200,
    },
    redeemText: {
        color: "white",
        fontSize: 16
    },
    headerText: {
        fontSize: 24,
        marginTop: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
        zIndex: -10
    },
    image: {
        marginTop: 80,
        height: 250,
        resizeMode: "contain",
    },
    imageContainer: {
        marginTop: 50,
        width: 250,
        height: 250,
        position: "relative",
    },
    fullImage: {
        width: "100%",
        height: "100%",
        position: "relative",
        borderWidth: 1,
        borderColor: "#5b5b5b",
        elevation: 3, // For Android shadow
    },
    highlightBorder: {
        position: "absolute",
        width: "50%",
        height: "50%",
        borderWidth: 0,
    },
    textContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: 30,
    },
    instructionText: {
        padding: 20,
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
    },
    unlockText1: {
        marginTop: 30,
        padding: 20,
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
    },
    unlockText2: {
        padding: 20,
        fontSize: 15,
        color: "black",
        textAlign: "center",
    },
    roundedButton: {
        width: "40%",
        borderRadius: 30,
        marginTop: 30,
    },
    loadingIndicator: {
        marginTop: 50,
    },
});
