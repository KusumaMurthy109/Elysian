/*
File: create_post.tsx
Function: Allow users to add the location, a review, and generate a rating.
*/

// React Imports
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

// Firebase Imports
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  increment,
  getDocs,
  collection,
  getDoc,
  setDoc,
  addDoc,
  arrayUnion,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";

// File Imports
import type { HomeStackParamList } from "./navigation_bar";
import PenguinLoader from "./penguin_loader";
import { styles, inputTheme } from "../styles/app_styles.styles";
import { createPostStyles } from "../styles/create_post.styles";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "../utils/effects";

// Other Imports
import * as ImagePicker from "expo-image-picker";
import { GlassView } from "expo-glass-effect";
import { Ionicons, Entypo } from "@expo/vector-icons";


type CreatePostRouteProp = RouteProp<HomeStackParamList, "CreatePost">;

interface City {
  id: string;
  name: string;
  country: string;
}

const CreatePost = () => {
  const navigation = useNavigation();
  const route = useRoute<CreatePostRouteProp>();
  const imageURIs = route.params?.imageURIs;

  const [postImages, setPostImages] = useState<string[]>(imageURIs || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [review, setReview] = useState("");

  const [tagQuery, setTagQuery] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [friends, setFriends] = useState<{ id: string; username: string }[]>(
    []
  );
  const [tagFriends, setTagFriends] = useState<string[]>([]);

  const [feedBack, setFeedback] = useState<
    "LIKE" | "NEUTRAL" | "DISLIKE" | null
  >(null);

  const [comparison, setComparison] = useState<null | {
    new_city: { id: string; city_name: string; country_name: string };
    existing_city: { id: string; city_name: string; country_name: string };
  }>(null);
  const [ratingStarted, setRatingStarted] = useState(false);
  const [ratingCompleted, setRatingCompleted] = useState(false);

  const newCityImageRef = useRef<string | null>(null);
  const [comparisonImages, setComparisonImages] = useState<{
    new?: string | null;
    existing?: string | null;
  }>({});
  const [pendingRatingUpdates, setPendingRatingUpdates] = useState<any>(null);

  const [ratingValue, setRatingValue] = useState<number | null>(null);

  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (postImages.length === 0) {
      navigation.goBack();
    }
  }, [postImages]);

  const removeImage = (index: number) => {
    triggerSelectionHaptic();

    const newImages = [...postImages];
    newImages.splice(index, 1);
    setPostImages(newImages);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }

    const selectedImage = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      triggerSuccessHaptic();
      setPostImages([...postImages, selectedImage.assets[0].uri]);
    }
  };

  const fromAlbum = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Need access to photos in order to upload images"
      );
      return;
    }

    const currentLimit = 10 - postImages.length;

    const selectedImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: currentLimit,
      quality: 0.8,
    });

    if (!selectedImage.canceled) {
      const uris = selectedImage.assets.map((a: { uri: string }) => a.uri);
      triggerSuccessHaptic();
      setPostImages([...postImages, ...uris]);
    }
  };

  const fetchFriends = async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      const userRef = doc(FIREBASE_DB, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const friends = userData.friends || [];

      const friendPromises = friends.map(async (friendId: string) => {
        const friendRef = doc(FIREBASE_DB, "users", friendId);
        const friendSnap = await getDoc(friendRef);

        if (!friendSnap.exists()) return null;

        return {
          id: friendSnap.id,
          username: friendSnap.data().username,
        };
      });

      const friendList = (await Promise.all(friendPromises)).filter(Boolean);

      setFriends(friendList as { id: string; username: string }[]);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const fetchAllCities = async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      const userRef = doc(FIREBASE_DB, "userPosts", uid);
      const userSnap = await getDoc(userRef);

      const personalElos = userSnap.exists()
        ? userSnap.data().personalElos || {}
        : {};

      const ratedCityIds = new Set(Object.keys(personalElos));

      const citiesCol = collection(FIREBASE_DB, "allCities");
      const snapshot = await getDocs(citiesCol);

      const citiesList: City[] = snapshot.docs
        .filter((doc) => !ratedCityIds.has(doc.id))
        .map((doc) => ({
          id: doc.id,
          name: doc.data().city_name,
          country: doc.data().country_name,
        }));

      setCities(citiesList);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchAllCities();
    const auth = getAuth();
    const user = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        try {
          const userDocRef = doc(FIREBASE_DB, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserName(userData.username);
          }
        } catch (error) {
          console.error("Error fetching username: ", error);
        }
      }
    });
    return user;
  }, []);

  useEffect(() => {
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setDropdownOpen(false);
    });

    return () => {
      hideListener.remove();
    };
  }, []);

  const getCityImage = async (cityId: string) => {
    try {
      const docRef = doc(FIREBASE_DB, "allCities", cityId);
      const cityResp = await getDoc(docRef);

      if (!cityResp.exists()) {
        return null;
      }

      const cityData = cityResp.data();
      return cityData.url || null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (!comparison) return;

    const loadImages = async () => {
      let newImg = newCityImageRef.current;

      if (!newImg) {
        newImg = await getCityImage(comparison.new_city.id);
        newCityImageRef.current = newImg;
      }

      const existingImg = await getCityImage(comparison.existing_city.id);

      setComparisonImages({
        new: newImg,
        existing: existingImg,
      });
    };

    loadImages();
  }, [comparison]);

  useEffect(() => {
    newCityImageRef.current = null;
  }, [selectedCity?.id]);

  const submitPost = async () => {
    if (uploading) return;

    // Change this condition to check postImages instead
    if (!ratingCompleted || !pendingRatingUpdates || !selectedCity || !postImages || postImages.length === 0) {
      console.log("Submit blocked: rating not completed or missing info");
      return;
    }

  try {
    setUploading(true);

    const allUploadUrls: string[] = [];
    // Change this to use postImages instead of imageURIs
    for (const uri of postImages) {  // ← Changed from imageURIs to postImages
      const filename = uri.split("/").pop();
      const response = await fetch(
        `https://adsorm74va.execute-api.us-east-1.amazonaws.com/prod/upload-url?filename=${filename}`
      );
      const data = await response.json();
      const { uploadUrl, fileUrl } = data;

      const image = await fetch(uri);
      const blob = await image.blob();
      await fetch(uploadUrl, { method: "PUT", body: blob });

      allUploadUrls.push(fileUrl);
    }

      const postRef = await addDoc(collection(FIREBASE_DB, "posts"), {
        urls: allUploadUrls,
        uploader: userName,
        uid: userId,
        city: {
          id: selectedCity.id,
          name: selectedCity.name,
          country: selectedCity.country,
        },
        review: review,
        tagFriends: tagFriends,
        ratingValue: ratingValue,
        timestamp: Date.now(),
      });

      const postId = postRef.id;

      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      const userRef = doc(FIREBASE_DB, "userPosts", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          personalElos: {},
          comparisonCount: 0,
          posts: [],
        });
      }

      const updates: any = { posts: arrayUnion(postId) };

      if (pendingRatingUpdates.personalElos) {
        for (const [cityId, elo] of Object.entries(
          pendingRatingUpdates.personalElos
        )) {
          updates[`personalElos.${cityId}`] = elo;
        }
      }

      if (pendingRatingUpdates.comparisonIncrement) {
        updates.comparisonCount = increment(
          pendingRatingUpdates.comparisonIncrement
        );
      }

      await updateDoc(userRef, updates);

      if (pendingRatingUpdates.globalElos) {
        for (const [cityId, elo] of Object.entries(
          pendingRatingUpdates.globalElos
        )) {
          const cityRef = doc(FIREBASE_DB, "allCities", cityId);
          await updateDoc(cityRef, {
            global_Elo: elo,
            comparison_count: increment(
              pendingRatingUpdates.comparisonIncrement
            ),
          });
        }
      }

      setUploading(false);
      resetRatingState();
      setFeedback(null);
      setRatingCompleted(false);
      setPendingRatingUpdates(null);
      setReview("");
      setTagFriends([]);
      navigation.goBack();
    } catch (err) {
      alert("Failed to submit post. Please try again.");
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!feedBack || !selectedCity || ratingStarted) return;

    try {
      const run = async () => {
        setRatingStarted(true);
        setRatingCompleted(false);

        const res = await fetch(
          "https://capstone-team-generated-group30-project.onrender.com/rate-city",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: getAuth().currentUser?.uid,
              city_id: selectedCity.id,
              feedback: feedBack,
            }),
          }
        );

        const data = await res.json();

        if (data.status === "compare") {
          setComparison({
            new_city: data.new_city,
            existing_city: data.existing_city,
          });
        } else if (data.status === "done") {
          setPendingRatingUpdates(data);
          setRatingValue(data.ratingValue);
          setRatingCompleted(true);
        }
      };

      run();
    } catch (err) {
      console.error("Rating failed", err);
      resetRatingState();
    }
  }, [feedBack, selectedCity]);

  const submitComparison = async (preferred: "new" | "existing") => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    try {
      const res = await fetch(
        "https://capstone-team-generated-group30-project.onrender.com/compare-cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: uid,
            preferred,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "compare") {
        setComparison({
          new_city: data.new_city,
          existing_city: data.existing_city,
        });
      } else {
        setPendingRatingUpdates(data);
        setRatingValue(data.ratingValue);
        setComparison(null);
        setRatingCompleted(true);
      }
    } catch (err) {
      console.error("Comparison failed", err);
      resetRatingState();
      setRatingCompleted(true);
    }
  };

  const resetRatingState = () => {
    setComparison(null);
    setRatingStarted(false);
  };

  useEffect(() => {
    if (!ratingStarted) {
      resetRatingState();
      setRatingCompleted(false);
    }
  }, [selectedCity?.id]);

  const renderStars = () => {
    if (ratingValue === null) return null;

    const stars = [];
    const starValue = ratingValue / 2;
    const rounded = Math.round(starValue * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      let iconName: "star" | "star-half-outline" | "star-outline";

      if (i <= Math.floor(rounded)) {
        iconName = "star";
      } else if (i === Math.floor(rounded) + 1 && rounded % 1 === 0.5) {
        iconName = "star-half-outline";
      } else {
        iconName = "star-outline";
      }

      stars.push(
        <Ionicons
          key={i}
          name={iconName}
          size={36}
          color="#ffd700"
          style={{ marginHorizontal: 2 }}
        />
      );
    }

    return <View style={createPostStyles.starContainer}>{stars}</View>;
  };

  const findMatchingCity = (text: string): City | null => {
    const normalized = text.trim().toLowerCase();

    return (
      cities.find(
        (city) => `${city.name}, ${city.country}`.toLowerCase() === normalized
      ) || null
    );
  };

  return (
    <SafeAreaView
      style={styles.solidSafeArea}
      onTouchStart={() => {
        if (!dropdownOpen) {
          Keyboard.dismiss();
        }
      }}
    >
      <View style={styles.topLeftIcon}>
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            navigation.goBack();
          }}
        >
          <GlassView style={styles.glassButton}>
            <Ionicons name="return-up-back-outline" size={26} color="#000" />
          </GlassView>
        </Pressable>
      </View>

      {ratingCompleted && (
        <View style={styles.topRightIcon}>
          <Pressable
            disabled={uploading}
            onPress={() => {
              triggerSuccessHaptic();
              submitPost();
            }}
          >
            <GlassView style={styles.glassButton}>
              <Ionicons name="checkmark-outline" size={26} color="#000" />
            </GlassView>
          </Pressable>
        </View>
      )}

      <View style={createPostStyles.homeContainer}>
        <Text variant="headlineLarge" style={createPostStyles.title}>
          New Post
        </Text>

        {imageURIs && imageURIs.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={createPostStyles.imageRow}
          >
            {postImages.map((uri, index) => (
              <View key={uri} style={createPostStyles.imageWrapper}>
                <Image source={{ uri }} style={createPostStyles.imagePreview} />

                <Pressable
                  style={createPostStyles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="remove-circle" size={24} color="#000" />
                </Pressable>
              </View>
            ))}

            {postImages.length < 10 && (
              <Pressable
                style={createPostStyles.addImageCard}
                onPress={() => {
                  triggerSelectionHaptic();
                  Alert.alert("Create a Post", "Choose Upload Options:", [
                    { text: "Take Photo", onPress: takePhoto },
                    { text: "Choose from Album", onPress: fromAlbum },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
              >
                <Ionicons name="add" size={40} color="#fff" />
              </Pressable>
            )}
          </ScrollView>
        )}

        <View style={createPostStyles.bodyContainer}>
          <TextInput
            placeholder="Location"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setDropdownOpen(true);

              const match = findMatchingCity(text);
              setSelectedCity(match);
            }}
            onBlur={() => {
              const match = findMatchingCity(searchQuery);
              setSelectedCity(match);
            }}
            style={createPostStyles.locationInput}
            mode="outlined"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            caretHidden={false}
            theme={inputTheme}
            left={<TextInput.Icon icon="map-marker-outline" color="#000" />}
            editable={!ratingStarted && !ratingCompleted}
          />

          {dropdownOpen && searchQuery.length > 0 && (
            <View style={createPostStyles.dropdown}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {(() => {
                  const filtered = cities.filter((city) =>
                    `${city.name}, ${city.country}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <View style={createPostStyles.dropdownItem}>
                        <Text style={styles.searchResultNoneText}>
                          No Results
                        </Text>
                      </View>
                    );
                  }

                  return filtered.map((city) => (
                    <Pressable
                      key={city.id}
                      style={createPostStyles.dropdownItem}
                      onPress={() => {
                        triggerSelectionHaptic();
                        setSelectedCity(city);
                        setSearchQuery(`${city.name}, ${city.country}`);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text variant="bodyLarge">
                        {city.name}, {city.country}
                      </Text>
                    </Pressable>
                  ));
                })()}
              </ScrollView>
            </View>
          )}
        </View>

        {friends.length > 0 && (
          <View style={createPostStyles.bodyContainer}>
            <TextInput
              placeholder="Tag Friends"
              value={tagInput}
              onChangeText={(text) => {
                const previousText = tagInput;
                setTagInput(text);

                const words = text.split(" ");
                const lastWord = words[words.length - 1];

                const isTypingNewWord =
                  !text.endsWith(" ") && lastWord !== undefined;

                const isDeleting = text.length < previousText.length;
                const previousWords = previousText.split(" ");
                const previousLastWord =
                  previousWords[previousWords.length - 1];

                const isDeletingTag =
                  isDeleting &&
                  previousLastWord &&
                  previousLastWord.startsWith("@") &&
                  lastWord &&
                  lastWord.startsWith("@");

                let query = "";
                let shouldShowDropdown = false;

                if (isTypingNewWord && !isDeleting) {
                  const lastWordIndex = text.lastIndexOf(lastWord);
                  const charBeforeLastWord =
                    lastWordIndex > 0 ? text[lastWordIndex - 1] : null;

                  const isValidContext =
                    lastWordIndex === 0 || charBeforeLastWord === " ";

                  if (isValidContext && lastWord) {
                    query = lastWord.startsWith("@")
                      ? lastWord.slice(1)
                      : lastWord;
                    shouldShowDropdown = lastWord.startsWith("@");
                  }
                } else if (isDeletingTag && lastWord) {
                  query = lastWord.startsWith("@")
                    ? lastWord.slice(1)
                    : lastWord;
                  shouldShowDropdown = true;
                }

                setTagQuery(query);
                setTagDropdownOpen(shouldShowDropdown);
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && tagQuery === "") {
                  if (tagFriends.length > 0) {
                    const removed = tagFriends[tagFriends.length - 1];
                    setTagFriends(tagFriends.slice(0, -1));

                    const words = tagInput.trim().split(" ");
                    const newWords = words.filter(
                      (w) => w.replace("@", "") !== removed
                    );
                    setTagInput(
                      newWords.join(" ") + (newWords.length ? " " : "")
                    );
                  }
                }
              }}
              style={createPostStyles.tagFriendsInput}
              mode="outlined"
              theme={inputTheme}
              left={<TextInput.Icon icon="account-plus-outline" color="#000" />}
            />

            {tagDropdownOpen && (
              <View style={createPostStyles.dropdown}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {(() => {
                    const filtered = friends.filter(
                      (friend) =>
                        friend.username
                          .toLowerCase()
                          .includes(tagQuery.toLowerCase()) &&
                        !tagFriends.includes(friend.username)
                    );

                    if (filtered.length === 0) {
                      return (
                        <View style={createPostStyles.dropdownItem}>
                          <Text style={styles.searchResultNoneText}>
                            No Results
                          </Text>
                        </View>
                      );
                    }

                    return filtered.map((user) => (
                      <Pressable
                        key={user.id}
                        style={createPostStyles.dropdownItem}
                        onPress={() => {
                          triggerSelectionHaptic();
                          setTagFriends((prev) => [...prev, user.username]);

                          const words = tagInput.split(" ");
                          words[words.length - 1] = `@${user.username}`;
                          setTagInput(words.join(" ") + " ");

                          setTagQuery("");
                          setTagDropdownOpen(false);
                        }}
                      >
                        <Text variant="bodyLarge">@{user.username}</Text>
                      </Pressable>
                    ));
                  })()}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <TextInput
          placeholder="Write your review..."
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          style={createPostStyles.reviewInput}
          mode="outlined"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          caretHidden={false}
          theme={{ ...inputTheme, roundness: 20 }}
          maxLength={150}
        />

        {selectedCity && (
          <View style={createPostStyles.feedbackLayout}>
            <Text
              variant="headlineSmall"
              style={createPostStyles.feedbackQuestionHeader}
            >
              How did you like the city?
            </Text>

            <View style={createPostStyles.iconsLayout}>
              <Pressable
                disabled={ratingStarted}
                onPress={() => {
                  triggerSelectionHaptic();
                  setFeedback("LIKE");
                }}
              >
                <Entypo
                  name="emoji-happy"
                  size={30}
                  color={feedBack === "LIKE" ? "rgb(69, 217, 69)" : "#000"}
                />
              </Pressable>

              <Pressable
                disabled={ratingStarted}
                onPress={() => {
                  triggerSelectionHaptic();
                  setFeedback("NEUTRAL");
                }}
              >
                <Entypo
                  name="emoji-neutral"
                  size={30}
                  color={feedBack === "NEUTRAL" ? "#ffd700" : "#000"}
                />
              </Pressable>

              <Pressable
                disabled={ratingStarted}
                onPress={() => {
                  triggerSelectionHaptic();
                  setFeedback("DISLIKE");
                }}
              >
                <Entypo
                  name="emoji-sad"
                  size={30}
                  color={feedBack === "DISLIKE" ? "#EB7D87" : "#000"}
                />
              </Pressable>
            </View>
          </View>
        )}

        {comparison &&
          comparisonImages.new != null &&
          comparisonImages.existing != null && (
            <>
              <Text
                variant="headlineSmall"
                style={createPostStyles.comparisonQuestionHeader}
              >
                Which city do you prefer?
              </Text>

              <View style={createPostStyles.imageComparisonContainer}>
                <Pressable
                  style={createPostStyles.imageCard}
                  onPress={() => {
                    triggerSelectionHaptic();
                    submitComparison("new");
                  }}
                >
                  {comparisonImages.new && (
                    <Image
                      source={{ uri: comparisonImages.new }}
                      style={createPostStyles.comparisonImage}
                    />
                  )}

                  <View style={createPostStyles.imageCenterOverlay}>
                    <Text style={createPostStyles.imageText}>
                      {comparison.new_city.city_name},{"\n"}
                      {comparison.new_city.country_name}
                    </Text>
                  </View>
                </Pressable>

                <View style={createPostStyles.vsContainer}>
                  <Text variant="headlineSmall" style={createPostStyles.vsText}>
                    VS
                  </Text>
                </View>

                <Pressable
                  style={createPostStyles.imageCard}
                  onPress={() => {
                    triggerSelectionHaptic();
                    submitComparison("existing");
                  }}
                >
                  {comparisonImages.existing && (
                    <Image
                      source={{ uri: comparisonImages.existing }}
                      style={createPostStyles.comparisonImage}
                    />
                  )}

                  <View style={createPostStyles.imageCenterOverlay}>
                    <Text style={createPostStyles.imageText}>
                      {comparison.existing_city.city_name},{"\n"}
                      {comparison.existing_city.country_name}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </>
          )}

        {ratingCompleted &&
          ratingValue !== null &&
          ratingValue !== undefined && (
            <View style={createPostStyles.ratingResultContainer}>
              <Text style={createPostStyles.ratingResultNumber}>
                {"City Rating:"} {ratingValue.toFixed(1)} / 10.0
              </Text>

              {renderStars()}
            </View>
          )}
      </View>

      {uploading && (
        <View style={createPostStyles.uploadOverlay}>
          <PenguinLoader text="Uploading your post..." />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CreatePost;
