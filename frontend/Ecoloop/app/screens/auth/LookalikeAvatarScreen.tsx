import React, {useEffect, useRef, useState} from "react";
import {Pressable, Text, View} from "native-base";
import {Camera, useCameraDevice, useCameraPermission} from "react-native-vision-camera";
import {Image, Linking, StyleSheet} from "react-native";
import {faCamera, faRepeat, faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {Button, Spinner, useTheme} from "@ui-kitten/components";
import {useIsFocused, useNavigation} from "@react-navigation/native";
import RNFS from 'react-native-fs';
// @ts-ignore
import {ROBOFLOW_API_KEY} from '@env';
import BackgroundContainer from "../../common/BackgroundContainer";
import {useAppState} from '@react-native-community/hooks'
import CommonTitle from "../../common/CommonTitle";
import {createLookalikeAvatar, saveAvatarPermanently} from "../../services/rpmService";
import {getFieldFromLocalDatabase, setFieldToLocalDatabase} from '../../database/database';
import {getImageUrlAndBase64, updateAvatarInfo} from "../../services/apiService";


function LookalikeAvatarScreen() {
    const navigation = useNavigation();

    const isFocused = useIsFocused()
    const appState = useAppState()
    const isActive = isFocused && appState === "active"

    const [loading, setLoading] = useState(false);
    const device = useCameraDevice('front');
    const {hasPermission, requestPermission} = useCameraPermission();
    const [photoUri, setPhotoUri] = useState(null);
    const camera = useRef(null);

    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const tips = [
        "Certifique-se de que há boa iluminação.",
        "Tente ser a única pessoa na câmara.",
        "Mantenha-se estável e centralizado."
    ];

    const theme = useTheme();

    const cameraIcon = () => (
        <FontAwesomeIcon
            icon={faCamera}
            size={32}
            color={theme["background-basic-color-1"]}
        />
    );

    const repeatIcon = () => (
        <FontAwesomeIcon
            icon={faRepeat}
            size={32}
            color={theme["color-danger-500"]}
        />
    );

    const submitIcon = () => (
        <FontAwesomeIcon
            icon={faUpload}
            size={32}
            color={theme["color-success-600"]}
        />
    );

    // Funtions
    const takePhoto = async () => {
        try {
            const photo = await camera.current?.takePhoto();
            setPhotoUri(photo.path);
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const repeatTakePhoto = async () => {
        setPhotoUri(null);
    };

    const submitPhoto = async () => {
        setLoading(true);
        try {
            const image = await RNFS.readFile(photoUri, 'base64');
            const user = await getFieldFromLocalDatabase("user_id");
            const rpmToken = await getFieldFromLocalDatabase("token");

            //Create lookalike avatar
            const createLookalikeAvatarResponse = await createLookalikeAvatar(user, rpmToken, image)

            // Update avatar info in the backend
            await updateAvatarInfo(user, rpmToken, createLookalikeAvatarResponse.data.id);

            await saveAvatarPermanently(rpmToken, createLookalikeAvatarResponse.data.id);

            // Save avatar ID to local database
            await setFieldToLocalDatabase("avatar_id", createLookalikeAvatarResponse.data.id);

            // Update the avatar's photos
            await getImageUrlAndBase64("full_body", true);
            await getImageUrlAndBase64("half_body", true);

            setPhotoUri(null);

            // Navigate to the next screen
            navigation.navigate('AvatarScreen');

        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const openCameraSettings = () => {
        Linking.openSettings();
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    if (hasPermission) {
        return (
            <BackgroundContainer>
                <CommonTitle text="Aponte a câmara para si"/>
                <Text style={styles.instructionText2}>
                    e dê-nos o seu melhor sorriso!
                </Text>
                <Text style={styles.tipText}>{tips[currentTipIndex]}</Text>
                <View style={styles.container}>
                    <View style={styles.cameraWrapper}>
                        {!photoUri ? (
                            <Camera
                                ref={camera}
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isActive}
                                photo={true}
                                photoQualityPrioritization="speed"
                            />
                        ) : (
                            <Image source={{uri: 'file://' + photoUri}} style={styles.photoPreview}/>
                        )}
                    </View>
                </View>

                {
                    loading && (
                        <View style={styles.loadingContainer}>
                            <Spinner
                                size='large'
                                status='basic'
                                style={styles.greenSpinner}
                            />
                        </View>
                    )
                }

                <View
                    style={{flex: 0.8, justifyContent: "center", alignItems: "center"}}
                >
                    {!photoUri ? (
                        <Button
                            accessoryLeft={cameraIcon}
                            onPress={takePhoto}
                            style={styles.takePhotoButton}
                        >
                            Fotografar
                        </Button>
                    ) : (
                        <View style={{flexDirection: "row", justifyContent: "space-between", width: '80%'}}>
                            <Button
                                accessoryLeft={repeatIcon}
                                onPress={repeatTakePhoto}
                                status={"danger"}
                                appearance="outline"
                            >
                                Repetir
                            </Button>
                            <Button
                                accessoryLeft={submitIcon}
                                onPress={submitPhoto}
                                appearance="outline"
                            >
                                Submeter
                            </Button>
                        </View>
                    )}
                    <Button
                        onPress={() => navigation.navigate('AvatarSelectionScreen')} style={styles.backButton}
                    >
                        Voltar
                    </Button>
                </View>
            </BackgroundContainer>
        );
    }

    return (
        <BackgroundContainer>
            <View style={styles.noPermissionContainer}>
                <Text style={styles.noPermissionText}>Não tem permissão para usar a câmara!</Text>
                <Pressable onPress={openCameraSettings}>
                    <Text style={styles.permissionLinkText}>Altere as permissões nas Definições</Text>
                </Pressable>
                <Image
                    source={require("../../images/camera_permission_denied.png")}
                    resizeMode="cover"
                />
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
    noPermissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noPermissionText: {
        fontSize: 21,
        color: "#333333",
        marginBottom: 10,
    },
    permissionLinkText: {
        fontSize: 16,
        color: "#1E90FF",
        textDecorationLine: "underline",
    },
    cameraWrapper: {
        width: 350,
        height: 450,
        borderRadius: 20,
        overflow: 'hidden',
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
    tipText: {
        fontSize: 16,
        fontFamily: 'Arial',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 15,
        color: "#666666"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    greenSpinner: {
        borderColor: 'green',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        marginTop: 20
    },
    takePhotoButton: {
        marginTop: 60
    }
});

export default LookalikeAvatarScreen;