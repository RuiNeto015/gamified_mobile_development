import {Text, View} from "native-base";
import {Button, useTheme} from "@ui-kitten/components";
import React from "react";
import {StyleSheet} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faDoorClosed} from "@fortawesome/free-solid-svg-icons";
import {useNavigation} from "@react-navigation/native";
import BackgroundContainer from "../../common/BackgroundContainer";
import {setFieldToLocalDatabase} from '../../database/database';


function SettingsScreen() {

    const navigation = useNavigation();

    const theme = useTheme();

    // Icons

    const logoutIcon = () => (
        <FontAwesomeIcon
            icon={faDoorClosed}
            size={32}
            color={"white"}
        />
    );

    // Functions

    const handleLogout = async () => {
        try {
            await setFieldToLocalDatabase("api_token", "");
            await setFieldToLocalDatabase("token", "");
            await setFieldToLocalDatabase("user_id", "");
            await setFieldToLocalDatabase("avatar_id", "");

            navigation.navigate('AuthStack', {screen: 'LoginScreen'});

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    return (
        <BackgroundContainer>
            <Text category='h4' style={styles.settingsText}>Definições</Text>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Button
                    accessoryLeft={logoutIcon}
                    onPress={handleLogout}
                    status={"danger"}
                    style={styles.registerButton}
                >
                    Sair
                </Button>
            </View>
        </BackgroundContainer>
    );
}

const styles = StyleSheet.create({
    registerButton: {
        marginTop: 50,
        backgroundColor: 'red',
        borderColor: 'red',
    },
    settingsText: {
        fontSize: 21,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: "#000000"
    },
});

export default SettingsScreen;