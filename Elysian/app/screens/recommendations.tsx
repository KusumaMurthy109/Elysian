/*
File: recommendations.tsx
Function: Shows one recommended city at a time based on the user’s recommendations page.
Users can swipe right to like or swipe left to skip. The app saves likes
and dislikes to Firebase, loads the next city from the backend, and lets
users double tap a city to open more details in a modal.
*/

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  Modal,
  Dimensions,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { styles } from "../styles/app_styles.styles";
import { recommendationStyles } from "../styles/recommendations.styles";
import { Animated } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import PenguinLoader from "./penguin_loader";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from "../utils/effects";

// Define the navigation parameter list
export type RootParamList = {
  Home: undefined;
  Recommendations: { recommendations: Recommendation[] };
  Liked: undefined;
};

interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score: number;
  description?: string;
  image?: string;
  city_attrs?: string | null;
  addedAt?: number;
}

type City = {
  city_name: string;
  country_name: string;
  score: number;
};

// Home component
const Recommendations = () => {
  // Initialize navigation with type safety
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<Recommendation | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const doubleTap = useRef<number | null>(null);
  const [currentCity, setCurrentCity] = useState<Recommendation | null>(null);
  const currentCityRef = useRef<Recommendation | null>(null);
  const glassAvailable = isLiquidGlassAvailable();
  // Need to get the width and height of screen for the images to fit full page.
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    currentCityRef.current = currentCity;
  }, [currentCity]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No user");

        const city = await fetchNextCity(user.uid);
        const cityData = await getCityData(city.city_id);

        setCurrentCity({
          ...city,
          description: cityData.description,
          image: cityData.image || undefined,
          city_attrs: cityData.city_attrs,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to get recommendations");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const rightSwipe = async (cityId: string, city: City) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Error, User must be signed in!");
      return;
    }

    try {
      await triggerSuccessHaptic();

      const userDocRef = doc(FIREBASE_DB, "userFavorites", user.uid);
      await setDoc(
        userDocRef,
        {
          [`${cityId}`]: {
            ...city,
            image: currentCityRef.current?.image || null,
            description: currentCityRef.current?.description || null,
            addedAt: Date.now(),
          },
        },
        { merge: true }
      );

      const nextCity = await fetchNextCity(user.uid);
      const cityData = await getCityData(nextCity.city_id);

      setCurrentCity({
        ...nextCity,
        description: cityData.description,
        image: cityData.image || undefined,
        city_attrs: cityData.city_attrs,
      });
    } catch (error) {
      await triggerErrorHaptic();
      console.error("Encountered an error while saving your favorites:", error);
      alert("Error, There was an error while saving your favorites.");
    }
  };

  const leftSwipe = async (cityId: string, city: City) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Error, User must be signed in!");
      return;
    }

    try {
      await triggerLightHaptic();

      const userDocRef = doc(FIREBASE_DB, "userDislikes", user.uid);
      await setDoc(userDocRef, { [`${cityId}`]: city }, { merge: true });

      const nextCity = await fetchNextCity(user.uid);
      const cityData = await getCityData(nextCity.city_id);

      setCurrentCity({
        ...nextCity,
        description: cityData.description,
        image: cityData.image || undefined,
        city_attrs: cityData.city_attrs,
      });
    } catch (error) {
      await triggerErrorHaptic();
      console.error("Encountered an error while saving your dislikes:", error);
      alert("Error, There was an error while saving your dislikes.");
    }
  };

  const getCityData = async (cityId: string) => {
    try {
      const docRef = doc(FIREBASE_DB, "allCities", cityId);
      const cityResp = await getDoc(docRef);

      if (!cityResp.exists()) {
        console.warn("City not found:", cityId);
        return {
          description: "No description available.",
          image: null,
          city_attrs: null,
        };
      }

      const cityData = cityResp.data();

      return {
        description: cityData.description || "No description available.",
        image: cityData.url || null,
        city_attrs: cityData.city_attrs || null,
      };
    } catch (error) {
      console.error("Encountered an error while getting city data", error);
      return {
        description: "No description available.",
        image: null,
        city_attrs: null,
      };
    }
  };

  async function getUserProfileAnswers(userId: string) {
    const ref = doc(FIREBASE_DB, "userProfiles", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("User profile not found");
    }

    const data = snap.data();
    const responses = data.responses;

    return {
      origin_country: responses[0],
      vacation_types: responses[1] || [],
      seasons: responses[2] || [],
      budget: responses[3] || [],
      favorite_country_visited: responses[4],
      place_type: responses[5] || [],
    };
  }

  async function fetchNextCity(userId: string) {
    // You need to supply the same profile answers you used to generate recs.
    // If you stored them in Firestore, read them here; for now assume you have them.
    const profile = await getUserProfileAnswers(userId);

    const res = await fetch(
      "https://capstone-team-generated-group30-project.onrender.com/next_city",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          ...profile,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to fetch next city");
    const json = await res.json();
    return json.city as Recommendation;
  }

  const swipeFunction = (direction: "left" | "right") => {
    if (!currentCityRef.current) return;

    const x = direction === "right" ? screenWidth : -screenWidth;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      const city = currentCityRef.current;
      if (!city) return;

      if (direction === "right") {
        rightSwipe(city.city_id, {
          city_name: city.city_name,
          country_name: city.country,
          score: city.score,
        });
      } else {
        leftSwipe(city.city_id, {
          city_name: city.city_name,
          country_name: city.country,
          score: city.score,
        });
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeAction = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipeFunction("right");
        } else if (gesture.dx < -120) {
          swipeFunction("left");
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.solidSafeArea}>
      {/* Loading */}
      {loading && <PenguinLoader text="Finding your perfect destination..." />}

      {/* Error */}
      {error && !loading && <Text>{error}</Text>}

      {/* Current City Card */}
      {!loading && !error && currentCity && (
        <Animated.View
          style={[
            recommendationStyles.cityCardRecommendation,
            {
              width: screenWidth,
              height: screenHeight,
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                {
                  rotate: position.x.interpolate({
                    inputRange: [-screenWidth, 0, screenWidth],
                    outputRange: ["-15deg", "0deg", "15deg"],
                  }),
                },
              ],
            },
          ]}
          {...swipeAction.panHandlers}
        >
          <Pressable
            onPress={async () => {
              const now = Date.now();
              if (doubleTap.current && now - doubleTap.current < 300) {
                await triggerLightHaptic();
                setSelectedCity(currentCity);
                setCityModalOpen(true);
              }
              doubleTap.current = now;
            }}
          >
            {/* This is to make the full-screen image. */}
            {currentCity.image ? (
              <View style={recommendationStyles.cityImageContainerRec}>
                <Image
                  source={{ uri: currentCity.image }}
                  style={recommendationStyles.cityImageRecommendation}
                  resizeMode="cover"
                />

                {/* Dark blur overlay on bottom 1/3 */}
                <View style={recommendationStyles.bottomBlurOverlay}>
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
              </View>
            ) : (
              <View style={recommendationStyles.cityImagePlaceholderRec} />
            )}
            {/* Put the city/country name on the image */}
            <View style={recommendationStyles.cityInfoRec}>
              <Text style={recommendationStyles.cityNameRec}>
                {currentCity.city_name}, {"\n"}
                {currentCity.country}
              </Text>
              {currentCity.city_attrs && (
                <View style={recommendationStyles.cityTagContainer}>
                  {currentCity.city_attrs
                    .split("|")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag, index) =>
                      glassAvailable ? (
                        <GlassView
                          key={index}
                          style={recommendationStyles.glassTag}
                        >
                          <Text style={recommendationStyles.tagText}>
                            {tag}
                          </Text>
                        </GlassView>
                      ) : (
                        <View key={index} style={recommendationStyles.tag}>
                          <Text style={recommendationStyles.tagText}>
                            {tag}
                          </Text>
                        </View>
                      )
                    )}
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* City Modal */}
      <Modal
        visible={cityModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalOpen(false)}
      >
        {/* Full-screen dim overlay */}
        <Pressable
          style={styles.modalDimOverlay}
          onPress={async () => {
            await triggerLightHaptic();
            setCityModalOpen(false);
          }}
        >
          {/* Stop propagation so modal content doesn't close when tapped */}
          <Pressable
            style={{
              maxHeight: "60%",
              minHeight: "30%",
              backgroundColor: "#FFFDFC",
              padding: 20,
              borderRadius: 40,
              zIndex: 1001,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              width: "90%",
            }}
          >
            {selectedCity && (
              <View style={styles.cityModalContent}>
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

                {/* Visible description */}
                <Text style={styles.cityModalDescription}>
                  {selectedCity.description || "No description available."}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Recommendations;