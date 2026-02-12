/*
File: profile_preferences.tsx
Function: Profile preferences page, displays questionnaire responses and logout.
*/

import React, { useState, useEffect } from 'react';
import { View, Pressable, Image  } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';

import { styles } from './app_styles.styles';
import { profilePreferencesStyles } from './profile_preferences.styles';

import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';

const ProfilePreferences = () => {
  const navigation = useNavigation();

  const [responses, setResponses] = useState<{ [key: string]: string[] | string }>({});

  const questions = [
    "Origin Country:",
    "Vacation Type(s):",
    "Favorites Season(s)",
    "Budget(s):",
    "Favorite Country Visited:",
    "Type(s) of Places:"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      if (!currentUser) {
        console.warn("User not signed in!");
        return;
      }

      try {
        const profileDoc = await getDoc(doc(FIREBASE_DB, 'userProfiles', currentUser.uid));
        if (profileDoc.exists()) {
          setResponses(profileDoc.data()?.responses || {});
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    });

    return unsubscribe;
  }, []);

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

      {/* Profile picture top-right */}
      <View style={profilePreferencesStyles.profileHeader}>
        <Image
          source={require('../../assets/profile_temp.jpg')}
          style={profilePreferencesStyles.profileImage}
        />
      </View>

      {/* Questions + answers */}
      <View style={profilePreferencesStyles.content}>
        {questions.map((q, index) => {
          const answer = responses[index] ?? responses[index.toString()];
          return (
            <View key={index} style={profilePreferencesStyles.questionBlock}>
              <Text style={profilePreferencesStyles.questionText}>{q}</Text>
              <View style={profilePreferencesStyles.answerPill}>
                <Text style={profilePreferencesStyles.answerText}>
                  {Array.isArray(answer) ? answer.join(', ') : answer || 'No answer yet'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Logout button */}
        <Button
          mode="contained"
          onPress={() => signOut(FIREBASE_AUTH)}
          style={profilePreferencesStyles.logoutButton}
          labelStyle={profilePreferencesStyles.logoutButtonLabel}
        >
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default ProfilePreferences;