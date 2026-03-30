import { StyleSheet } from "react-native";

export const manageFriendsStyles = StyleSheet.create({
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },

  tabContainer: {
    flex: 1,
  },

  tabLabel: {
    fontSize: 18,
    fontWeight: "500",
  },

  tabIndicator: {
    backgroundColor: "#000",
    height: 3,
    borderRadius: 2,
    alignContent: "center",
  },

  tabBar: {
    backgroundColor: "transparent",
  },

  tabContent: {
    flex: 1,
    backgroundColor: "#FFFDFC",
  },
  
  scrollContainer: {
    paddingBottom: 40,
  },

  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#63a4e1",
  },

  friendUsername: {
    fontSize: 14,
    color: "#666",
  },

  iconContainer: {
    flexDirection: "row", 
    gap: 12
  },
  
  tabPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  friendEmpty: {
    flex: 1,
    marginTop: 180,
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
  },
});