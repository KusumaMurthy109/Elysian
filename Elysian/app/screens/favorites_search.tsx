/*
File: favorites_search.tsx
Function: Displays search bar for users to add their favorite cities. 
*/

import React, { useState } from "react";
import { View, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Text, Card } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { styles, inputTheme } from "./app_styles.styles";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";

// Same interface as Favorites 
interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number; 
  description?: string;
  image?: string;
}

// City API. DO NOT UPLOAD KEY TO GITHUB!
const API_NINJAS_KEY = ""; 

// Favorites Search component 
const FavoritesSearch = () => {
  const [error, setError] = useState<string | null>(null); // Error messages 
  const [loading, setLoading] = useState(false); // Loading text 
  const [results, setResults] = useState<Recommendation[]>([]); // Store results from user search 
  const [query, setQuery] = useState(""); // Store what user searches 

  // Use navigation system for search bar 
  const navigation = useNavigation();
  
  // When user presses search bar and enter 
  const handleSearch = async () => {
    setLoading(true); // Show loading text 
    setError(null); // Empty error message 
    setResults([]); // Empty result

    // If query is empty return error 
    if (!query.trim()) {
        setError("City name cannot be empty.");
        setLoading(false);
        return;
    }

    try { // Parse user input. Only allows city or city, country abbrevation. No full spelling of the country. 
        const [cityName, country] = query.split(",").map(s => s.trim());

        const url = `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(cityName)}${country ? `&country=${encodeURIComponent(country)}` : ""}`;
        
        // Call the city API 
        const res = await fetch(url, {
        headers: { "X-Api-Key": API_NINJAS_KEY },
        });

        // Handle error 
        if (!res.ok) {
        setError("Search failed. Try again.");
        return;
        }

        // Reads response, parses JSON, converts to javascript value 
        const data = await res.json();

        // Handle blank searches 
        if (!data || data.length === 0) {
        setError("This city does not exist.");
        return;
        }

        const city = data[0];

        // Handle API errors
        if (!city?.name || !city?.country) {
        setError("Invalid city data received.");
        return;
        }
        
        // Use unsplash first, then fallback on Wikipedia, then undefined
        let imageUrl: string | undefined;
        imageUrl = await fetchUnsplashImage(city.name, city.country);
        if (!imageUrl) {
        imageUrl = await fetchCityImage(city.name, city.country);
        }

        setResults([ // Save results to state 
        {
            city_id: `${city.name}-${city.country}`,
            city_name: city.name,
            country: city.country,
            image: imageUrl,
        },
        ]);
    } catch (err) { // Catch errors 
        console.error(err);
        setError("Search failed. Please try again.");
    } finally { // Stop loading text 
        setLoading(false);
    }
    };

  // From Favorites page, only uses Wikipedia REST API
  const fetchCityImage = async (cityName: string, country: string) => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        `${cityName}, ${country}`
      )}`;
      const res = await fetch(url);
      if (!res.ok) return undefined;
      const data = await res.json();

      // Avoid flag images
      const rawImage = data.originalimage?.source || data.thumbnail?.source;
      if (!rawImage) return undefined;
      const lower = rawImage.toLowerCase();
      if (lower.includes("flag") || lower.includes("flag_of")) return undefined;

      return rawImage;
    } catch (err) {
      console.error("Error fetching city image:", err);
      return undefined;
    }
  };

  // From Favorites page 
  const fetchUnsplashImage = async (cityName: string, country: string) => {
    try {
      const url =
        `https://capstone-team-generated-group30-project.onrender.com/api/city-image?city=${encodeURIComponent(
          cityName
        )}` + `&country=${encodeURIComponent(country)}`;

      const res = await fetch(url);
      if (!res.ok) return null;

      const json = await res.json();
      return json?.data?.imageUrl ?? null;
    } catch (e) {
      console.error("Unsplash fetch error:", e);
      return null;
    }
  };

  // When user adds city to favorites 
  const addFavorite = async (city: Recommendation) => {
    try {
      const auth = getAuth(); 
      const user = auth.currentUser;
      if (!user) return;

      // Reference userFavorites 
      const favoritesRef = doc(FIREBASE_DB, "userFavorites", user.uid);

      await setDoc(
        favoritesRef,
        {
          [city.city_id]: {
            city_name: city.city_name,
            country_name: city.country,
            image: city.image || null,
            ts: Date.now(),
          },
        },
        { merge: true }
      );
      // City added to userFavorites 
      alert(`${city.city_name} added to favorites!`);
    } catch (err) { // Catch errors 
      console.error(err);
      alert("Failed to add city to favorites.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topLeftIcon}>
        {/* Back arrow icon */} 
        <Pressable onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back-circle-outline" size={40} color="#000" />
        </Pressable>
      </View>
      <View style={styles.searchContainer}>
        {/* Search bar with text inside and icon on the right */} 
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your favorite city"
          mode="outlined"
          style={styles.input}
          theme={inputTheme}
          right={
            <TextInput.Icon
              icon="magnify"
              size={30}
              onPress={handleSearch}
            />
          }
          onSubmitEditing={handleSearch}
        />
        {loading && <Text style={styles.searchLoading}>Cute Thing Loading...</Text>} 
        {error && <Text style={styles.searchError}>{error}</Text>}
      </View>
      <ScrollView contentContainerStyle={styles.searchResults}>
        {results.map((city) => (
            <Pressable key={city.city_id}>
              <Card style={styles.cityCard}>
                <View style={styles.cityCardInner}>

                {/* Image + add overlay, same structure as Favorites */}
                <View style={styles.imageWrapper}>
                    <Pressable
                        onPress={() => addFavorite(city)}
                        style={[
                            styles.removeIconBtn,
                            styles.removeIconBtnShadow,
                        ]}
                        hitSlop={10} // Can click around icon 
                    >
                    <Ionicons
                        name="add-sharp"
                        size={18}
                        color="#fff"
                    />
                    </Pressable>

                    {city.image ? (
                    <Image
                        source={{ uri: city.image }}
                        style={styles.cityImage}
                        resizeMode="cover"
                    />
                    ) : (
                    <View style={styles.cityImagePlaceholder} />
                    )}
                </View>

                {/* City name */}
                <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>
                    {city.city_name}, {city.country}
                    </Text>
                </View>

                </View>
              </Card>
            </Pressable>
        ))}
        </ScrollView>
    </SafeAreaView>
  );
};

export default FavoritesSearch;
