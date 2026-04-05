import { StyleSheet } from "react-native";

export const manageFriendsStyles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 25,
    lineHeight: 45,
    color: "#000",
    marginBottom: 20,
    marginTop: 25,
    marginHorizontal: 20,
  },

  tabContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  tabLabel: {
    fontSize: 18,
    fontWeight: "500",
  },

  tabIndicator: {
    backgroundColor: "#000",
    height: 3,
    borderRadius: 2,
  },

  tabBar: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },

  tabContent: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContainer: {
    paddingBottom: 40,
  },

  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(174, 170, 170, 0.15)",
  },

  friendInfo: {
    flex: 1,
    marginRight: 12,
  },

  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#63a4e1",
  },

  friendUsername: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  iconContainer: {
    flexDirection: "row",
    gap: 12,
  },

  friendEmpty: {
    flex: 1,
    minHeight: 420,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyPageImage: {
    width: 150,
    height: 150,
    marginTop: 30,
    alignSelf: "center",
  },

  emptyText: {
    paddingTop: 10,
    fontSize: 20,
    fontWeight: "600",
    color: "#63a4e1",
    textAlign: "center",
  },
});
