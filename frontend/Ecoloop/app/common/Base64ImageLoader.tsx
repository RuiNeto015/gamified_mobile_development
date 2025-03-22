import React, { useEffect, useState } from "react";
import { Image, Spinner, View, Text } from "native-base";
import { StyleSheet } from "react-native";

const Base64ImageLoader = ({ imageUrl, onLoadStart, onLoadEnd, onError, onBase64Load }) => {
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImageAsBase64 = async (url) => {
      try {
        setLoading(true);
        onLoadStart && onLoadStart();

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();

        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const base64Content = base64.split(",")[1]; // Remove the data URI prefix
        setImageBase64(base64Content);
        onBase64Load && onBase64Load(base64Content);
      } catch (error) {
        console.error("Error fetching or converting image:", error);
        onError && onError(error);
      } finally {
        setLoading(false);
        onLoadEnd && onLoadEnd();
      }
    };

    if (imageUrl) {
      fetchImageAsBase64(imageUrl);
    }
  }, [imageUrl, onLoadStart, onLoadEnd, onError, onBase64Load]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Spinner size="large" style={styles.spinner} />
        </View>
      ) : imageBase64 ? (
        <Image
          source={{ uri: `data:image/png;base64,${imageBase64}` }}
          alt="Loaded Image"
          style={styles.image}
        />
      ) : (
        <Text>No image to display</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  spinner: {
    borderColor: "green",
  },
  image: {
    width: 300,
    height: 575,
  },
});

export default Base64ImageLoader;