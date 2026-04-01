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

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFriends();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFriends = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const userInfo = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userInfo.data();
      const friendIds: string[] = data?.friends || [];

      const friendInfo = await Promise.all(
        friendIds.map(uid => getDoc(doc(FIREBASE_DB, "users", uid)))
      );

      const friendData: Friend[] = friendInfo
      .filter(info => info.exists())
      .map(info => {
        const fData = info.data();
        return {
          uid: info.id,
          name: fData.name,
          username: fData.username
        };
      });
      
      setFriends(friendData);
    } 
    catch (err) {
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

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFriendRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFriendRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userSnap.data();
      const requests = data?.friendRequests || [];
      const requestUsers: Friend[] = [];
      for (const req of requests) {
        const senderUid = req.from;
        const senderSnap = await getDoc(doc(FIREBASE_DB, "users", senderUid));
        if (senderSnap.exists()) {
          const senderData = senderSnap.data();
          requestUsers.push({
            uid: senderUid,
            name: senderData.name,
            username: senderData.username,
          });
        }
      }
      setFriendRequests(requestUsers);
    }
    catch (error) {
      console.error("Error loading ferind requests:", error);
      setFriendRequests([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  // Approve friend request and add friends to user documents
  const approveRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const senderRef = doc(FIREBASE_DB, "users", friendUid);
      const userSnap = await getDoc(userRef);
      const senderSnap = await getDoc(senderRef);
      const userData = userSnap.data();
      const senderData = senderSnap.data();
      const updatedRequests = (userData?.friendRequests || []).filter((req: any) => req.from !== friendUid);
      const updatedSent = (senderData?.friendRequestsSent || []).filter((req: any) => req.to !== currentUser.uid);

      const updatedUserFriends = Array.from( new Set([...(userData?.friends || []), friendUid]));
      const updatedSenderFriends = Array.from(new Set([...(senderData?.friends || []), currentUser.uid]));

      await updateDoc(userRef, {
        friendRequests: updatedRequests,
        friends: updatedUserFriends,
      });

      await updateDoc(senderRef, {
        friendRequestsSent: updatedSent,
        friends: updatedSenderFriends,
      });

      setFriendRequests((prev) => prev.filter((f) => f.uid !== friendUid));
    }
    catch (error) {
      console.error("Error approving request:", error);
    }
  };

  // Reject friend request and remove friend request from user document
  const rejectRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const senderRef = doc(FIREBASE_DB, "users", friendUid);
      const userSnap = await getDoc(userRef);
      const senderSnap = await getDoc(senderRef);
      const userData = userSnap.data();
      const senderData = senderSnap.data();

      const updatedRequests = (userData?.friendRequests || []).filter((req: any) => req.from !== friendUid);
      const updatedSent = (senderData?.friendRequestsSent || []).filter((req: any) => req.to !== currentUser.uid);

      await updateDoc(userRef, {friendRequests: updatedRequests});

      await updateDoc(senderRef, {friendRequestsSent: updatedSent});

      setFriendRequests((prev) => prev.filter((f) => f.uid !== friendUid));
    }
    catch (error) {
      console.error("Error rejecting request:", error);
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
                <Ionicons name="checkmark-sharp" size={24} color="#000" />
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

const RequestsSentTab = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSentRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSentRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userSnap.data();
      const sent = data?.friendRequestsSent || [];

      const sentUsers: Friend[] = [];
      for (const req of sent) {
        const toUid = req.to;
        const userSnap = await getDoc(doc(FIREBASE_DB, "users", toUid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          sentUsers.push({
            uid: toUid,
            name: userData.name,
            username: userData.username,
          });
        }
      }
      setSentRequests(sentUsers);
    }
    catch (error) {
      console.error("error loading sent requests:", error);
      setSentRequests([]);
    }
    setLoading(false);
  };

  const removeRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc (FIREBASE_DB, "users", currentUser.uid);
      const recRef = doc (FIREBASE_DB, "users", friendUid);
      const userInfo = await getDoc(userRef);
      const recInfo = await getDoc(recRef);
      const userData = userInfo.data();
      const recData = recInfo.data();
      const updatedSent = (userData?.friendRequestsSent || []).filter((req: any) => req.to !== friendUid);
      const updatedRequests = (recData?.friendRequests || []).filter((req:any) => req.from !== currentUser.uid);

      await updateDoc(userRef, {friendRequestsSent: updatedSent});
      await updateDoc(recRef, {friendRequests: updatedRequests});

      setSentRequests(prev => prev.filter(f => f.uid !== friendUid));
    }
    catch (error) {
      console.error("Error unsending request:", error);
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
      ) : sentRequests.length === 0 ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>
            No Friends Requested
          </Text>
        </View>
      ) : (
        sentRequests.map((friend) => (
          <View key={friend.uid} style={manageFriendsStyles.friendRow}>
            <View>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>@{friend.username}</Text>
            </View>
            <TouchableOpacity onPress={() => removeRequest(friend.uid)}>
              <Ionicons name="remove" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  )
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
              name="Received"
              children={() => (
                <View style={manageFriendsStyles.tabContent}>
                  <RequestsTab/>
                </View>
              )}
            />

            <subTab.Screen
              name="Sent"
              children={() => (
                <View style={manageFriendsStyles.tabContent}>
                  <RequestsSentTab/>
                </View>
              )}
            />
        </subTab.Navigator>
      </View>
    </SafeAreaView>
  );
};

export default ManageFriends;