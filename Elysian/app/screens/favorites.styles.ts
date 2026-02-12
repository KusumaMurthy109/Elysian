import { StyleSheet } from "react-native";

export const favoritesStyles = StyleSheet.create({
  itineraryIcon: {
    position: "absolute",
    top: 75,
    right: 90,
    zIndex: 10,
  },

  resultsContainer: {
    marginTop: 8,
  },

  title: {
    textAlign: "left",
    fontWeight: "800",
    fontSize: 40,
    lineHeight: 40,
    color: "#000",
    marginBottom: 20,
    marginTop: -20,
  },

  cityCard: {
    width: "100%",
    height: 180,
    marginBottom: 18,
    borderRadius: 20,
    overflow: "hidden", // important for rounded corners
    position: "relative",
  },

  cityCardImage: {
    width: "100%",
    height: "100%",
  },

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

  cityCardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  removeIconBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
    padding: 6,
  },

  removeIconBtnShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
});
