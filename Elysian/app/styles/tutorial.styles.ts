/**
 * Tutorial Styles
 *
 * This file contains the styles for the Tutorial screen.
 * It controls the layout of the 3 tutorial pages including the pictures, the buttons, and the text.
 *
 * Used in recommendation related components.
 */
import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;


export const tutorialStyles = StyleSheet.create({
    imageWrapper: {
        width: "100%",
        height: SCREEN_HEIGHT / 1.5,
        backgroundColor: "white",
    },


    container: {
        flex: 1,
        backgroundColor: "white",
    },

    image: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
        resizeMode: "cover",
        paddingBottom: 40,
    },

    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 24,
        alignItems: "center",
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom:20,
        paddingHorizontal: 20,
        textAlign: "center",
    },

    description: {
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 30,
        color: "#63a4e1",
    },


});