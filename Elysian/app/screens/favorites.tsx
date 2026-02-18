import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, TextInput } from "react-native-paper";
import { styles } from "./app_styles.styles";
import { favoritesStyles } from "./favorites.styles";

import { getAuth } from "firebase/auth";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteField,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { GlassView } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number;
  description?: string;
  image?: string;
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

  const navigation = useNavigation();

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

  const removeFavorite = async (city: Recommendation) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const favoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);
      const dislikesRef = doc(FIREBASE_DB, "userDislikes", user.uid);

      await updateDoc(favoritesRef, { [city.city_id]: deleteField() });
      await setDoc(
        dislikesRef,
        { [city.city_id]: { city_name: city.city_name, country: city.country } },
        { merge: true }
      );
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const handleItinerary = () => {
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
            setError("No favorites found.");
            setLoading(false);
            return;
          }

          setError(null);
          const cityData = snapshot.data() || {};

          const favoritesArray: Recommendation[] = Object.keys(cityData).map(
            (key) => ({
              city_id: key,
              city_name: cityData[key].city_name,
              country: cityData[key].country_name,
              image: cityData[key].image,
              description: cityData[key].description,
            })
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

      {/* Search bar & icon */}
      <View style={styles.searchOverlay}>
        <TouchableOpacity
          style={styles.topRightIcon}
          onPress={() => setSearchOpen((prev) => !prev)}
        >
          <GlassView style={styles.glassButton}>
            <Ionicons name="search" size={26} color="#000" />
          </GlassView>
        </TouchableOpacity>

        {searchOpen && (
          <GlassView style={styles.searchBarExpanded}>
            <TextInput
              placeholder="Search cities..."
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

      {searchOpen && (
        <Pressable
          style={styles.searchBackdrop}
          onPress={() => {
            setSearchOpen(false);
            setSearchQuery("");
            setDropdownOpen(false);
          }}
        />
      )}

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
                    <Text>
                      {city.name}, {city.country}
                    </Text>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.searchResultItem}>
                <Text style={{ color: "#888" }}>No Results</Text>
              </View>
            )}
          </ScrollView>
        </GlassView>
      )}

      {/* Favorites list */}
      {!searchOpen && (
        <ScrollView contentContainerStyle={styles.homeContainer}>
          <Text variant="headlineLarge" style={favoritesStyles.title}>
            Favorites
          </Text>

          {loading && <Text style={styles.sectionTitle}>Loading favorites...</Text>}
          {error && !loading && <Text>{error}</Text>}

          {!loading && favorites.length > 0 && (
            <View style={favoritesStyles.resultsContainer}>
              {favorites.map((city) => (
                <Pressable
                  key={city.city_id}
                  onPress={() => {
                    setSelectedCity(city);
                    setCityModalOpen(true);
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
                      <BlurView intensity={100} tint="dark" style={{ flex: 1 }} />
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
      )}

      {/* Modal */}
      {cityModalOpen && (
        <Pressable style={styles.cityModalOverlay} onPress={() => setCityModalOpen(false)} />
      )}

      {cityModalOpen && selectedCity && (
        <View style={styles.cityModalContainer}>
          <ScrollView contentContainerStyle={styles.cityModalContent}>
            <Text style={styles.cityModalTitle}>
              {selectedCity.city_name}, {selectedCity.country}
            </Text>

            {selectedCity.image && (
              <Image
                source={{ uri: selectedCity.image }}
                style={styles.cityModalImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.cityModalDescription}>
              {selectedCity.description || "No description available."}
            </Text>
          </ScrollView>
          <Button
            mode="contained"
            onPress={() => setCityModalOpen(false)}
            style={styles.cityModalCloseBtn}
          >
            Close
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Favorites;
