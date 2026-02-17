/**
 * file: home.tsx
 *
 * This file renders the main Explore page where users can browse
 * images shared by others and upload their own travel photos.
 *
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./app_styles.styles";
import { FIREBASE_DB } from "../../FirebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";

// this defines what the post object should look like
type Post = {
  id: string;
  urls: string[]; // Allow users to upload multiple pictures.
  uploader: string;
  timestamp: number;
};

const Home = () => {
  const [post, setPosts] = useState<Post[]>([]); //initializes post as an empty array which is then updated by setPosts
  const [uploading, setUploading] = useState(false); //tracks whether an image is currently uploading
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName);
      }
    });
    return user;
  }, []);

  useEffect(() => {
    const q = query(
      collection(FIREBASE_DB, "images"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // store the function that stops listening into the variable unsubscribe
      const data: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      setPosts(data);
    });
    return () => unsubscribe();
  }, []);

  const uploadMethod = () => {
    Alert.alert(
      "Create a Post",
      "Choose Upload Options:",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Album", onPress: fromAlbum },
        { text: "Cancel", style: "cancel" }
      ]

    );
  };

  const takePhoto = async () => {
    // Request for access to the camera.
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Camera access is required."
      );
      return;
    }
    // If granted permission, then wait for the camera picture and get result.
    const selectedImage = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!selectedImage.canceled) {
      upload([selectedImage.assets[0].uri]); // Upload the picture taken.
    }
  }

  const fromAlbum = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Need access to photos in order to upload images"
      );
      return;
    }

    const selectedImage = await ImagePicker.launchImageLibraryAsync({
      // Open phone gallery and compress images for faster upload
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      const uris = selectedImage.assets.map((a: { uri: string }) => a.uri);
      upload(uris);
    }
  };

  const upload = async (localUris: string[]) => {
    try {
      setUploading(true);
      const allUploadUrls: string[] = [];
      // Go through each URI to upload.
      for (const uri of localUris) {
        const filename = uri.split("/").pop();
        // Call the AWS Lambda API which returns a temporary S3 uplaod link
        const response = await fetch(
          `https://adsorm74va.execute-api.us-east-1.amazonaws.com/prod/upload-url?filename=${filename}`
        );
        const data = await response.json();
        const { uploadUrl, fileUrl } = data;

        const image = await fetch(uri);
        const blob = await image.blob();
        await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
        });
        // This stores all the upload URLs for each image.
        allUploadUrls.push(fileUrl);
      }

      await addDoc(collection(FIREBASE_DB, "images"), {
        urls: allUploadUrls,
        uploader: userName,
        timestamp: Date.now(),
      });
      Alert.alert("Upload sucessful");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to upload image", "Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={post}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.homeContainer}
        ListHeaderComponent={<Text style={styles.homeTitle}>Explore!</Text>}
        renderItem={({ item }) => (
          <View style={styles.cityCard}>
            <FlatList
              data={item.urls}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, index) => uri + index}
              renderItem={({ item: uri }) => (
                <Image
                  source={{ uri }}
                  style={styles.cityImage}
                  resizeMode="cover"
                />
              )}
            />
            <Text style={styles.uploader}>Uploaded by: {item.uploader}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.topRightIcon} onPress={uploadMethod}>
        <GlassView style={styles.glassButton}>
          <Ionicons name="add" size={26} color="#000" />
        </GlassView>
      </TouchableOpacity>
      {uploading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.uploadingIndicator}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
