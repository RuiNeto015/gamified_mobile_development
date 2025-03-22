import React, {useEffect, useState} from 'react';
import {Button, Layout, Text} from '@ui-kitten/components';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    LayoutAnimation,
    Platform,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import BackgroundContainer from '../../common/BackgroundContainer';
import {getFieldFromLocalDatabase, setFieldToLocalDatabase} from '../../database/database';
import {getImageUrlAndBase64, updateAvatarInfo} from '../../services/apiService';
import {assignAvatarTemplate, fetchAvatarTemplates, saveAvatarPermanently} from '../../services/rpmService';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

function AvatarSelectionScreen({navigation}: NativeStackScreenProps<any>) {
    const [avatarTemplates, setAvatarTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [selectedGender, setSelectedGender] = useState('male');
    const [loading, setLoading] = useState(true);
    const [rpmToken, setRpmToken] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        setLoading(true);

        const initializeData = async () => {
            try {
                const token = await getFieldFromLocalDatabase("token");
                const user = await getFieldFromLocalDatabase("user_id");

                if (!token) console.warn('Token is null or empty');
                if (!user) console.warn('User ID is null or empty');

                setRpmToken(token);
                setUserId(user);

                // Fetch avatar templates
                const data = await fetchAvatarTemplates(token);
                const randomizeTemplates = data.data.filter((template) => template.usageType === 'randomize');
                setAvatarTemplates(randomizeTemplates);

            } catch (error) {
                console.error('Error initializing data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const handleChoice = async () => {
        if (!selectedTemplateId) {
            alert('Por favor, escolha um avatar!');
            return;
        }

        setLoading(true);

        try {
            // Assign avatar template
            const rpmData = await assignAvatarTemplate(rpmToken, selectedTemplateId);

            // Update avatar info in the backend
            await updateAvatarInfo(userId, rpmToken, rpmData.data.id);

            // Update avatar info rpm api
            await saveAvatarPermanently(rpmToken, rpmData.data.id);

            // Save avatar ID to local database
            await setFieldToLocalDatabase("avatar_id", rpmData.data.id);

            // Update the avatar's photos
            await getImageUrlAndBase64("full_body", true);
            await getImageUrlAndBase64("half_body", true);

            // Navigate to the next screen
            navigation.navigate('AvatarScreen');

        } catch (error) {
            console.error('Error registering avatar:', error.message);
            alert('Erro ao atribuir template ao utilizador. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleLookalike = async () => {
        navigation.navigate('LookalikeAvatarScreen');
    };

    const handleSelectAvatar = (id) => setSelectedTemplateId(id);

    const handleGenderSelect = (gender) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedGender(gender);
    };

    const filteredAvatars = avatarTemplates.filter((template) => template.gender === selectedGender);

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = screenWidth / 4 - 20;

    return (
        <BackgroundContainer style={{paddingBottom: 30}}>
            <Layout style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>
                <Text category="h4" style={styles.welcomeText}>
                    Escolha o seu avatar favorito!
                </Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={"#bab86c"}/>
                        <Text style={styles.loadingText}>Pode demorar um pouco ...</Text>
                        <Text style={styles.loadingText}>Por favor aguarde</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.tabContainer}>
                            <Button
                                onPress={() => handleGenderSelect('male')}
                                appearance={selectedGender === 'male' ? 'filled' : 'outline'}
                                style={[styles.tabButton, selectedGender === 'male' && styles.activeTab]}
                            >
                                Homem
                            </Button>
                            <Button
                                onPress={() => handleGenderSelect('female')}
                                appearance={selectedGender === 'female' ? 'filled' : 'outline'}
                                style={[styles.tabButton, selectedGender === 'female' && styles.activeTab]}
                            >
                                Mulher
                            </Button>
                        </View>

                        <FlatList
                            style={{maxHeight: Dimensions.get('window').height * 0.6}}
                            data={filteredAvatars}
                            keyExtractor={(item) => item.id}
                            numColumns={4}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    onPress={() => handleSelectAvatar(item.id)}
                                    style={[styles.imageContainer, {width: itemWidth}]}
                                >
                                    <Image
                                        source={{uri: item.imageUrl}}
                                        style={[
                                            styles.avatarImage,
                                            selectedTemplateId === item.id && styles.selectedImage,
                                        ]}
                                    />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.gridContainer}
                        />

                        <View style={styles.buttonContainer}>
                            <Button onPress={handleChoice} style={styles.registerButton}>
                                Escolher!
                            </Button>
                            <Button onPress={handleLookalike} style={styles.lookalikeButton}>
                                Quero um avatar parecido comigo!
                            </Button>
                        </View>
                    </>
                )}
            </Layout>
        </BackgroundContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 20,
        marginTop: 50,
        marginBottom: 20,
    },
    gridContainer: {
        padding: 10,
        alignItems: 'center'
    },
    imageContainer: {
        alignItems: 'center',
        margin: 5,
    },
    loadingText: {
        fontSize: 20,
        fontWeight: '700',
        borderColor: '#151515',
        fontStyle: 'italic',
        color: '#151515',
        textAlign: 'center',
        marginTop: 4,
    },
    avatarImage: {
        width: '100%',
        height: 144,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedImage: {
        borderColor: 'green',
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginVertical: 10,
    },
    tabButton: {
        flex: 1,
        borderRadius: 0,
        marginHorizontal: 0,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007bff',
    },
    registerButton: {
        marginTop: 10,
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
    lookalikeButton: {
        marginTop: 10,
    },
    buttonContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AvatarSelectionScreen;