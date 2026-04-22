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

// React Imports
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Firebase Imports
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

// File Imports
import SearchOverlay from "../components/search_overlay_component";
import PenguinLoader from "./penguin_loader";
import { styles } from "../styles/app_styles.styles";
import { favoritesStyles } from "../styles/favorites.styles";
import { homeStyles } from "../styles/home.styles";
import { triggerLightHaptic, triggerSuccessHaptic } from "../utils/effects";

// Other Imports
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";


interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number;
  description?: string;
  image?: string;
  addedAt?: number;
}

interface City {
  id: string;
  name: string;
  country: string;
}

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
  const [sortOption, setSortOption] = useState<"newest" | "alphabetical">(
    "newest"
  );

  const handlePress = async (city: Recommendation) => {
    const now = Date.now();
    if (doubleTap.current && now - doubleTap.current < 300) {
      await triggerLightHaptic();
      setSelectedCity(city);
      setCityModalOpen(true);
    }
    doubleTap.current = now;
  };

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
        image: cityData.url || undefined,
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
      return () => {
        setSearchOpen(false);
        setSearchQuery("");
        setDropdownOpen(false);
      };
    }, [])
  );

  useEffect(() => {
    fetchAllCities();
  }, []);

  const addToFavorites = async (city: City) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      await triggerSuccessHaptic();

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

  const removeFavorite = async (city: Recommendation) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      await triggerLightHaptic();

      const favoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);
      const dislikesRef = doc(FIREBASE_DB, "userDislikes", user.uid);

      await updateDoc(favoritesRef, {
        [city.city_id]: deleteField(),
      });

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

  const navigation = useNavigation();

  const handleItinerary = async () => {
    await triggerLightHaptic();
    navigation.navigate("Itinerary" as never);
  };

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
            setError(null);
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
      (b.addedAt ?? Number.MAX_SAFE_INTEGER) -
      (a.addedAt ?? Number.MAX_SAFE_INTEGER)
    );
  });

  return (
    <ImageBackground
      source={require("../../assets/favorites_page_background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {!searchOpen && (
          <TouchableOpacity
            style={favoritesStyles.itineraryIcon}
            onPress={handleItinerary}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="list" size={26} color="#000" />
            </GlassView>
          </TouchableOpacity>
        )}

        <SearchOverlay
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          value={searchQuery}
          onChange={(text) => {
            setSearchQuery(text);
            setDropdownOpen(true);
          }}
          placeholder="Search cities to favorite..."
          onClose={() => {
            setSearchQuery("");
            setDropdownOpen(false);
          }}
        >
          {dropdownOpen && searchQuery.length > 0 && (
            <GlassView style={styles.searchDropdown}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {cities
                  .filter((c) =>
                    `${c.name}, ${c.country}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={styles.searchResultItem}
                      onPress={async () => {
                        await addToFavorites(city);
                        setSearchOpen(false);
                        setSearchQuery("");
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.searchResultItemText}>
                        {city.name}, {city.country}
                      </Text>
                    </TouchableOpacity>
                  ))}

                {cities.filter((c) =>
                  `${c.name}, ${c.country}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length === 0 && (
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

        {/* MAIN CONTENT */}
        {!searchOpen && (
          <>
            {loading && <PenguinLoader text="Loading your favorite cities!" />}
            {error && !loading && <PenguinLoader text={error} />}

            <View style={styles.headerContainer}>
              <Text style={favoritesStyles.title}>Favorites</Text>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    sortOption === "newest" && styles.activeTab,
                  ]}
                  onPress={async () => {
                    await triggerLightHaptic();
                    setSortOption("newest");
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      sortOption === "newest" && styles.activeTabText,
                    ]}
                  >
                    Newest to Oldest
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    sortOption === "alphabetical" && styles.activeTab,
                  ]}
                  onPress={async () => {
                    await triggerLightHaptic();
                    setSortOption("alphabetical");
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      sortOption === "alphabetical" && styles.activeTabText,
                    ]}
                  >
                    Alphabetical
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.homeContainer}>
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

            {!loading && !error && sortedFavorites.length === 0 && (
              <View style={[homeStyles.emptyContainer, { marginTop: -1000 }]}>
                <Image
                  source={require("../../assets/penguin.png")}
                  style={homeStyles.emptyPageImage}
                  resizeMode="contain"
                />
                <Text style={homeStyles.emptyText}>No Favorite Cities Yet</Text>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Favorites;
