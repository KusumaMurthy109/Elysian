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
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./app_styles.styles";
import { homeStyles } from "./home.styles";
import { FIREBASE_DB } from "../../FirebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "./navigation_bar"; // adjust path

// this defines what the post object should look like
type Post = {
  id: string;
  urls: string[]; // Allow users to upload multiple pictures.
  uploader: string;
  timestamp: number;
};

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Home = () => {
  const [post, setPosts] = useState<Post[]>([]); //initializes post as an empty array which is then updated by setPosts

  const navigation = useNavigation<HomeNavigationProp>();

  useEffect(() => {
    const q = query(
      collection(FIREBASE_DB, "posts"),
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
      createPost([selectedImage.assets[0].uri]); // Upload the picture taken.
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
      createPost(uris);
    }
  };

  const createPost = async (localURIs: string[]) => {
    navigation.navigate("CreatePost", {imageURIs: localURIs});
  };

  return (
    <SafeAreaView edges={["top"]}>
      <FlatList
        data={post}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.homeContainer}
        ListHeaderComponent={<Text style={styles.pageTitle}>Explore{"\n"}with Us</Text>}
        renderItem={({ item }) => (
          <View style={homeStyles.postContainer}>

            {/* IMAGE SECTION */}
            <View style={homeStyles.imageContainer}>
              <FlatList
                data={item.urls}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(uri, index) => uri + index}
                renderItem={({ item: uri }) => (
                  <Image
                    source={{ uri }}
                    style={[homeStyles.cityImage]}
                    resizeMode="cover"
                  />
                )}
              />
              <View style={homeStyles.cityOverlay}>
                <Text style={homeStyles.cityFont}>City</Text>
                {/* Row for pin + country */}
                <View style={homeStyles.pinIcon}>
                  <MaterialCommunityIcons name="map-marker-outline" size={22} color="white" />
                  <Text style={homeStyles.countryFont}>Country</Text>
                </View>
              </View>
              <View style={homeStyles.ratingOverlay}>
                  <View style={homeStyles.ratingTag}>
                    <Text style={homeStyles.ratingFont}>3</Text>
                    <MaterialCommunityIcons name="star-face" size={20} color="#000" />
                  </View>
              </View>
            </View>


            {/* CONTENT SECTION */}
            <View style={homeStyles.contentContainer}>
              <View>
                <Text style={homeStyles.uploader}>@{item.uploader}</Text>
                <Text style={homeStyles.date}>date</Text>
              </View>

              <View style={homeStyles.postIcons}>
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={28} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}
      />
      <TouchableOpacity style={styles.topRightIcon} onPress={uploadMethod}>
        <GlassView style={styles.glassButton}>
          <Ionicons name="add" size={26} color="#000" />
        </GlassView>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;