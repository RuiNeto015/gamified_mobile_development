// src/components/CustomModal.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Card, Text, Button } from '@ui-kitten/components';

const CustomModal = ({
                       visible,
                       onClose,
                       isError = false,
                       children,
                       // Error specific props
                       errorMessage,
                       errorTitle = 'Ocorreu algum erro',
                       buttonText = 'OK'
                     }) => {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}
    >
      <Card disabled={true}>
        {isError ? (
          // Error message layout
          <>
            <Text category="h6" style={styles.title}>
              {errorTitle}
            </Text>
            <Text>{errorMessage}</Text>
            <Button
              style={styles.button}
              onPress={onClose}
            >
              {buttonText}
            </Button>
          </>
        ) : (
          // Custom content layout
          children
        )}
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default CustomModal;