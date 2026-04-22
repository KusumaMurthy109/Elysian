/* 
File: user_itineraries.tsx
Function: This is the user's itineraries subtab screen component for the Profile page. 
*/

// React Imports
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Pressable,
  Image,
  Modal,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Firebase Imports
import { getAuth } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";

// File Imports
import { ProfileStackParamList } from "./navigation_bar";
import { styles } from "../styles/app_styles.styles";
import { profileStyles } from "../styles/profile.styles";
import { itinerarySubTabStyles } from "../styles/user_itineraries.styles";

// Other Imports
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";


type ProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "ProfileMain"
>;


export type Itinerary = {
  id: string;
  activities: Activity[];
  city: string;
  country: string;
  imageUrl?: string | null;
  ownerId: string;
  sharedWith: string[];
};

export type Activity = {
  name: string;
  likes: string[];
};

const UserItineraries = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  const [openItinerary, setOpenItinerary] = useState<Itinerary | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(
    null
  );
  const [newActivity, setNewActivity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addedUserId, setAddedUserId] = useState<string | null>(null);
  const [sharedUsernames, setSharedUsernames] = useState<string[]>([]);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const navigation = useNavigation<ProfileNav>();


  const auth = getAuth();
  const currentUser = auth.currentUser;
  const doubleTap = useRef<number | null>(null);
  const getCityImage = async (city: string, country: string) => {
    try {
      const citiesSnap = await getDocs(collection(FIREBASE_DB, "allCities"));

      const match = citiesSnap.docs.find((docSnap) => {
        const data = docSnap.data();
        return data.city_name === city && data.country_name === country;
      });

      if (!match) return null;

      const cityData = match.data();
      return cityData.url || null;
    } catch (error) {
      console.error("Error fetching city image from allCities:", error);
      return null;
    }
  };

  const [deleteItinerary, setDeleteItinerary] = useState<string | null>(null);

  /* ------------------ HOOKS ------------------ */
  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return;

    const qOwned = query(
      collection(FIREBASE_DB, "itineraries"),
      where("ownerId", "==", currentUser.uid)
    );

    const qShared = query(
      collection(FIREBASE_DB, "itineraries"),
      where("sharedWith", "array-contains", currentUser.uid)
    );

    const unsubOwned = onSnapshot(qOwned, async (ownedSnap) => {
      const ownedData: Itinerary[] = ownedSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Itinerary, "id">),
      }));

      const imageEntries = await Promise.all(
        ownedData.map(async (itin) => {
          const image = await getCityImage(itin.city, itin.country);
          return [itin.id, image] as const;
        })
      );

      setCityImages((prev) => ({
        ...prev,
        ...Object.fromEntries(imageEntries),
      }));

      setItineraries((prev) => [
        ...ownedData,
        ...prev.filter((i) => i.ownerId !== currentUser.uid),
      ]);
      setLoading(false);
    });

    const unsubShared = onSnapshot(qShared, async (sharedSnap) => {
      const sharedData: Itinerary[] = sharedSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Itinerary, "id">),
      }));

      const imageEntries = await Promise.all(
        sharedData.map(async (itin) => {
          const image = await getCityImage(itin.city, itin.country);
          return [itin.id, image] as const;
        })
      );

      setCityImages((prev) => ({
        ...prev,
        ...Object.fromEntries(imageEntries),
      }));

      setItineraries((prev) => [
        ...prev.filter((i) => i.ownerId === currentUser.uid),
        ...sharedData,
      ]);
      setLoading(false);
    });

    return () => {
      unsubOwned();
      unsubShared();
    };
  }, []);

  useEffect(() => {
    if (!openItinerary) return;
    const itinRef = doc(FIREBASE_DB, "itineraries", openItinerary.id);

    const unsub = onSnapshot(itinRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        setOpenItinerary((prev) => ({ ...prev!, ...data }));
      }
    });
    return () => unsub();
  }, [openItinerary?.id]);

  useEffect(() => {
    if (!openItinerary) return;
    const fetchSharedUsers = async () => {
      const usernames: string[] = [];
      for (const uid of openItinerary.sharedWith) {
        const snap = await getDoc(doc(FIREBASE_DB, "users", uid));
        if (snap.exists()) usernames.push(snap.data().username);
      }
      setSharedUsernames(usernames);
    };
    fetchSharedUsers();
  }, [openItinerary]);

  useEffect(() => {
    if (!openItinerary) return;
    const fetchOwnerUsername = async () => {
      const snap = await getDoc(
        doc(FIREBASE_DB, "users", openItinerary.ownerId)
      );
      if (snap.exists()) setOwnerUsername(snap.data().username);
    };
    fetchOwnerUsername();
  }, [openItinerary]);

  useEffect(() => {
    if (!shareModalOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setAddedUserId(null);
    }
  }, [shareModalOpen]);

  /* ------------------ FUNCTIONS ------------------ */

  const [cityImages, setCityImages] = useState<{
    [key: string]: string | null;
  }>({});

  const handleDeleteItinerary = async (itineraryId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "itineraries", itineraryId));
      setDeleteItinerary(null);
    } catch (error) {
      console.error("Error deleting itinerary:", error);
    }
  };

  const handleSearchUsers = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") return setSearchResults([]);

    if (!selectedItinerary) return;
    // Fetch itinerary data
    const itinSnap = await getDoc(
      doc(FIREBASE_DB, "itineraries", selectedItinerary.id)
    );
    if (!itinSnap.exists()) return;
    const itinData = itinSnap.data() as any;
    const { sharedWith = [], ownerId } = itinData;

    // Get the user data so we can find their friends.
    const userSnap = await getDoc(
      doc(FIREBASE_DB, "users", ownerId)
    );
    if (!userSnap.exists()) return;
    const { friends = [] } = userSnap.data() as any; // Get the friends of the owner.

    const lower = text.toLowerCase();
    const upper = text.charAt(0).toUpperCase() + text.slice(1);

    const q1 = query(
      collection(FIREBASE_DB, "users"),
      where("username", ">=", lower),
      where("username", "<=", lower + "\uf8ff")
    );
    const q2 = query(
      collection(FIREBASE_DB, "users"),
      where("username", ">=", upper),
      where("username", "<=", upper + "\uf8ff")
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const results = [...snap1.docs, ...snap2.docs]
      .map((doc) => ({ uid: doc.id, username: doc.data().username }))
      // Remove duplicates.
      .filter((v, i, a) => a.findIndex((t) => t.uid === v.uid) === i)
      // Only include friends.
      .filter((v) => friends.includes(v.uid))
      // Remove users already shared and the owner
      .filter((v) => !sharedWith.includes(v.uid) && v.uid !== ownerId);

    setSearchResults(results);
  };

  const handleAddUserToItinerary = async (userToAdd: any) => {
    if (!selectedItinerary) return;
    const itinRef = doc(FIREBASE_DB, "itineraries", selectedItinerary.id);
    await updateDoc(itinRef, { sharedWith: arrayUnion(userToAdd.uid) });
    setAddedUserId(userToAdd.uid);
    setTimeout(() => setAddedUserId(null), 800);
  };

  const handleSelectUser = async (user: any) => {
    await handleAddUserToItinerary(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (loading) {
    return (
      <View style={itinerarySubTabStyles.itineraryEmpty}>
        <Image
          source={require("../../assets/penguin.png")}
          style={profileStyles.emptyPageImage}
          resizeMode="contain"
        />
        <Text style={itinerarySubTabStyles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (itineraries.length === 0) {
    return (
      <View style={itinerarySubTabStyles.itineraryEmpty}>
        <Image
          source={require("../../assets/penguin.png")}
          style={profileStyles.emptyPageImage}
          resizeMode="contain"
        />
        <Text style={itinerarySubTabStyles.emptyText}>
          No Itineraries Created
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <Pressable onPress={() => setDeleteItinerary(null)}>
          <View style={profileStyles.scrollContainer}>
            {itineraries.map((itin) => {
              return (
                <View key={itin.id} style={profileStyles.scrollGrid}>
                  <Pressable
                    onPress={() => {
                      if (deleteItinerary) return;

                      const now = Date.now();
                      if (doubleTap.current && now - doubleTap.current < 300) {
                        navigation.navigate("ItineraryCoPlanning", {
                          itineraryId: itin.id,
                          imageUrl: cityImages[itin.id],
                        });
                      }

                      doubleTap.current = now;
                    }}
                    onLongPress={() => {
                      if (itin.ownerId !== currentUser?.uid) return; // Check if user is creator of itinerary
                      setDeleteItinerary(itin.id);
                    }}
                    delayLongPress={300}
                  >
                    <View style={profileStyles.scrollCard}>
                      <ImageBackground
                        source={
                          cityImages[itin.id]
                            ? { uri: cityImages[itin.id]! }
                            : undefined
                        }
                        style={profileStyles.scrollCard}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedItinerary(itin);
                            setShareModalOpen(true);
                          }}
                        >
                          <View style={itinerarySubTabStyles.shareOverlay}>
                            <View style={itinerarySubTabStyles.shareTag}>
                              <Ionicons
                                name="person-add"
                                size={17}
                                color="#000"
                              />
                            </View>
                          </View>
                        </TouchableOpacity>

                        <View style={profileStyles.scrollCardBlurContainer}>
                          <MaskedView
                            maskElement={
                              <LinearGradient
                                colors={[
                                  "transparent",
                                  "rgba(255,255,255,0.9)",
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={{ flex: 1 }}
                              />
                            }
                            style={{ flex: 1 }}
                          >
                            <BlurView
                              intensity={100}
                              tint="dark"
                              style={{ flex: 1 }}
                            />
                          </MaskedView>

                          <View style={profileStyles.cardCityTextContainer}>
                            <Text style={profileStyles.cardCityText}>
                              {itin.city}, {"\n"}
                              {itin.country}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>

                      {/* Delete Overlay */}
                      {deleteItinerary === itin.id && (
                        <View style={profileStyles.deleteOverlay}>
                          <Pressable
                            onPress={() => handleDeleteItinerary(itin.id)}
                          >
                            <Ionicons name="trash" size={40} color="#fff" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Pressable>
      </ScrollView>


      {/* SHARE MODAL */}
      <Modal
        visible={shareModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalOpen(false)}
      >
        <View style={styles.modalDimOverlay}>
          <Pressable
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
            onPress={() => setShareModalOpen(false)}
          />

          <View style={itinerarySubTabStyles.searchModalContainer}>
            <View style={{ flex: 1, width: "100%" }}>
              <TouchableOpacity
                style={profileStyles.closeButtonShared}
                onPress={() => setShareModalOpen(false)}
              >
                <GlassView style={styles.glassButton}>
                  <Ionicons name="close" size={26} color="#000" />
                </GlassView>
              </TouchableOpacity>

              <Text style={itinerarySubTabStyles.shareTitle}>
                Share Itinerary
              </Text>
              <Text style={itinerarySubTabStyles.shareCitySubtitle}>
                {selectedItinerary?.city}, {selectedItinerary?.country}
              </Text>
              <GlassView style={itinerarySubTabStyles.sharedInputBar}>
                <TextInput
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChangeText={handleSearchUsers}
                  style={styles.searchInput}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="#eee"
                  autoFocus
                  caretHidden={false}
                  selectionColor="#000"
                />
              </GlassView>
              {searchQuery ? (
                <View style={{ maxHeight: 180 }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <TouchableOpacity
                          key={user.uid}
                          style={itinerarySubTabStyles.searchResultRow}
                          onPress={() => handleSelectUser(user)}
                        >
                          {/* Username */}
                          <Text
                            style={itinerarySubTabStyles.searchResultUsername}
                          >
                            @{user.username}
                          </Text>

                          {/* Add icon */}
                          <Ionicons name="add" size={24} color="#333" />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={itinerarySubTabStyles.searchResultRow}>
                        <Text style={styles.searchResultNoneText}>
                          No Users Found
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UserItineraries;
