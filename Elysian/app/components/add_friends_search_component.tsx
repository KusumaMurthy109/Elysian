import React, { useState } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { getAuth } from "firebase/auth";
import { triggerSuccessHaptic } from "../utils/effects";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { FIREBASE_DB } from "../../FirebaseConfig";
import SearchOverlay from "./search_overlay_component";
import { styles } from "../styles/app_styles.styles";
import { manageFriendsStyles } from "../styles/manage_friends.styles";

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

type AddFriendsSearchProps = {
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRelationshipsChanged: () => Promise<void>;
};

const AddFriendsSearch = ({
  searchOpen,
  setSearchOpen,
  onRelationshipsChanged,
}: AddFriendsSearchProps) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  const [friendsMap, setFriendsMap] = useState<{ [uid: string]: boolean }>({});
  const [sentMap, setSentMap] = useState<{ [uid: string]: boolean }>({});
  const [receivedMap, setReceivedMap] = useState<{ [uid: string]: boolean }>(
    {}
  );

  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setDropdownOpen(false);
    setSearchLoading(false);
    Keyboard.dismiss();
  };

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

  const handleSearchUsers = async (text: string) => {
    if (!currentUser) return;

    const trimmed = text.trim().toLowerCase();

    if (!trimmed) {
      setSearchResults([]);
      setDropdownOpen(false);
      setSearchLoading(false);
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
      await triggerSuccessHaptic();
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

      await loadRelationshipMaps();
      await onRelationshipsChanged();
      await handleSearchUsers(searchText);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <SearchOverlay
      searchOpen={searchOpen}
      setSearchOpen={(val) => {
        if (!val) {
          setSearchOpen(false);
          resetSearch();
        } else {
          setSearchOpen(true);
        }
      }}
      value={searchText}
      onChange={(text) => {
        setSearchText(text);
        handleSearchUsers(text);
      }}
      placeholder="Search users..."
      onClose={() => {
        setSearchOpen(false);
        resetSearch();
      }}
    >
      {dropdownOpen && searchText.length > 0 && (
        <GlassView style={styles.searchDropdown}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {searchLoading ? (
              <View style={styles.searchResultItem}>
                <Text style={styles.searchResultNoneText}>Loading...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <TouchableOpacity
                  key={user.uid}
                  style={styles.searchResultItem}
                  onPress={() => sendFriendRequest(user.uid)}
                  disabled={
                    friendsMap[user.uid] ||
                    sentMap[user.uid] ||
                    receivedMap[user.uid]
                  }
                >
                  <View style={manageFriendsStyles.friendInfo}>
                    <Text style={manageFriendsStyles.friendName}>
                      {user.name}
                    </Text>
                    <Text style={manageFriendsStyles.friendUsername}>
                      @{user.username}
                    </Text>
                  </View>

                  {friendsMap[user.uid] ? (
                    <Ionicons name="people-circle" size={24} color="#63a4e1" />
                  ) : sentMap[user.uid] || receivedMap[user.uid] ? (
                    <Ionicons name="time-outline" size={24} color="#999" />
                  ) : (
                    <Ionicons
                      name="person-add-outline"
                      size={24}
                      color="#000"
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.searchResultItem}>
                <Text style={styles.searchResultNoneText}>No Results</Text>
              </View>
            )}
          </ScrollView>
        </GlassView>
      )}
    </SearchOverlay>
  );
};

export default AddFriendsSearch;
