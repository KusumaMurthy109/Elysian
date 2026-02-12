/* 
File: profile.tsx
Function: This is the user Profile screen component for the app. 
*/

import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { query, where, collection, getDocs } from 'firebase/firestore';
import { styles, inputTheme } from './app_styles.styles';
import { profileStyles } from './profile.styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';

// Define the navigation parameter list
export type RootParamList = {
  Profile: undefined;
  Login: undefined;
};

// Define the type for Profile screen navigation prop
type ProfileScreenProp = NativeStackNavigationProp<RootParamList, 'Profile'>;

// Profile component
const Profile = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<ProfileScreenProp>();
  const [user, setUser] = useState<User | null>(null); // Stores the user 
  const [username, setUsername] = useState<string | null>(null); // Stores the username 
  const [isEditing, setIsEditing] = useState(false); // False: user is viewing profile and True: user is editing profile 
  const [editedName, setEditedName] = useState(''); // Temporary value for when user is editing 
  const [editedUsername, setEditedUsername] = useState(''); // Temporary value for when user is editing 
  const [error, setError] = useState(''); // Stores error 

  // Function to check if username is already taken 
  const isUsernameTaken = async (usernameCheck: string) => { // usernameCheck = username user wants to change to 
    const q = query( // Queries users database and checks if username is equal usernameCheck
      collection(FIREBASE_DB, 'users'), 
      where('username', '==', usernameCheck)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if username exists
  };

  // Edit profile logic 
  const handleEditProfile = () => {
    setEditedName(user?.displayName || '');
    setEditedUsername(username || '');
    setIsEditing(true); // User is editing 
  };

  // Save profile logic 
  const handleSaveProfile = async () => {
    if (!user) return;

    setError(''); // Clear any errors 

    if (!editedName.trim() || !editedUsername.trim()) { // No blank names or usernames 
      setError('Name and username cannot be empty.');
      return;
    }

    if (editedUsername !== username && await isUsernameTaken(editedUsername)) { // No duplicate usernames 
      setError('This username is already taken.');
      return;
    }

    try { 
      await updateProfile(user, { displayName: editedName }); // Update Firebase displayName
      await updateDoc(doc(FIREBASE_DB, 'users', user.uid), {username: editedUsername,}); // Update Firestore username
      setUsername(editedUsername);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      if (!currentUser) {
        console.warn("User not signed in!");
        return;
      }

      setUser(currentUser);

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', currentUser.uid));
      setUsername(userDoc.exists() ? userDoc.data().username : null);
    });

    return unsubscribe;
  }, );

  // When handleViewPrefernces is called (menu icon pressed) it goes to profile_preferences.tsx page
  const handleViewPreferences = () => {
    navigation.navigate("ProfilePreferences" as never);
  };

  return (
    <View style={styles.homeContainer}>
      {/* Background image */}
        <View style={profileStyles.topImageContainer}>
          <Image
            source={require('../../assets/profile_background_image.png')}
            style={profileStyles.topImage}
            resizeMode="cover"
          />
          <View style={profileStyles.halfCircleCutout} />
        </View>
      <View style={styles.topRightIcon}>
        <TouchableOpacity onPress={() => handleViewPreferences()}>
          {/* Menu button */}
          <GlassView
              style={styles.glassButton}>
            <Ionicons name="ellipsis-vertical" size={26} color="#000" />
          </GlassView>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Profile image and edit button */}
        <View style={profileStyles.profileImageContainer}>
          <Image
            source={require('../../assets/profile_temp.jpg')}
            style={profileStyles.profileImage}
          />
          <TouchableOpacity
            style={profileStyles.editIconContainer}
            onPress={handleEditProfile}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name and username */}
        <View style={profileStyles.nameContainer}>
          <Text style={profileStyles.name}>{user?.displayName}</Text>
          <Text style={profileStyles.username}>@{username}</Text>
        </View>

        {/* Name and username edit fields */}
        {isEditing && (
          <View style={profileStyles.container}>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              style={styles.input}
              label="New Name"
              theme={inputTheme}
              mode='outlined'
            />

            <TextInput
              value={editedUsername}
              onChangeText={setEditedUsername}
              style={styles.input}
              label="New Username"
              autoCapitalize="none"
              theme={inputTheme}
              mode="outlined"
            />

            {error ? (
              <Text style={profileStyles.editError}>{error}</Text>
            ) : null}

            <Button
              mode="contained" 
              onPress={handleSaveProfile} 
              style={profileStyles.saveButton} 
              labelStyle={profileStyles.saveButtonLabel}
            >
              Save
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;
