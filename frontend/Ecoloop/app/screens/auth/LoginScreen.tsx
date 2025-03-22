import React, {useEffect, useState} from 'react';
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
import {setFieldToLocalDatabase, getFieldFromLocalDatabase} from '../../database/database';
import {getImageUrlAndBase64, logInUser, registerUserAPI} from '../../services/apiService';
import {registerUserRPM} from '../../services/rpmService';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get('window').width;

const emailRegex =
  /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/;

function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Error state for each field
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const checkAndNavigateToHome = async () => {
    try {
      const user_id = await getFieldFromLocalDatabase('user_id');
      const avatar_id = await getFieldFromLocalDatabase('avatar_id');
      const token = await getFieldFromLocalDatabase('token');
      const api_token = await getFieldFromLocalDatabase('api_token');

      if (user_id && avatar_id && token && api_token) {
        navigation.navigate('BottomTabNavigation'); // Navigate to the home page
      }
    } catch (error) {
      console.error('Error checking fields from database:', error);
    }
  };
  // Call the check function on component mount
  useEffect(() => {
    checkAndNavigateToHome();
  }, []);

  const validateEmail = async () => {
    if (!emailRegex.test(email)) {
      setEmailError('Formato de email inválido.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleDoneButton = async () => {
    const isEmailValid = await validateEmail();

    if (isEmailValid) {
      setLoading(true);

      try {
        const loginData = await logInUser(email, password);

        // Save data to local database
        await setFieldToLocalDatabase('user_id', loginData.userId);
        await setFieldToLocalDatabase('avatar_id', loginData.avatarId);
        await setFieldToLocalDatabase('token', loginData.avatarToken);
        await setFieldToLocalDatabase('api_token', loginData.jwtToken);

        // Update the avatar's photos
        await getImageUrlAndBase64("full_body", true);
        await getImageUrlAndBase64("half_body", true);

        // Reset state and navigate
        setLoading(false);
        setShowErrors(false);
        setEmail('');
        setPassword('');
        navigation.navigate('AvatarScreen');

      } catch (error) {
        alert(`Erro: ${error.message}`);
        setLoading(false);
      }
    } else {
      setShowErrors(true);
    }
  };

  const handleRegistrationButton = () => {
    navigation.navigate('RegisterScreen');
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
                <Text style={styles.registerText}>Login</Text>

                <View style={styles.inputBox}>
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
                    }}
                    style={styles.input}
                  />
                  {showErrors && passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <Button onPress={handleDoneButton} style={styles.button}>
                  Entrar!
                </Button>

                <TouchableOpacity onPress={handleRegistrationButton}>
                  <Text style={styles.clickableText}>
                    Não tem conta? Registe-se!
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

export default LoginScreen;
