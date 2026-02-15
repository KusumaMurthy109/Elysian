/**
 *This file contains the styles for the Profile Preferences screen.
 * It controls the layout for the profile header, user details,
 * question sections, and action buttons to keep the screen organized
 * and easy to read.
 * Used in profile and preferences related components.
 */

import { StyleSheet } from "react-native";

export const profilePreferencesStyles = StyleSheet.create({
  profileHeader: {
    alignItems: "flex-end", // vertically center text with image
    paddingHorizontal: 40,
    paddingTop: 20,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  username: {
    fontSize: 14,
    color: "#999",
  },

  content: {
    flex: 1,
    paddingHorizontal: 40,
  },

  questionBlock: {
    marginBottom: 20,
  },

  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#000",
  },

  answerPill: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(174, 170, 170, 0.15)",
    elevation: 2,
  },

  answerText: {
    fontSize: 14,
    color: "#474747",
  },

  logoutButton: {
    width: "40%",
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "#000",
    paddingVertical: 5,
  },

  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
