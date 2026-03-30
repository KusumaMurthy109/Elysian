import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Pressable, Image } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { styles } from "../styles/app_styles.styles";
import { manageFriendsStyles } from "../styles/manage_friends.styles";
import { useNavigation } from "@react-navigation/native";

type Friend = {
  uid: string;
  name: string;
  username: string;
};

// Friends Tab
const FriendsTab = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const userSnap = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userSnap.data();
      const friendIds: string[] = data?.friends || [];

      const friendData: Friend[] = [];
      for (const uid of friendIds) {
        const fSnap = await getDoc(doc(FIREBASE_DB, "users", uid));
        if (fSnap.exists()) {
          const fData = fSnap.data();
          friendData.push({
            uid,
            name: fData.name,
            username: fData.username
          });
        }
      }
      setFriends(friendData);
    } catch (err) {
      console.error("Error loading friends:", err);
      setFriends([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // Remove friend
  const removeFriend = async (friendUid: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const updatedFriends = friends
        .filter((f) => f.uid !== friendUid)
        .map((f) => f.uid);

      await updateDoc(userRef, { friends: updatedFriends });
      setFriends((prev) => prev.filter((f) => f.uid !== friendUid));
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={manageFriendsStyles.scrollContainer}>
      {loading ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>
            Loading...
          </Text>
        </View>
      ) : friends.length === 0 ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>
            No Friends Added
          </Text>
        </View>
      ) : (
        friends.map((friend) => (
          <View key={friend.uid} style={manageFriendsStyles.friendRow}>
            <View>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>@{friend.username}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFriend(friend.uid)}>
              <Ionicons name="remove" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// Requests Tab
const RequestsTab = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriendRequests = async () => {
    if (!currentUser) return;
    setLoading(true);

    // Firebase code
    setLoading(false);
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  // Approve friend request and add friends to user documents
  const approveRequest = async (friendUid: string) => {
  };

  // Reject friend request and remove friend request from user document
  const rejectRequest = async (friendUid: string) => {
  };

  return (
    <ScrollView contentContainerStyle={manageFriendsStyles.scrollContainer}>
      {loading ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>
            Loading...
          </Text>
        </View>
      ) : friendRequests.length === 0 ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>
            No Friend Requests
          </Text>
        </View>
      ) : (
        friendRequests.map((friend) => (
          <View key={friend.uid} style={manageFriendsStyles.friendRow}>
            <View>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>@{friend.username}</Text>
            </View>
            <View style={manageFriendsStyles.iconContainer}>
              <TouchableOpacity onPress={() => approveRequest(friend.uid)}>
                <Ionicons name="remove" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => rejectRequest(friend.uid)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const subTab = createMaterialTopTabNavigator();

const ManageFriends = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.solidSafeArea, {paddingHorizontal: 20}]}>
      {/* Top-left back button */}
      <View style={styles.topLeftIcon}>
        <Pressable onPress={() => currentUser && navigation.goBack()}>
          <GlassView style={styles.glassButton}>
            <Ionicons name="return-up-back-outline" size={26} color="#000" />
          </GlassView>
        </Pressable>
      </View>

      {/* Page title */}
      <View style={manageFriendsStyles.titleContainer}>
        <Text style={manageFriendsStyles.titleText}>Manage Friends</Text>
      </View>

      {/* Tabs */}
      <View style={manageFriendsStyles.tabContainer}>
        <subTab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: manageFriendsStyles.tabIndicator,
            tabBarLabelStyle: manageFriendsStyles.tabLabel,
            tabBarStyle: manageFriendsStyles.tabBar,
          }}
        >
          <subTab.Screen
              name="Friends"
              children={() => (
                <View style={manageFriendsStyles.tabContent}>
                  <FriendsTab/>
                </View>
              )}
            />

            <subTab.Screen
              name="Requests"
              children={() => (
                <View style={manageFriendsStyles.tabContent}>
                  <RequestsTab/>
                </View>
              )}
            />
        </subTab.Navigator>
      </View>
    </SafeAreaView>
  );
};

export default ManageFriends;