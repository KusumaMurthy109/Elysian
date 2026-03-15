/**
 * File: favorites.tsx
 *
 * This file renders the Favorites page where users can view, add,
 * and remove cities they have liked. Favorite cities are loaded
 * from Firebase in real time so the screen stays updated.
 *
 * Users can search for new cities to favorite, open a city to see
 * more details and manage their saved places.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput } from "react-native-paper";
import { styles } from "../styles/app_styles.styles";
import { favoritesStyles } from "../styles/favorites.styles";

import { getAuth } from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteField,
  setDoc,
  getDocs,
  getDoc,
  collection,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { GlassView } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import PenguinLoader from "./penguin_loader";

interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number; // Score is optional here
  description?: string;
  image?: string;
  addedAt?: number;
}

interface City {
  id: string;
  name: string;
  country: string;
}

// Favorites component
const Favorites = () => {
  const [favorites, setFavorites] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<Recommendation | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);

  const doubleTap = useRef<number | null>(null);
  const [sortOption, setSortOption] = useState<"oldest" | "alphabetical">(
    "oldest"
  );
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const handlePress = (city: Recommendation) => {
    const now = Date.now();
    if (doubleTap.current && now - doubleTap.current < 300) {
      setSelectedCity(city);
      setCityModalOpen(true);
    }
    doubleTap.current = now;
  };

  // Fetches all cities in the training set from Firebase.
  // This sets the list of all cities users can search for to favorite.
  const fetchAllCities = async () => {
    try {
      const citiesCol = collection(FIREBASE_DB, "allCities");
      const snapshot = await getDocs(citiesCol);

      const citiesList: City[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().city_name,
        country: doc.data().country_name,
      }));

      setCities(citiesList);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const getCityData = async (cityId: string) => {
    try {
      const cityRef = doc(FIREBASE_DB, "allCities", cityId);
      const citySnap = await getDoc(cityRef);

      if (!citySnap.exists()) {
        return {
          description: undefined,
          image: undefined,
        };
      }

      const cityData = citySnap.data();

      return {
        description: cityData.description || undefined,
        image:
          cityData.image ||
          cityData.image_url ||
          cityData.imageUrl ||
          cityData.url ||
          undefined,
      };
    } catch (err) {
      console.error("Error fetching city data:", err);
      return {
        description: undefined,
        image: undefined,
      };
    }
  };

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

  // Calls fetchAllCities on page init
  useEffect(() => {
    fetchAllCities();
  }, []);

  // Adds a city to userFavorites.
  // This is for when users select a city in the search bar.
  const addToFavorites = async (city: City) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userFavoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);
      const cityData = await getCityData(city.id);

      await setDoc(
        userFavoritesRef,
        {
          [city.id]: {
            city_name: city.name,
            country_name: city.country,
            image: cityData.image || null,
            description: cityData.description || null,
            addedAt: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error adding to favorites:", err);
    }
  };

  // Removes city from Favorites.
  const removeFavorite = async (city: Recommendation) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const favoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);
      const dislikesRef = doc(FIREBASE_DB, "userDislikes", user.uid);

      // 1) Remove from favorites
      await updateDoc(favoritesRef, {
        [city.city_id]: deleteField(),
      });

      // 2) Add to dislikes (merge so we don't overwrite existing dislikes)
      await setDoc(
        dislikesRef,
        {
          [city.city_id]: {
            city_name: city.city_name,
            country_name: city.country,
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  // Use navigation system for search bar icon
  const navigation = useNavigation();

  // When handleSeachbar is called (search bar icon pressed) it goes to itinerary.tsx page
  const handleItinerary = () => {
    navigation.navigate("Itinerary" as never);
  };

  // Load liked locations from Firestore.
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("No user signed in.");
      return;
    }

    setLoading(true);

    const favoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);

    const unsubscribe = onSnapshot(
      favoritesRef,
      async (snapshot) => {
        try {
          if (!snapshot.exists()) {
            setFavorites([]);
            setError("No favorites found.");
            setLoading(false);
            return;
          }

          setError(null);

          const cityData = snapshot.data() || {};
          const favoritesArray: Recommendation[] = Object.keys(cityData).map(
            (key) => {
              const city = cityData[key];

              return {
                city_id: key,
                city_name: city.city_name ?? "",
                country: city.country_name ?? "",
                image: city.image || undefined,
                description: city.description || undefined,
                addedAt: city.addedAt,
              };
            }
          );

          setFavorites(favoritesArray);
        } catch (err) {
          console.error("Error building favorites array:", err);
          setError("Failed to load liked places.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setError("Failed to load liked places.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortOption === "alphabetical") {
      const cityA = a.city_name ?? "";
      const cityB = b.city_name ?? "";
      return cityA.localeCompare(cityB);
    }

    return (
      (a.addedAt ?? Number.MAX_SAFE_INTEGER) -
      (b.addedAt ?? Number.MAX_SAFE_INTEGER)
    );
  });
  return (
    <ImageBackground
      source={require("../../assets/favorites_page_background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Itinerary Icon (hidden when search is open) */}
        {!searchOpen && (
          <TouchableOpacity
            style={favoritesStyles.itineraryIcon}
            onPress={() => handleItinerary()}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="list" size={26} color="#000" />
            </GlassView>
          </TouchableOpacity>
        )}

        {/* Search Icon and Bar */}
        <View style={styles.searchOverlay}>
          {/* Absolute search icon */}
          <TouchableOpacity
            style={styles.topRightIcon}
            onPress={() => setSearchOpen((prev) => !prev)}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="search" size={26} color="#000" />
            </GlassView>
          </TouchableOpacity>

          {/* Expanded search bar behind the icon */}
          {searchOpen && (
            <GlassView style={styles.searchBarExpanded}>
              <TextInput
                placeholder="Search cities..."
                placeholderTextColor="#807f7fff"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setDropdownOpen(true);
                }}
                style={styles.searchInput}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                autoFocus
                caretHidden={false}
                selectionColor="#000"
              />
            </GlassView>
          )}
        </View>

        {/* Tap outside to close search */}
        {searchOpen && (
          <Pressable
            style={styles.searchBackdrop}
            onPress={() => {
              setSearchOpen(false);
              setSearchQuery("");
              setDropdownOpen(false);
              Keyboard.dismiss();
            }}
          />
        )}

        {/* Dropdown Results */}
        {searchOpen && dropdownOpen && searchQuery.length > 0 && (
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
                        addToFavorites(city); // Add to userFavorites
                        setSearchOpen(false); // Close search bar
                        setSearchQuery(""); // Clear text
                        setDropdownOpen(false); // Close dropdown
                      }}
                    >
                      <Text style={styles.searchResultItemText}>
                        {city.name}, {city.country}
                      </Text>
                    </TouchableOpacity>
                  ))
              ) : (
                <View style={styles.searchResultItem}>
                  <Text style={styles.searchResultNoneText}>No Results</Text>
                </View>
              )}
            </ScrollView>
          </GlassView>
        )}

        {/* Favorites list */}
        {!searchOpen && (
          <>
            {loading && <PenguinLoader text="Loading your favorite cities!" />}
            {error && !loading && <PenguinLoader text={error} />}

            <ScrollView contentContainerStyle={styles.homeContainer}>
              <Text variant="headlineLarge" style={favoritesStyles.title}>
                Favorites
              </Text>

              <View style={favoritesStyles.sortRow}>
                <TouchableOpacity
                  onPress={() => setSortMenuOpen(true)}
                  style={favoritesStyles.sortIconWrapper}
                >
                  <Ionicons name="funnel-outline" size={14} color="#444" />
                </TouchableOpacity>
              </View>

              {!loading && sortedFavorites.length > 0 && (
                <View style={favoritesStyles.resultsContainer}>
                  {sortedFavorites.map((city) => (
                    <Pressable
                      key={city.city_id}
                      onPress={() => {
                        handlePress(city);
                      }}
                      style={favoritesStyles.cityCard}
                    >
                      {city.image ? (
                        <Image
                          source={{ uri: city.image }}
                          style={favoritesStyles.cityCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={favoritesStyles.cityCardPlaceholder} />
                      )}

                      <View style={favoritesStyles.cityCardBlurContainer}>
                        <MaskedView
                          maskElement={
                            <LinearGradient
                              colors={["transparent", "rgba(255,255,255,0.9)"]}
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
                      </View>

                      <View style={favoritesStyles.cityCardTextContainer}>
                        <Text style={favoritesStyles.cityCardText}>
                          {city.city_name}, {city.country}
                        </Text>
                      </View>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFavorite(city);
                        }}
                        style={[
                          favoritesStyles.removeIconBtn,
                          favoritesStyles.removeIconBtnShadow,
                        ]}
                      >
                        <Ionicons name="bookmark" size={18} color="#fff" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </>
        )}

        <Modal
          visible={sortMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSortMenuOpen(false)}
        >
          <Pressable
            style={favoritesStyles.sortMenuOverlay}
            onPress={() => setSortMenuOpen(false)}
          >
            <View style={favoritesStyles.sortMenu}>
              <TouchableOpacity
                onPress={() => {
                  setSortOption("oldest");
                  setSortMenuOpen(false);
                }}
                style={favoritesStyles.sortMenuItem}
              >
                <Text
                  style={[
                    favoritesStyles.sortMenuText,
                    sortOption === "oldest" &&
                      favoritesStyles.sortMenuTextActive,
                  ]}
                >
                  Oldest to Newest
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSortOption("alphabetical");
                  setSortMenuOpen(false);
                }}
                style={favoritesStyles.sortMenuItem}
              >
                <Text
                  style={[
                    favoritesStyles.sortMenuText,
                    sortOption === "alphabetical" &&
                      favoritesStyles.sortMenuTextActive,
                  ]}
                >
                  Alphabetical
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Full-screen dim overlay */}
        <Modal
          visible={cityModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCityModalOpen(false)}
        >
          <View style={styles.modalDimOverlay}>
            {/* Tap outside to close */}
            <Pressable
              style={{ position: "absolute", width: "100%", height: "100%" }}
              onPress={() => setCityModalOpen(false)}
            />

            {/* Modal content */}
            {selectedCity && (
              <View style={styles.cityModalContainer}>
                <ScrollView contentContainerStyle={styles.cityModalContent}>
                  {selectedCity.image && (
                    <Image
                      source={{ uri: selectedCity.image }}
                      style={styles.cityModalImage}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={styles.cityModalTitle}>
                    {selectedCity.city_name}, {selectedCity.country}
                  </Text>

                  <Text style={styles.cityModalDescriptionLabel}>
                    Description:
                  </Text>

                  <Text style={styles.cityModalDescription}>
                    {selectedCity.description ||
                      `${selectedCity.city_name} is a destination known for its culture, atmosphere, and local attractions.`}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Favorites;
