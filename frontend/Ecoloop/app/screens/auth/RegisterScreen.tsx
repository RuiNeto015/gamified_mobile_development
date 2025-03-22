import React, {useState} from 'react';
import {Button, Input, Layout, Spinner, Text} from '@ui-kitten/components';
import {
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    StyleSheet,
    UIManager,
    View,
    KeyboardAvoidingView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {setFieldToLocalDatabase} from '../../database/database';
import {getImageUrlAndBase64, registerUserAPI} from '../../services/apiService';
import {registerUserRPM} from '../../services/rpmService';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get('window').width;

const emailRegex =
    /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/;

function RegisterScreen({navigation}: any) {
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Error state for each field
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    const validateUsername = () => {
        if (userName.length < 3 || userName.length > 15) {
            setUsernameError('O nome de utilizador deve ter entre 3 e 15 caracteres.');
            return false;
        }
        setUsernameError('');
        return true;
    };

    const validateEmail = async () => {
        if (!emailRegex.test(email)) {
            setEmailError('Formato de email inválido.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = () => {
        if (!passwordRegex.test(password)) {
            setPasswordError('Deve conter de 4 a 8 caracteres. Deve incluir números e letras maiúsculas e minúsculas.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleDoneButton = async () => {
        const isUsernameValid = validateUsername();
        const isEmailValid = await validateEmail();
        const isPasswordValid = validatePassword();

        if (isUsernameValid && isEmailValid && isPasswordValid) {
            setLoading(true);

            try {
                const registerData = await registerUserAPI(userName, email, password);

                const rpmRegisterData = await registerUserRPM();

                // Save data to local database
                await setFieldToLocalDatabase('api_token', registerData.token);
                await setFieldToLocalDatabase('token', rpmRegisterData.data.token);
                await setFieldToLocalDatabase('user_id', registerData.userId);

                // Reset state and navigate
                setLoading(false);
                setShowErrors(false);
                setUsername('');
                setEmail('');
                setPassword('');
                navigation.navigate('AvatarSelectionScreen');

            } catch (error) {
                alert(`Erro: ${error.message}`);
                setLoading(false);
            }
        } else {
            setShowErrors(true);
        }
    };

    const handleLoginButton = () => {
        navigation.navigate('LoginScreen');
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
                <ImageBackground
                    source={require('../../images/recycling_bg.png')}
                    style={styles.container}
                >
                    <View style={styles.bannerContainer}>
                        <Image
                            source={require('../../images/banner.png')}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>

                    <Layout style={styles.container}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Spinner size="large" status="basic" style={styles.greenSpinner}/>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.registerText}>Registo</Text>

                                <View style={styles.inputBox}>
                                    <Input
                                        label="Nome de utilizador"
                                        placeholder="Introduza o nome de utilizador"
                                        value={userName}
                                        onChangeText={(text) => {
                                            setUsername(text);
                                            if (showErrors) validateUsername();
                                        }}
                                        style={styles.input}
                                    />
                                    {showErrors && usernameError ? (
                                        <Text style={styles.errorText}>{usernameError}</Text>
                                    ) : null}

                                    <Input
                                        label="Email"
                                        placeholder="Introduza o email"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (showErrors) validateEmail();
                                        }}
                                        style={styles.input}
                                    />
                                    {showErrors && emailError ? (
                                        <Text style={styles.errorText}>{emailError}</Text>
                                    ) : null}

                                    <Input
                                        label="Palavra-passe"
                                        placeholder="Introduza a palavra-passe"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (showErrors) validatePassword(); // Validate only if errors are shown
                                        }}
                                        style={styles.input}
                                    />
                                    {showErrors && passwordError ? (
                                        <Text style={styles.errorText}>{passwordError}</Text>
                                    ) : null}
                                </View>

                                <Button onPress={handleDoneButton} style={styles.button}>
                                    Feito!
                                </Button>

                                <TouchableOpacity onPress={handleLoginButton}>
                                    <Text style={styles.clickableText}>
                                        Já tem conta? Faça Login!
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Layout>
                </ImageBackground>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    bannerContainer: {
        position: 'relative',
        width: screenWidth,
        height: 225,
        marginBottom: 20,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    registerText: {
        fontSize: 40,
        marginBottom: 20,
    },
    inputBox: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
        width: '100%',
    },
    button: {
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
    clickableText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#007bff',
        textDecorationLine: 'underline',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: -10,
        marginBottom: 10,
    }
});

export default RegisterScreen;
