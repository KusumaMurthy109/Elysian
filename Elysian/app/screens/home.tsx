/**
 * file: home.tsx
 *
 * This file renders the main Explore page where users can browse
 * images shared by others and upload their own travel photos.
 *
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Alert,
  Keyboard,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles/app_styles.styles";
import { homeStyles } from "../styles/home.styles";
import { favoritesStyles } from "../styles/favorites.styles";

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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "./navigation_bar";
import { getAuth } from "firebase/auth";
import PostItem, { Post } from "../components/post_component";
import { triggerSuccessHaptic, triggerLightHaptic } from "../utils/effects";

import SearchOverlay from "../components/search_overlay_component";


type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface City {
  id: string;
  name: string;
  country: string;
}

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
  const [userLikes, setUserLikes] = useState<{ [postId: string]: boolean }>({});
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchingCity, setSearchingCity] = useState<City | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Screen focused → do nothing

      return () => {
        // Screen blurred → reset UI state
        setSearchOpen(false);
        setSearchQuery("");
        setDropdownOpen(false);
      };
    }, [])
  );
  useEffect(() => {
    const uniqueCities: City[] = [];

    posts.forEach((post) => {
      if (post.city && post.city.id) {
        const exists = uniqueCities.some((c) => c.id === post.city.id);
        if (!exists) {
          uniqueCities.push({
            id: post.city.id,
            name: post.city.name,
            country: post.city.country,
          });
        }
      }
    });

    setCities(uniqueCities);
  }, [posts]);

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
        await triggerLightHaptic();

        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      } else {
        await triggerSuccessHaptic();

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
  const renderCommunityTab = () => {
    if (posts.length === 0) {
      return (
        <View style={homeStyles.emptyContainer}>
          <Image
            source={require("../../assets/penguin.png")}
            style={homeStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={homeStyles.emptyText}>No Community Posts Yet</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.homeContainer}
        renderItem={({ item }) => <PostItem item={item} {...postItemProps} />}
      />
    );
  };

  // Render friends tab content
  const renderFriendsTab = () => {
    if (friendsPosts.length === 0) {
      return (
        <View style={homeStyles.emptyContainer}>
          <Image
            source={require("../../assets/penguin.png")}
            style={homeStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={homeStyles.emptyText}>No Friends' Posts Yet</Text>
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

        {/* ===== HEADER ===== */}
        {!searchOpen && (
          <View style={styles.headerContainer}>
            <Text style={homeStyles.title}>Explore</Text>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "community" && styles.activeTab,
                ]}
                onPress={async () => {
                  await triggerLightHaptic();
                  setActiveTab("community");
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "community" && styles.activeTabText,
                  ]}
                >
                  Community
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "friends" && styles.activeTab,
                ]}
                onPress={async () => {
                  await triggerLightHaptic();
                  setActiveTab("friends");
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "friends" && styles.activeTabText,
                  ]}
                >
                  Friends
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===== MAIN CONTENT ===== */}
        {!searchOpen &&
          (activeTab === "community"
            ? renderCommunityTab()
            : renderFriendsTab())}

        {/* ===== CREATE POST BUTTON ===== */}
        {!searchOpen && (
          <TouchableOpacity
            style={favoritesStyles.itineraryIcon}
            onPress={async () => {
              await triggerLightHaptic();
              uploadMethod();
            }}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="add" size={26} color="#000" />
            </GlassView>
          </TouchableOpacity>
        )}

        {/* ===== SEARCH OVERLAY ===== */}
        <SearchOverlay
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          value={searchQuery}
          placeholder="Search cities..."
          dismissOnBackdropPress={false}
          onChange={(text) => {
            setSearchQuery(text);
            setDropdownOpen(true);
            setSearchingCity(null);
            setFilteredPosts([]);
          }}
          onClose={() => {
            setSearchQuery("");
            setDropdownOpen(false);
            setSearchingCity(null);
            setFilteredPosts([]);
          }}
        >
          {/* ===== FILTERED POSTS VIEW ===== */}
          {searchingCity && (
            <View style={styles.filteredPostsContainer}>
              <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <PostItem item={item} {...postItemProps} />
                )}
                contentContainerStyle={homeStyles.homeContainer}
              />
            </View>
          )}

          {/* ===== DROPDOWN RESULTS ===== */}
          {dropdownOpen && searchQuery.length > 0 && (
            <GlassView style={styles.searchDropdown}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {cities.filter((city) =>
                  `${city.name}, ${city.country}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length > 0 ? (
                  cities
                    .filter((city) =>
                      `${city.name}, ${city.country}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={styles.searchResultItem}
                        onPress={() => {
                          setSearchingCity(city);
                          setSearchQuery(`${city.name}, ${city.country}`);

                          const matches = posts.filter(
                            (p) => p.city?.id === city.id
                          );

                          setFilteredPosts(matches);
                          setDropdownOpen(false);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.searchResultItemText}>
                          {city.name}, {city.country}
                        </Text>
                      </TouchableOpacity>
                    ))
                ) : (
                  <View style={styles.searchResultItem}>
                    <Text style={styles.searchResultNoneText}>
                      No Results
                    </Text>
                  </View>
                )}
              </ScrollView>
            </GlassView>
          )}
        </SearchOverlay>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Home;
