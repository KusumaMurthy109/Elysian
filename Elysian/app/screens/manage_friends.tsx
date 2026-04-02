import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  ImageBackground,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  arrayUnion,
} from "firebase/firestore";
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

type FriendRequestSent = {
  to: string;
  timestamp?: number;
};

type FriendRequestReceived = {
  from: string;
  timestamp?: number;
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

  useEffect(() => {
    loadFriends();
  }, []);

  const removeFriend = async (friendUid: string) => {
    if (!currentUser) return;

    try {
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
            <View>
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

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const approveRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
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
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const rejectRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
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
    } catch (error) {
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
            <View>
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

  useEffect(() => {
    loadSentRequests();
  }, []);

  const removeRequest = async (friendUid: string) => {
    if (!currentUser) return;

    try {
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
    } catch (error) {
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
            <View>
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

const SubTab = createMaterialTopTabNavigator();

const ManageFriends = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [friendsMap, setFriendsMap] = useState<{ [uid: string]: boolean }>({});
  const [sentMap, setSentMap] = useState<{ [uid: string]: boolean }>({});
  const [receivedMap, setReceivedMap] = useState<{ [uid: string]: boolean }>(
    {}
  );

  const loadRelationshipMaps = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      const friendsArray: string[] = data?.friends || [];
      const sentRequests: FriendRequestSent[] = data?.friendRequestsSent || [];
      const incomingRequests: FriendRequestReceived[] =
        data?.friendRequests || [];

      const nextFriendsMap: { [uid: string]: boolean } = {};
      friendsArray.forEach((uid) => {
        nextFriendsMap[uid] = true;
      });

      const nextSentMap: { [uid: string]: boolean } = {};
      sentRequests.forEach((req) => {
        nextSentMap[req.to] = true;
      });

      const nextReceivedMap: { [uid: string]: boolean } = {};
      incomingRequests.forEach((req) => {
        nextReceivedMap[req.from] = true;
      });

      setFriendsMap(nextFriendsMap);
      setSentMap(nextSentMap);
      setReceivedMap(nextReceivedMap);
    } catch (error) {
      console.error("Error loading friend relationship maps:", error);
    }
  };

  useEffect(() => {
    loadRelationshipMaps();
  }, []);

  const handleSearchUsers = async (text: string) => {
    setSearchText(text);

    if (!currentUser) return;

    const trimmed = text.trim().toLowerCase();

    if (!trimmed) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    setSearchLoading(true);
    setDropdownOpen(true);

    try {
      await loadRelationshipMaps();

      const usersSnap = await getDocs(collection(FIREBASE_DB, "users"));

      const matchedUsers: Friend[] = usersSnap.docs
        .filter((userDoc) => userDoc.id !== currentUser.uid)
        .map((userDoc) => {
          const data = userDoc.data();
          return {
            uid: userDoc.id,
            name: data.name,
            username: data.username,
          };
        })
        .filter(
          (user) =>
            user.name &&
            user.username &&
            (user.name.toLowerCase().includes(trimmed) ||
              user.username.toLowerCase().includes(trimmed))
        );

      setSearchResults(matchedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }

    setSearchLoading(false);
  };

  const sendFriendRequest = async (friendUid: string) => {
    if (!currentUser) return;

    if (
      friendUid === currentUser.uid ||
      friendsMap[friendUid] ||
      sentMap[friendUid] ||
      receivedMap[friendUid]
    ) {
      return;
    }

    try {
      const senderRef = doc(FIREBASE_DB, "users", currentUser.uid);
      const receiverRef = doc(FIREBASE_DB, "users", friendUid);

      const receiverSnap = await getDoc(receiverRef);
      const receiverData = receiverSnap.data();

      const pendingStatus = (receiverData?.friendRequests || []).some(
        (req: FriendRequestReceived) => req.from === currentUser.uid
      );

      if (pendingStatus) return;

      const timestamp = Date.now();

      await updateDoc(receiverRef, {
        friendRequests: arrayUnion({ from: currentUser.uid, timestamp }),
      });

      await updateDoc(senderRef, {
        friendRequestsSent: arrayUnion({ to: friendUid, timestamp }),
      });

      setSentMap((prev) => ({
        ...prev,
        [friendUid]: true,
      }));

      await handleSearchUsers(searchText);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/favorites_page_background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {!searchOpen ? (
          <>
            <View style={manageFriendsStyles.normalHeader}>
              <Pressable onPress={() => currentUser && navigation.goBack()}>
                <GlassView style={styles.glassButton}>
                  <Ionicons
                    name="return-up-back-outline"
                    size={26}
                    color="#000"
                  />
                </GlassView>
              </Pressable>

              <Text style={manageFriendsStyles.titleText}>Manage Friends</Text>

              <TouchableOpacity onPress={() => setSearchOpen(true)}>
                <GlassView style={styles.glassButton}>
                  <Ionicons name="search" size={26} color="#000" />
                </GlassView>
              </TouchableOpacity>
            </View>

            <View style={manageFriendsStyles.tabContainer}>
              <SubTab.Navigator
                screenOptions={{
                  tabBarIndicatorStyle: manageFriendsStyles.tabIndicator,
                  tabBarLabelStyle: manageFriendsStyles.tabLabel,
                  tabBarStyle: manageFriendsStyles.tabBar,
                  sceneStyle: { backgroundColor: "transparent" },
                }}
              >
                <SubTab.Screen
                  name="Friends"
                  children={() => (
                    <View style={manageFriendsStyles.tabContent}>
                      <FriendsTab />
                    </View>
                  )}
                />

                <SubTab.Screen
                  name="Received"
                  children={() => (
                    <View style={manageFriendsStyles.tabContent}>
                      <RequestsTab />
                    </View>
                  )}
                />

                <SubTab.Screen
                  name="Sent"
                  children={() => (
                    <View style={manageFriendsStyles.tabContent}>
                      <RequestsSentTab />
                    </View>
                  )}
                />
              </SubTab.Navigator>
            </View>
          </>
        ) : (
          <>
            <View style={manageFriendsStyles.searchHeader}>
              <Pressable
                onPress={() => {
                  setSearchOpen(false);
                  setSearchText("");
                  setSearchResults([]);
                  setDropdownOpen(false);
                }}
              >
                <GlassView style={styles.glassButton}>
                  <Ionicons
                    name="return-up-back-outline"
                    size={26}
                    color="#000"
                  />
                </GlassView>
              </Pressable>

              <GlassView style={manageFriendsStyles.friendsSearchBar}>
                <TextInput
                  placeholder="Search users..."
                  placeholderTextColor="#807f7fff"
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    setDropdownOpen(true);
                    handleSearchUsers(text);
                  }}
                  style={manageFriendsStyles.friendsSearchInput}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  autoFocus
                  caretHidden={false}
                  selectionColor="#000"
                />
              </GlassView>

              <TouchableOpacity>
                <GlassView style={styles.glassButton}>
                  <Ionicons name="search" size={26} color="#000" />
                </GlassView>
              </TouchableOpacity>
            </View>

            {dropdownOpen && searchText.length > 0 && (
              <View style={manageFriendsStyles.searchResultsWrapper}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {searchLoading ? (
                    <View style={manageFriendsStyles.searchResultItem}>
                      <Text style={manageFriendsStyles.searchEmptyText}>
                        Loading...
                      </Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user, index) => (
                      <TouchableOpacity
                        key={user.uid}
                        style={[
                          manageFriendsStyles.searchResultItem,
                          index === searchResults.length - 1 &&
                            manageFriendsStyles.lastSearchResultItem,
                        ]}
                        onPress={() => sendFriendRequest(user.uid)}
                        disabled={
                          friendsMap[user.uid] ||
                          sentMap[user.uid] ||
                          receivedMap[user.uid]
                        }
                      >
                        <View style={manageFriendsStyles.searchUserRow}>
                          <View>
                            <Text style={manageFriendsStyles.friendName}>
                              {user.name}
                            </Text>
                            <Text style={manageFriendsStyles.friendUsername}>
                              @{user.username}
                            </Text>
                          </View>

                          {friendsMap[user.uid] ? (
                            <Ionicons
                              name="people-circle"
                              size={24}
                              color="#63a4e1"
                            />
                          ) : sentMap[user.uid] || receivedMap[user.uid] ? (
                            <Ionicons
                              name="time-outline"
                              size={24}
                              color="#999"
                            />
                          ) : (
                            <Ionicons
                              name="person-add-outline"
                              size={24}
                              color="#000"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={manageFriendsStyles.searchResultItem}>
                      <Text style={manageFriendsStyles.searchEmptyText}>
                        No Results
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ManageFriends;
