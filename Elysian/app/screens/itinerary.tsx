/*
File: itinerary.tsx
Function: 
*/

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { styles } from "./app_styles.styles";

const Itinerary = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top-left back icon */}
      <View style={styles.topLeftIcon}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Itinerary;
