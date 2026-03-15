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
    top: 65,
    right: 90,
    zIndex: 10,
  },

  resultsContainer: {
    marginTop: 8,
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

  sortRow: {
    position: "absolute",
    right: 35,
    top: 85,
    zIndex: 5,
    marginTop: -20,
  },

  sortIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(255,255,255,0.8)",
  },

  sortMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },

  sortMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    minWidth: 170,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 30,
  },

  sortMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  sortMenuText: {
    fontSize: 15,
    color: "#444",
  },

  sortMenuTextActive: {
    fontSize: 15,
    color: "#000",
    fontWeight: "700",
  },
});
