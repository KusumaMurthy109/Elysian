import { StyleSheet } from "react-native";

export const manageFriendsStyles = StyleSheet.create({
  normalHeader: {
    marginTop: 18,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchHeader: {
    marginTop: 18,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

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

  friendsSearchBar: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },

  friendsSearchInput: {
    backgroundColor: "transparent",
    fontSize: 16,
    height: 48,
  },

  searchResultsWrapper: {
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.78)",
  },

  searchResultItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    backgroundColor: "transparent",
  },

  searchUserRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  searchEmptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },

  lastSearchResultItem: {
    borderBottomWidth: 0,
  },

  tabContainer: {
    flex: 1,
    marginTop: 14,
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
    gap: 12,
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
