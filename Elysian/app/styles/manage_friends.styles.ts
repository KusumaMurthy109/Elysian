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
    alignContent: "center",
  },

  tabBar: {
    backgroundColor: "transparent",
    // elevation: 0,
    // shadowOpacity: 0,
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
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 22,
    backgroundColor: "#FFFDFC",
    borderWidth: 1,
    borderColor: "transparent",
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
    minHeight: 180,
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
