/**
 * file: home.tsx
 *
 * This file renders the main Explore page where users can browse
 * images shared by others and upload their own travel photos.
 *
 */

import React, { useState, useEffect } from "react";
import {
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {GlassView} from "expo-glass-effect";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styles } from "../styles/app_styles.styles";
import { uploadMethod } from "../services/postsService";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import type { HomeStackParamList } from "./navigation_bar";
import { homeStyles } from "../styles/home.styles";

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;


const Home = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const {posts} = usePosts ();

  return (
    <ImageBackground
      source={require("../../assets/home_page_background.png")}
      style={{flex:1}}
      resizeMode="cover"
    >
      <SafeAreaView edges = {["top"]}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle = {homeStyles.homeContainer}
          ListHeaderComponent={
            <Text style={homeStyles.title}>
              Explore{"\n"}Together
            </Text>
          }
          renderItem={({ item }) => (
            <PostCard post={item} />
          )}
        />

        <TouchableOpacity 
          style={styles.topRightIcon}
          onPress={() => uploadMethod(navigation)}
        >
          <GlassView style={styles.glassButton}>
            <Ionicons name="add" size={26} color="#000" />
          </GlassView>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  )
};

export default Home;
