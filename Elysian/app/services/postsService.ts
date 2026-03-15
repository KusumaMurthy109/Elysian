import * as ImagePicker from "expo-image-picker";
import {Alert} from "react-native";

export const uploadMethod = (navigation: any) => {
    Alert.alert("Create a Post", "Choose Upload Options:", [
      { text: "Take Photo", onPress: () => takePhoto(navigation) },
      { text: "Choose from Album", onPress: () => fromAlbum(navigation) },
      { text: "Cancel", style: "cancel" },
    ]);
};

 // Request for access to the camera.
  const takePhoto = async (navigation: any) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }
    // If granted permission, then wait for the camera picture and get result.
    const selectedImage = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      navigation.navigate("CreatePost", {
        imageURIs: [selectedImage.assets[0].uri],
    });

    };
  };

  const fromAlbum = async (navigation: any) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Need access to photos in order to upload images",
      );
      return;
    }
    // Open phone gallery and compress images for faster upload
    const selectedImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      const uris = selectedImage.assets.map((a: { uri: string }) => a.uri);
      navigation.navigate("CreatePost", {
        imageURIs: [selectedImage.assets[0].uri],
    });
    }
  };