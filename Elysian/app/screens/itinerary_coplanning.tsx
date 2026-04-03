import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Text,
    Image,
    TouchableOpacity,
    Pressable,
} from "react-native";
import {
    doc,
    onSnapshot,
    getDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { styles } from "../styles/app_styles.styles";
import { itinerarySubTabStyles } from "../styles/user_itineraries.styles";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import { GlassView } from "expo-glass-effect";
import { itineraryStyles } from "../styles/itinerary.styles";
import { getAuth } from "firebase/auth";


/* ------------------ TYPES ------------------ */

type Activity = {
    name: string;
    likes: string[];
};

type Itinerary = {
    id: string;
    activities: Activity[];
    city: string;
    country: string;
    imageUrl?: string | null;
    ownerId: string;
    sharedWith: string[];
};


const ItineraryCoPlanning = ({ route, navigation }: any) => {
    const { itineraryId, imageUrl } = route.params;

    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
    const [sharedUsernames, setSharedUsernames] = useState<string[]>([]);
    const [newActivity, setNewActivity] = useState("");

    const auth = getAuth();
    const currentUser = auth.currentUser;

    /* ------------------ LOAD ITINERARY ------------------ */
    useEffect(() => {
        const ref = doc(FIREBASE_DB, "itineraries", itineraryId);

        const unsub = onSnapshot(ref, async (snap) => {
            if (snap.exists()) {
                const data = snap.data() as Omit<Itinerary, "id">;
                setItinerary({ id: snap.id, ...data });

                // Owner username
                const ownerSnap = await getDoc(doc(FIREBASE_DB, "users", data.ownerId));
                if (ownerSnap.exists()) {
                    setOwnerUsername(ownerSnap.data().username);
                }

                // Shared usernames
                const names: string[] = [];
                for (const uid of data.sharedWith || []) {
                    const u = await getDoc(doc(FIREBASE_DB, "users", uid));
                    if (u.exists()) names.push(u.data().username);
                }
                setSharedUsernames(names);
            }
        });

        return unsub;
    }, []);

    if (!itinerary) return null;

    const sharedUsernameList =
        sharedUsernames.length > 0
            ? sharedUsernames.map((u) => `@${u}`).join(", ")
            : "None";


    const addActivity = async () => {
        if (!newActivity.trim()) return;

        const ref = doc(FIREBASE_DB, "itineraries", itinerary.id);
        const newObj = { name: newActivity.trim(), likes: [] };

        await updateDoc(ref, {
            activities: [...itinerary.activities, newObj],
            updatedAt: new Date(),
        });

        setNewActivity("");
    };

    const toggleLike = async (activityName: string) => {
        if (!currentUser) return;

        const updated = itinerary.activities.map((activity) => {
            if (activity.name !== activityName) return activity;
            const alreadyLiked = activity.likes.includes(currentUser.uid);
            return {
            ...activity,
            likes: alreadyLiked
                ? activity.likes.filter((id) => id !== currentUser.uid)
                : [...activity.likes, currentUser.uid],
            };
        });
        await updateDoc(doc(FIREBASE_DB, "itineraries", itinerary.id), {
            activities: updated,
        });
    };

    const removeActivity = async (activityName: string) => {
        if (!itinerary) return;
        
        // If last activity → delete itinerary
        if (itinerary.activities.length === 1) {
            await deleteDoc(doc(FIREBASE_DB, "itineraries", itinerary.id));
            navigation.goBack();
            return;
        }

        const updated = itinerary.activities.filter((a) => a.name !== activityName);

        await updateDoc(doc(FIREBASE_DB, "itineraries", itinerary.id), {
            activities: updated,
            updatedAt: new Date(),
        });
    };

    const sortActivitiesByLikes = (activities: Activity[]): Activity[] => {
        return [...activities].sort((a, b) => b.likes.length - a.likes.length);
    };

    const sortedActivities = sortActivitiesByLikes(itinerary.activities);

    return (
        <View style={styles.solidSafeArea}>
            {/* BACK BUTTON */}
            <View style={styles.topLeftIcon}>
                <Pressable onPress={() => navigation.goBack()}>
                    <GlassView style={styles.glassButton}>
                        <Ionicons name="return-up-back-outline" size={26} color="#000" />
                    </GlassView>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                }}
            >
                <View 
                    style={{alignItems: "center",
                            paddingHorizontal: 18,
                            paddingTop: 80,
                            paddingBottom: 30}}
                >
                    <Text style={itineraryStyles.itineraryCityName}>
                        Co-Plan Trip
                    </Text>
                </View>

                {/* IMAGE */}
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.cityModalImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[
                            styles.cityModalImage,
                            { backgroundColor: "#e0e0e0" },
                        ]}
                    />
                )}


                {/* TITLE */}
                <Text style={styles.cityModalTitle}>
                    {itinerary.city}, {itinerary.country}
                </Text>

                {/* OWNER */}
                <Text style={itinerarySubTabStyles.sharedWithText}>
                    Created by:{" "}
                    <Text style={itinerarySubTabStyles.sharedWithNames}>
                        @{ownerUsername}
                    </Text>
                </Text>

                {/* SHARED WITH */}
                <Text style={itinerarySubTabStyles.sharedWithText}>
                    Shared with:{" "}
                    <Text style={itinerarySubTabStyles.sharedWithNames}>
                        {sharedUsernameList}
                    </Text>
                </Text>

                {/* ACTIVITIES */}
                <Text style={itinerarySubTabStyles.activityLabelText}>Activities:</Text>

                <View style={itinerarySubTabStyles.activitiesContainer}>
                    {sortedActivities.map((a, i) => (
                        <View key={a.name} style={itinerarySubTabStyles.activityRow}>
                            <Text style={itinerarySubTabStyles.activityBullet}>•</Text>
                            <Text style={itinerarySubTabStyles.activityText}>{a.name}</Text>

                            <View style={itinerarySubTabStyles.likeContainer}>
                            <TouchableOpacity onPress={() => toggleLike(a.name)}>
                                <Ionicons
                                name={
                                    a.likes.includes(currentUser?.uid ?? "")
                                    ? "thumbs-up"
                                    : "thumbs-up-outline"
                                }
                                size={20}
                                color={
                                    a.likes.includes(currentUser?.uid ?? "")
                                    ? "#33375D"
                                    : "#807f7fff"
                                }
                                />
                            </TouchableOpacity>

                            <Text style={itinerarySubTabStyles.likeCount}>{a.likes.length}</Text>

                            <TouchableOpacity
                                onPress={() => removeActivity(a.name)}
                                style={{ marginLeft: 10 }}
                            >
                                <Ionicons name="trash-outline" size={20} color="#807f7fff" />
                            </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ADD ACTIVITY */}
                <View style={{ overflow: "hidden" }}>
                    <View style={itinerarySubTabStyles.addActivityContainer}>
                        <GlassView style={itinerarySubTabStyles.activityInputBar}>
                            <TextInput
                                placeholder="Add an activity..."
                                placeholderTextColor="#666"
                                value={newActivity}
                                onChangeText={setNewActivity}
                                style={styles.searchInput}
                                mode="flat"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                selectionColor="#000"
                            />
                        </GlassView>

                        <TouchableOpacity
                            onPress={addActivity}
                            activeOpacity={0.8}
                            style={{ marginLeft: 10 }}
                        >
                            <GlassView style={styles.glassButton}>
                                <Ionicons name="add" size={24} color="#000" />
                            </GlassView>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );

}
export default ItineraryCoPlanning;