/* 
File: profile_landing.tsx
Function: This is the Profile Landing screen component for the app before displaying the Profile Setup screen component.
*/

// React Imports
import { useEffect, useRef } from "react";
import { Animated, Image } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// File Imports
import { styles } from "../styles/app_styles.styles";


// Define the navigation parameter list
export type RootParamList = {
  ProfileSetup: {
    name: string;
    email: string;
    password: string;
    username: string;
  };
  ProfileLanding: {
    name: string;
    email: string;
    password: string;
    username: string;
  };
};

// Define the type for Home screen navigation prop
type ProfileLandingRouteProp = RouteProp<
  RootParamList,
  "ProfileLanding"
>;
type ProfileLandingScreenProp = NativeStackNavigationProp<
  RootParamList,
  "ProfileSetup"
>;

// Profile Landing component
const ProfileLanding = () => {
  const route = useRoute<ProfileLandingRouteProp>();
  const {name, email, password, username} = route.params;
  
  console.log("Here Now in profile landing");
  // Initialize navigation with type safety
  const navigation = useNavigation<ProfileLandingScreenProp>();

  const fadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible

  useEffect(() => {
    // Set a timer to start fade out after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade to invisible
        duration: 1000, // Fade out duration (ms)
        useNativeDriver: true,
      }).start(() => {
        // Navigate to Login screen after fading out
        navigation.navigate("ProfileSetup", {
        name,
        email,
        password,
        username
      });
      });
    }, 500); // Delay duration before starting fade out animation

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  return (
    <SafeAreaView style={styles.solidSafeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text variant="displaySmall" style={styles.header2}>
          Let's Get to Know You Better
        </Text>

        <Text variant="titleLarge" style={styles.subtext2}>
          Answer these questions to get your curated travel!
        </Text>

        <Image
          source={require("../../assets/penguin.png")}
          style={styles.bottomImage}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileLanding;
