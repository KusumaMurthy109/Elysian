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
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles/app_styles.styles";
import { homeStyles } from "../styles/home.styles";
import { FIREBASE_DB } from "../../FirebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  increment,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "./navigation_bar";
import { getAuth } from "firebase/auth";
import PostItem, { Post } from "./post_component";

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedReview, setExpandedReview] = useState<{
    [key: string]: boolean;
  }>({});
  const [userFavorites, setUserFavorites] = useState<{
    [key: string]: boolean;
  }>({});
  const navigation = useNavigation<HomeNavigationProp>();
  const [postImageIndices, setPostImageIndices] = useState<{
    [postId: string]: number;
  }>({});
  const [userLikes, setUserLikes] = useState<{ [postId: string]: boolean }>(
    {}
  );
  const [userFriends, setUserFriends] = useState<{ [uid: string]: boolean }>(
    {}
  );
  const currentUser = getAuth().currentUser;
  const [friendRequestsSent, setFriendRequestsSent] = useState<{
    [uid: string]: boolean;
  }>({});
  const [friendRequestsReceieved, setFriendRequestsReceieved] = useState<{
    [uid: string]: boolean;
  }>({});
  const [activeTab, setActiveTab] = useState<"community" | "friends">(
    "community"
  );

  // Sync posts from Firestore
  useEffect(() => {
    const q = query(
      collection(FIREBASE_DB, "posts"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  // Sync userFavorites from Firestore
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userFavoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);

    const unsubscribe = onSnapshot(userFavoritesRef, (snapshot) => {
      const data = snapshot.data() || {};
      const favs: { [key: string]: boolean } = {};
      Object.keys(data).forEach((key) => {
        favs[key] = true;
      });
      setUserFavorites(favs);
    });

    return () => unsubscribe();
  }, []);

  // onSnapshot to listen for user likes
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribeFunctions: (() => void)[] = [];

    posts.forEach((post) => {
      const likeRef = doc(FIREBASE_DB, "posts", post.id, "likes", user.uid);

      const unsubscribe = onSnapshot(likeRef, (snapshot) => {
        setUserLikes((prev) => ({
          ...prev,
          [post.id]: snapshot.exists(),
        }));
      });

      unsubscribeFunctions.push(unsubscribe);
    });

    return () => unsubscribeFunctions.forEach((unsub) => unsub());
  }, [posts]);

  // Updates likeCount on posts database
  const likesOnPost = async (postId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const postRef = doc(FIREBASE_DB, "posts", postId);
      const likeRef = doc(FIREBASE_DB, "posts", postId, "likes", user.uid);

      if (userLikes[postId]) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      } else {
        await setDoc(likeRef, { liked: true });
        await updateDoc(postRef, {
          likeCount: increment(1),
        });
      }
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  const uploadMethod = () => {
    Alert.alert("Create a Post", "Choose Upload Options:", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Album", onPress: fromAlbum },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }
    const selectedImage = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      createPost([selectedImage.assets[0].uri]);
    }
  };

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

  const createPost = (localURIs: string[]) => {
    navigation.navigate("CreatePost", { imageURIs: localURIs });
  };

  const handleReview = (postId: string) => {
    setExpandedReview((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const addCity = async (city: {
    id: string;
    name: string;
    country: string;
  }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("User not signed in.");
        return;
      }
      const userFavoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);

      await setDoc(
        userFavoritesRef,
        {
          [city.id]: {
            city_name: city.name,
            country_name: city.country,
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error adding to favorites:", err);
    }
  };

  const removeCity = async (city: {
    id: string;
    name: string;
    country: string;
  }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userFavoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);

      await setDoc(
        userFavoritesRef,
        {
          [city.id]: deleteField(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error removing from favorites:", err);
    }
  };

  const onScrollImage = (
    postId: string,
    offsetX: number,
    imageWidth: number
  ) => {
    const index = Math.round(offsetX / imageWidth);
    setPostImageIndices((prev) => ({
      ...prev,
      [postId]: index,
    }));
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(FIREBASE_DB, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      const friendsArray: string[] = data?.friends || [];

      const friendMap: { [uid: string]: boolean } = {};
      friendsArray.forEach((uid) => (friendMap[uid] = true));
      setUserFriends(friendMap);

      const sentRequests: { to: string }[] = data?.friendRequestsSent || [];
      const sentMap: { [uid: string]: boolean } = {};
      sentRequests.forEach((req) => (sentMap[req.to] = true));
      setFriendRequestsSent(sentMap);

      const incomingReqs: { from: string; timestamp: number }[] =
        data?.friendRequests || [];
      const receieved: { [uid: string]: boolean } = {};
      incomingReqs.forEach((req) => (receieved[req.from] = true));
      setFriendRequestsReceieved(receieved);
    });

    return () => unsubscribe();
  }, []);

  const addFriend = async (friendUid: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    if (
      friendUid === user.uid ||
      userFriends[friendUid] ||
      friendRequestsSent[friendUid]
    ) {
      return;
    }

    try {
      const senderRef = doc(FIREBASE_DB, "users", user.uid);
      const recRef = doc(FIREBASE_DB, "users", friendUid);
      const rec = await getDoc(recRef);
      const recData = rec.data();
      const pendingStatus = (recData?.friendRequests || []).some(
        (req: any) => req.from === user.uid
      );
      const timestamp = Date.now();

      if (pendingStatus) {
        Alert.alert("A friend request is already pending from this user.");
        return;
      }

      await updateDoc(recRef, {
        friendRequests: arrayUnion({ from: user.uid, timestamp }),
      });
      await updateDoc(senderRef, {
        friendRequestsSent: arrayUnion({ to: friendUid, timestamp }),
      });

      Alert.alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Props to pass to PostItem
  const postItemProps = {
    postImageIndices,
    onScrollImage,
    onHandleReview: handleReview,
    expandedReview,
    currentUser,
    userFriends,
    friendRequestsSent,
    friendRequestsReceieved,
    onAddFriend: addFriend,
    onLikePost: likesOnPost,
    userLikes,
    userFavorites,
    onRemoveCity: removeCity,
    onAddCity: addCity,
  };

  // Filter posts for friends tab
  const friendsPosts = posts.filter((post) => userFriends[post.uid]);

  // Render community tab content
  const renderCommunityTab = () => (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={homeStyles.homeContainer}
      renderItem={({ item }) => <PostItem item={item} {...postItemProps} />}
    />
  );

  // Render friends tab content
  const renderFriendsTab = () => {
    if (friendsPosts.length === 0) {
      return (
        <View style={homeStyles.emptyContainer}>
          <MaterialCommunityIcons name="account-group" size={64} color="#ccc" />
          <Text style={homeStyles.emptyText}>No friends' posts yet</Text>
          <Text style={homeStyles.emptySubtext}>
            Add friends to see their travel photos here
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={friendsPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.homeContainer}
        renderItem={({ item }) => <PostItem item={item} {...postItemProps} />}
      />
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/home_page_background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={homeStyles.headerContainer}>
          <Text style={homeStyles.title}>Explore</Text>

          {/* Tab Switcher */}
          <View style={homeStyles.tabContainer}>
            <TouchableOpacity
              style={[
                homeStyles.tab,
                activeTab === "community" && homeStyles.activeTab,
              ]}
              onPress={() => setActiveTab("community")}
            >
              <Text
                style={[
                  homeStyles.tabText,
                  activeTab === "community" && homeStyles.activeTabText,
                ]}
              >
                Community
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                homeStyles.tab,
                activeTab === "friends" && homeStyles.activeTab,
              ]}
              onPress={() => setActiveTab("friends")}
            >
              <Text
                style={[
                  homeStyles.tabText,
                  activeTab === "friends" && homeStyles.activeTabText,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === "community" ? renderCommunityTab() : renderFriendsTab()}

        {/* Upload button */}
        <TouchableOpacity style={styles.topRightIcon} onPress={uploadMethod}>
          <GlassView style={styles.glassButton}>
            <Ionicons name="add" size={26} color="#000" />
          </GlassView>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Home;