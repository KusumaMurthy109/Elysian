/*
File: itinerary.tsx
Function: This file renders the Itinerary page where users can view
 their travel plans based on the cities they liked and activities 
 they can choose from a list.
*/

import React from "react";
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./app_styles.styles";
import { GlassView } from "expo-glass-effect";

const Itinerary = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top-left back icon */}
      <View style={styles.topLeftIcon}>
        <Pressable onPress={() => navigation.goBack()}>
          <GlassView style={styles.glassButton}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </GlassView>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Itinerary;
