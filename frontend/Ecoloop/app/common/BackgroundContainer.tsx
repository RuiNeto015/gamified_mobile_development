import React, {ReactNode} from 'react';
import {ImageBackground, StyleSheet, ViewStyle} from 'react-native';

interface BackgroundContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({children, style}) => {
  return (
    <ImageBackground
      source={require("../images/recycling_bg.png")}
      style={[styles.container, style]}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
  },
});

export default BackgroundContainer;