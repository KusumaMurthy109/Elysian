/**
 * This file contains the styles used for the Home screen.
 * It controls the layout of post cards, text, images, and action icons
 * to keep the interface simple, clean, and easy to use.
 *
 * Used in Home components across the Elysian app.
 */
import { StyleSheet, Dimensions } from "react-native";
const SCREEN_WIDTH = Dimensions.get("window").width;
const IMG_WIDTH = SCREEN_WIDTH - 75;

export const homeStyles = StyleSheet.create({

  homeContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },

  postContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 35,
    marginBottom: 18,
  },

  imageContainer: {
    width: IMG_WIDTH,
    height: 225,
    borderRadius: 25,
    marginTop: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  cityImage: {
    width: IMG_WIDTH,
    height: "100%",
  },

  cityOverlay: {
    position: "absolute",
    top: 140,
    left: 20,
    bottom: 20,
  },

  cityFont: {
    fontSize: 40,
    fontWeight: "600",
    color: "white",
  },

  countryFont: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },

  pinIcon: {
    flexDirection: "row",
  },

  ratingOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  ratingTag: {
    backgroundColor: "white",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
  },

  ratingFont: {
    color: "black",
    fontSize: 18,
  },

  contentContainer: {
    height: 90,
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  uploader: {
    marginTop: 10,
    fontSize: 15,
    color: "black",
  },

  date: {
    alignSelf: "flex-end",
    marginTop: 45,
    fontSize: 15,
    color: "black",
  },

  postIcons: {
    position: "absolute",
    marginTop: 10,
    right: 15,
    flexDirection: "row",
    gap: 5,
  },
}); 