import {useNavigation, useRoute} from "@react-navigation/native";
import {Button, Text} from "@ui-kitten/components";
import React from "react";
import {Image, ImageBackground, StyleSheet, View} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {useTheme} from "@ui-kitten/components";
import BackgroundContainer from "../../common/BackgroundContainer";


function MaterialRecognizerResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const theme = useTheme();

    // Icons

    const finishRecognitionIcon = () => (
        <FontAwesomeIcon
            icon={faThumbsUp}
            size={32}
            color={"white"}
        />
    );

    // Functions

    const {material} = route.params;

    const getMaterialInfo = () => {
        switch (material) {
            case "Plastic":
                return {
                    text: "Plástico",
                    image: require("../../images/plastic_container.png"),
                };
            case "Paper":
                return {
                    text: "Papel",
                    image: require("../../images/paper_container.png"),
                };
            case "Glass":
                return {
                    text: "Vidro",
                    image: require("../../images/glass_container.png"),
                };
            case "Metal":
                return {
                    text: "Metal",
                    image: require("../../images/metal_container.png"),
                };
            default:
                return {
                    text: "Indefinido, infelizmente...",
                    image: require("../../images/undefined_container.png"),
                };
        }
    };

    const materialInfo = getMaterialInfo();

    const finishRecognition = async () => {
        navigation.navigate("MaterialRecognizerHomeScreen")
    };

    return (
        <BackgroundContainer>
            <Text style={styles.text1}>
                Parece que o seu material pertence ao contentor:
            </Text>
            <Text style={styles.text2}>
                {materialInfo.text}
            </Text>
            <View style={styles.container}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={materialInfo.image}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            </View>
            <View
                style={{flex: 0.6, justifyContent: "center", alignItems: "center"}}
            >
                <Button
                    accessoryLeft={finishRecognitionIcon}
                    onPress={finishRecognition}
                >
                    Feito, obrigado!
                </Button>
            </View>
        </BackgroundContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 30,
    },
    imageWrapper: {
        width: 250,
        height: 445,
        borderRadius: 20,
        overflow: 'hidden',
    },
    text1: {
        fontSize: 21,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: "#000000"
    },
    text2: {
        fontSize: 25,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: "#000000"
    },
    image: {
        width: "100%",
        height: "100%",
    }
});

export default MaterialRecognizerResultScreen;
