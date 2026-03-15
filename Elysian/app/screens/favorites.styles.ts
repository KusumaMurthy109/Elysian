/**
 * This file contains the styles used for the Favorites screen.
 * It controls the layout of city cards, text, images, and action icons
 * to keep the interface simple, clean, and easy to use.
 *
 * Used in Favorites components across the Elysian app.
 */
import { StyleSheet } from "react-native";

export const favoritesStyles = StyleSheet.create({
  title: {
    textAlign: "left",
    fontWeight: "800",
    fontSize: 45,
    lineHeight: 45,
    color: "#000",
    marginBottom: 20,
    marginTop: -20,
  },

  itineraryIcon: {
    position: "absolute",
    top: 75,
    right: 90,
    zIndex: 10,
  },

  sortLabel: {
    fontSize: 14,
    color: "#444",
  },

  sortRow: {
    position: "absolute",
    top: 80,
    right: 32,
    zIndex: 10,
  },

  sortIconWrapper: {
    padding: 6,
  },

  sortMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 165,
    paddingRight: 28,
  },

  sortMenu: {
    backgroundColor: "#FFFDFC",
    borderRadius: 18,
    paddingVertical: 8,
    width: 190,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },

  sortMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  sortMenuText: {
    fontSize: 15,
    color: "#222",
  },

  sortMenuTextActive: {
    fontWeight: "700",
    color: "#000",
  },

  resultsContainer: {
    marginTop: 36,
  },

  cityCard: {
    width: "100%",
    height: 180,
    marginBottom: 18,
    borderRadius: 20,
    overflow: "hidden",
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

  cityCardBlurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },

  cityCardTextContainer: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
  },

  cityCardText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
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
