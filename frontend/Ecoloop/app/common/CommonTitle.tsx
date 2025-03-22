import React from 'react';
import {StyleSheet, Text} from 'react-native';

interface CommonTitleProps {
  text: string;
}

const CommonTitle: React.FC<CommonTitleProps> = ({text}) => {
  return (
    <Text style={styles.headerText}>{text}</Text>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000'
  },
});

export default CommonTitle;