import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  ImageBackground,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { styles } from "../styles/app_styles.styles";
import { manageFriendsStyles } from "../styles/manage_friends.styles";
import AddFriendsSearch from "../components/add_friends_search_component";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from "../utils/effects";

type Friend = {
  uid: string;
  name: string;
  username: string;
};

type FriendRequestSent = {
  to: string;
  timestamp?: number;
};

type FriendRequestReceived = {
  from: string;
  timestamp?: number;
};

const SubTab = createMaterialTopTabNavigator();

const FriendsTab = ({
  onRelationshipsChanged,
}: {
  onRelationshipsChanged: () => Promise<void>;
}) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFriends();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!currentUser) {
      setFriends([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const userInfo = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userInfo.data();
      const friendIds: string[] = data?.friends || [];

      const friendInfo = await Promise.all(
        friendIds.map((uid) => getDoc(doc(FIREBASE_DB, "users", uid)))
      );

      const friendData: Friend[] = friendInfo
        .filter((info) => info.exists())
        .map((info) => {
          const fData = info.data();

          return {
            uid: info.id,
            name: fData?.name || "Unknown User",
            username: fData?.username || "unknown",
          };
        });

      setFriends(friendData);
    } catch (err) {
      console.error("Error loading friends:", err);
      setFriends([]);
    }

    setLoading(false);
  };

  const removeFriend = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      await triggerLightHaptic();

      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const friendRef = doc(FIREBASE_DB, "users", friendUid);

      const userSnap = await getDoc(userRef);
      const friendSnap = await getDoc(friendRef);

      const userData = userSnap.data();
      const friendData = friendSnap.data();

      const updatedCurrentUserFriends = (userData?.friends || []).filter(
        (uid: string) => uid !== friendUid
      );

      const updatedOtherUserFriends = (friendData?.friends || []).filter(
        (uid: string) => uid !== currentUser.uid
      );

      await updateDoc(userRef, {
        friends: updatedCurrentUserFriends,
      });

      await updateDoc(friendRef, {
        friends: updatedOtherUserFriends,
      });

      setFriends((prev) => prev.filter((f) => f.uid !== friendUid));
      await onRelationshipsChanged();
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={manageFriendsStyles.scrollContainer}>
      {loading ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Text style={manageFriendsStyles.emptyText}>Loading...</Text>
        </View>
      ) : friends.length === 0 ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>No Friends Added</Text>
        </View>
      ) : (
        friends.map((friend) => (
          <View key={friend.uid} style={manageFriendsStyles.friendRow}>
            <View style={manageFriendsStyles.friendInfo}>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>
                @{friend.username}
              </Text>
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

const RequestsTab = ({
  onRelationshipsChanged,
}: {
  onRelationshipsChanged: () => Promise<void>;
}) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFriendRequests();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = async () => {
    if (!currentUser) {
      setFriendRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const userSnap = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userSnap.data();
      const requests: FriendRequestReceived[] = data?.friendRequests || [];

      const requestUsers: Friend[] = [];

      for (const req of requests) {
        const senderUid = req.from;
        const senderSnap = await getDoc(doc(FIREBASE_DB, "users", senderUid));

        if (senderSnap.exists()) {
          const senderData = senderSnap.data();

          requestUsers.push({
            uid: senderUid,
            name: senderData?.name || "Unknown User",
            username: senderData?.username || "unknown",
          });
        }
      }

      setFriendRequests(requestUsers);
    } catch (error) {
      console.error("Error loading friend requests:", error);
      setFriendRequests([]);
    }

    setLoading(false);
  };

  const approveRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      await triggerSuccessHaptic();

      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const senderRef = doc(FIREBASE_DB, "users", friendUid);

      const userSnap = await getDoc(userRef);
      const senderSnap = await getDoc(senderRef);

      const userData = userSnap.data();
      const senderData = senderSnap.data();

      const updatedRequests = (userData?.friendRequests || []).filter(
        (req: FriendRequestReceived) => req.from !== friendUid
      );

      const updatedSent = (senderData?.friendRequestsSent || []).filter(
        (req: FriendRequestSent) => req.to !== currentUser.uid
      );

      const updatedUserFriends = Array.from(
        new Set([...(userData?.friends || []), friendUid])
      );

      const updatedSenderFriends = Array.from(
        new Set([...(senderData?.friends || []), currentUser.uid])
      );

      await updateDoc(userRef, {
        friendRequests: updatedRequests,
        friends: updatedUserFriends,
      });

      await updateDoc(senderRef, {
        friendRequestsSent: updatedSent,
        friends: updatedSenderFriends,
      });

      setFriendRequests((prev) => prev.filter((f) => f.uid !== friendUid));
      await onRelationshipsChanged();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const rejectRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      await triggerErrorHaptic();

      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const senderRef = doc(FIREBASE_DB, "users", friendUid);

      const userSnap = await getDoc(userRef);
      const senderSnap = await getDoc(senderRef);

      const userData = userSnap.data();
      const senderData = senderSnap.data();

      const updatedRequests = (userData?.friendRequests || []).filter(
        (req: FriendRequestReceived) => req.from !== friendUid
      );

      const updatedSent = (senderData?.friendRequestsSent || []).filter(
        (req: FriendRequestSent) => req.to !== currentUser.uid
      );

      await updateDoc(userRef, { friendRequests: updatedRequests });
      await updateDoc(senderRef, { friendRequestsSent: updatedSent });

      setFriendRequests((prev) => prev.filter((f) => f.uid !== friendUid));
      await onRelationshipsChanged();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={manageFriendsStyles.scrollContainer}>
      {loading ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Text style={manageFriendsStyles.emptyText}>Loading...</Text>
        </View>
      ) : friendRequests.length === 0 ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Image
            source={require("../../assets/penguin.png")}
            style={manageFriendsStyles.emptyPageImage}
            resizeMode="contain"
          />
          <Text style={manageFriendsStyles.emptyText}>No Friend Requests</Text>
        </View>
      ) : (
        friendRequests.map((friend) => (
          <View key={friend.uid} style={manageFriendsStyles.friendRow}>
            <View style={manageFriendsStyles.friendInfo}>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>
                @{friend.username}
              </Text>
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
};

const RequestsSentTab = ({
  onRelationshipsChanged,
}: {
  onRelationshipsChanged: () => Promise<void>;
}) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSentRequests();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadSentRequests();
  }, []);

  const loadSentRequests = async () => {
    if (!currentUser) {
      setSentRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const userSnap = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      const data = userSnap.data();
      const sent: FriendRequestSent[] = data?.friendRequestsSent || [];

      const sentUsers: Friend[] = [];

      for (const req of sent) {
        const toUid = req.to;
        const userSnap = await getDoc(doc(FIREBASE_DB, "users", toUid));

        if (userSnap.exists()) {
          const userData = userSnap.data();

          sentUsers.push({
            uid: toUid,
            name: userData?.name || "Unknown User",
            username: userData?.username || "unknown",
          });
        }
      }

      setSentRequests(sentUsers);
    } catch (error) {
      console.error("Error loading sent requests:", error);
      setSentRequests([]);
    }

    setLoading(false);
  };

  const removeRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
      await triggerLightHaptic();

      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const recRef = doc(FIREBASE_DB, "users", friendUid);

      const userInfo = await getDoc(userRef);
      const recInfo = await getDoc(recRef);

      const userData = userInfo.data();
      const recData = recInfo.data();

      const updatedSent = (userData?.friendRequestsSent || []).filter(
        (req: FriendRequestSent) => req.to !== friendUid
      );

      const updatedRequests = (recData?.friendRequests || []).filter(
        (req: FriendRequestReceived) => req.from !== currentUser.uid
      );

      await updateDoc(userRef, { friendRequestsSent: updatedSent });
      await updateDoc(recRef, { friendRequests: updatedRequests });

      setSentRequests((prev) => prev.filter((f) => f.uid !== friendUid));
      await onRelationshipsChanged();
    } catch (error) {
      console.error("Error unsending request:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={manageFriendsStyles.scrollContainer}>
      {loading ? (
        <View style={manageFriendsStyles.friendEmpty}>
          <Text style={manageFriendsStyles.emptyText}>Loading...</Text>
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
            <View style={manageFriendsStyles.friendInfo}>
              <Text style={manageFriendsStyles.friendName}>{friend.name}</Text>
              <Text style={manageFriendsStyles.friendUsername}>
                @{friend.username}
              </Text>
            </View>

            <TouchableOpacity onPress={() => removeRequest(friend.uid)}>
              <Ionicons name="remove" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const ManageFriends = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Friends");

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchOpen(false);
      };
    }, [])
  );

  const handleRelationshipsChanged = async () => {
    return;
  };

  return (
    <ImageBackground
      source={require("../../assets/favorites_page_background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {!searchOpen && (
          <Pressable
            style={styles.topLeftIcon}
            onPress={async () => {
              if (!currentUser) return;
              await triggerLightHaptic();
              navigation.goBack();
            }}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="return-up-back-outline" size={26} color="#000" />
            </GlassView>
          </Pressable>
        )}

        {!searchOpen && (
          <View style={manageFriendsStyles.titleContainer}>
            <Text style={manageFriendsStyles.titleText}>Manage Friends</Text>
          </View>
        )}

        <AddFriendsSearch
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          onRelationshipsChanged={handleRelationshipsChanged}
        />

        {!searchOpen && (
          <View style={manageFriendsStyles.tabContainer}>
            <SubTab.Navigator
              key={activeTab}
              initialRouteName={activeTab}
              screenOptions={{
                tabBarIndicatorStyle: manageFriendsStyles.tabIndicator,
                tabBarLabelStyle: manageFriendsStyles.tabLabel,
                tabBarStyle: manageFriendsStyles.tabBar,
                sceneStyle: { backgroundColor: "transparent" },
              }}
            >
              <SubTab.Screen
                name="Friends"
                listeners={{
                  focus: () => {
                    triggerLightHaptic();
                    setActiveTab("Friends");
                  },
                }}
              >
                {() => (
                  <View style={manageFriendsStyles.tabContent}>
                    <FriendsTab
                      onRelationshipsChanged={handleRelationshipsChanged}
                    />
                  </View>
                )}
              </SubTab.Screen>

              <SubTab.Screen
                name="Received"
                listeners={{
                  focus: () => {
                    triggerLightHaptic();
                    setActiveTab("Received");
                  },
                }}
              >
                {() => (
                  <View style={manageFriendsStyles.tabContent}>
                    <RequestsTab
                      onRelationshipsChanged={handleRelationshipsChanged}
                    />
                  </View>
                )}
              </SubTab.Screen>

              <SubTab.Screen
                name="Sent"
                listeners={{
                  focus: () => {
                    triggerLightHaptic();
                    setActiveTab("Sent");
                  },
                }}
              >
                {() => (
                  <View style={manageFriendsStyles.tabContent}>
                    <RequestsSentTab
                      onRelationshipsChanged={handleRelationshipsChanged}
                    />
                  </View>
                )}
              </SubTab.Screen>
            </SubTab.Navigator>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ManageFriends;
