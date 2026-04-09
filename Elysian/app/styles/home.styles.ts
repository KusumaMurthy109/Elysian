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
  title: {
    textAlign: "left",
    fontWeight: "800",
    fontSize: 45,
    color: "#000",
    marginBottom: -10,
    marginTop: -10,
  },

  homeContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },

  postContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 35,
    marginBottom: 18,
    position: "relative",
    paddingBottom: 5,
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
    pointerEvents: "none",
  },

  cityFont: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
  },

  countryFont: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  pinIcon: {
    flexDirection: "row",
  },

  ratingOverlay: {
    position: "absolute",
    alignItems: "center",
    top: 15,
    right: 15,
  },

  ratingTag: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
  },

  ratingFont: {
    color: "black",
    fontSize: 17,
    fontWeight: 600,
  },

  contentContainer: {
    minHeight: 90,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  uploader: {
    fontSize: 17,
    fontWeight: 600,
    color: "black",
    marginTop: 10,
  },

  reviewFont: {
    top: 10,
    fontSize: 17,
    color: "black",
    marginBottom: 10,
  },

  date: {
    fontSize: 15,
    color: "black",
    alignSelf: "flex-end",
    top: 20,
  },

  postIcons: {
    position: "absolute",
    marginTop: 5,
    right: 15,
    flexDirection: "row",
    gap: 5,
  },

  postBlurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    pointerEvents: "none",
  },

  // Scroll indicator container (dots at bottom center of image)
  scrollIndicatorContainer: {
    position: "absolute",
    bottom: 10, // Distance from bottom of image
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // Individual dot
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)", // semi-transparent by default
    marginHorizontal: 3,
  },

  // Active dot (current image)
  activeScrollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },

  tagFriends: {
    fontSize: 15,
    color: '#333',
    marginTop: 10,
  },

  tagFriendsDivider: {
    fontSize: 20,
    color: '#333'
  },

  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    //backgroundColor: 'rgba(99, 164, 225, 0.2)',
    //backgroundColor: 'rgba(51, 55, 93, 0.2)',
    //backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 30,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },

  activeTab: {
    //backgroundColor: 'rgba(255, 255, 255, 0.9)',
    //backgroundColor: "#63a4e1",
    //backgroundColor: "#33375D",
    backgroundColor: "#000",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  activeTabText: {
    //color: '#000',
    color: '#FFF',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
