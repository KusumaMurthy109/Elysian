/**
 * This file contains the styles used for the Favorites screen.
 * It controls the layout of city cards, text, images, and action icons
 * to keep the interface simple, clean, and easy to use.
 *
 * Used in Favorites components across the Elysian app.
 */
import { StyleSheet } from "react-native";

export const favoritesStyles = StyleSheet.create({
  // Icon that lets users generate an itinerary from a saved city.
  // Positioned above the card so it is easy to spot and tap.
  itineraryIcon: {
    position: "absolute",
    top: 75,
    right: 90,
    zIndex: 10,
  },

  // Wrapper for the list of favorite cities.
  // Adds a little space from the header.
  resultsContainer: {
    marginTop: 8,
  },

  // Main screen title styling.
  // Large and bold to clearly label the page.
  title: {
    textAlign: "left",
    fontWeight: "800",
    fontSize: 40,
    lineHeight: 40,
    color: "#000",
    marginBottom: 20,
    marginTop: -20,
  },

  // Card that displays each saved city.
  // Rounded edges and hidden overflow keep images clean.
  cityCard: {
    width: "100%",
    height: 180,
    marginBottom: 18,
    borderRadius: 20,
    overflow: "hidden", // important for rounded corners
    position: "relative",
  },

  // Ensures the city image fills the entire card.
  cityCardImage: {
    width: "100%",
    height: "100%",
  },

  // Fallback shown if an image is unavailable.
  // Uses a soft color so the UI still looks polished.
  cityCardPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E2DDFF",
  },

  // Bottom 1/3 blurred
  cityCardBlurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%", // bottom third
  },

  // Container for text, positioned inside the blurred area
  cityCardTextContainer: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
  },
  // City name styling.
  // White text contrasts well against the blur.
  cityCardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  // Button for removing a city from favorites.
  // Dark background improves visibility on bright images.
  removeIconBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
    padding: 6,
  },

  // Adds subtle depth so the button does not look flat.
  removeIconBtnShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
});
