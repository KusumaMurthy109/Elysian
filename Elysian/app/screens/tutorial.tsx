import { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { tutorialStyles } from "../styles/tutorial.styles";
import { styles } from "../styles/app_styles.styles";


export default function Tutorial() {
    const navigation = useNavigation();
    const [page, setPage] = useState(0);

    // All tutorial content lives here
    const pages = [
        {
            image: require("../../assets/tutorial1.jpg"),
            title: "Life is Short and the World is Wide",
            description:
                "At Elysian, we customize your preferences to generate potential travel destinations all over the world.",
        },
        {
            image: require("../../assets/tutorial2.jpg"),
            title: "It's a Big World Out There, Go Explore",
            description:
                "Share your adventures and learn about places others have been through their posts.",
        },
        {
            image: require("../../assets/tutorial3.jpg"),
            title: "People Don't Take Trips, Trips Take People",
            description:
                "Co-plan easily with friends by creating shared itineraries with a list of recommended activities.",
        },
    ];

    const handleNext = async () => {
        // If not on the last page, go to next page
        if (page < pages.length - 1) {
            setPage(page + 1);
            return;
        }

        // Last page → mark onboarding complete
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            await setDoc(
                doc(FIREBASE_DB, "users", user.uid),
                { accountCreationComplete: true },
                { merge: true }
            );
        }

        // App.tsx will automatically redirect to NavigationBar
    };

    return (
        <View style={tutorialStyles.container}>
            <View style={tutorialStyles.imageWrapper}>
                <Image source={pages[page].image} style={tutorialStyles.image} />
            </View>

            <Text style={tutorialStyles.title}>{pages[page].title}</Text>
            <Text style={tutorialStyles.description}>{pages[page].description}</Text>


            <Button
                mode="contained"
                onPress={handleNext}
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                {page < pages.length - 1 ? "Next" : "Begin"}
            </Button>
        </View>
    );
}