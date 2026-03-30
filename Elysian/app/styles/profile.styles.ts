/**
 * This file contains the styles for the Profile screen.
 * It defines the layout for the header image, profile photo,
 * user details, and edit actions to create a clean and
 * visually balanced profile page.
 *
 * Used in profile related components across the app.
 */

import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  topImageContainer: {
    position: "absolute",
    top: -10,
    left: -150,
    height: "50%",
    width: "100%",
  },

  topImage: {
    width: "200%",
    height: "100%",
  },

  halfCircleCutout: {
    position: "absolute",
    bottom: -320, // controls how deep the curve goes
    left: "28%",
    transform: [{ translateX: -150 }],
    width: 800,
    height: 400,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
    backgroundColor: "#FFFDFC",
  },

  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 75,
  },

  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#f7f7f7",
  },

  editIconContainer: {
    // Pen icon near profile picture
    height: 31,
    width: 31,
    borderRadius: 15,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    marginLeft: 70,
  },

  nameContainer: {
    alignItems: "center",
    marginVertical: 10,
  },

  name: {
    fontWeight: 700,
    marginBottom: 5,
    color: "#f7f7f7",
  },

  username: {
    fontSize: 20,
    fontWeight: 600,
    color: "#f7f7f7",
    marginBottom: 10,
  },

  editError: {
    // Error message for editing name and username
    fontSize: 15,
    color: "red",
    marginBottom: 5,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 80,
    paddingHorizontal: 20,
  },

  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  editModalContent: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  editModalContainer: {
    position: "absolute",
    top: "29%",
    bottom: "29%",
    left: "5%",
    right: "5%",
    backgroundColor: "#FFFDFC",
    padding: 20,
    borderRadius: 40,
    zIndex: 1001, // above overlay
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  editModalTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#000",
    marginBottom: 25,
    textAlign: "center",
  },

  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 10,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(174, 170, 170, 0.15)",
  },

  closeButtonShared: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },

  editProfileCloseButtonShared: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },

  sharedInput: {
    backgroundColor: "transparent",
    marginHorizontal: 12,
    marginTop: 30,
  },

  activityInput: {
    backgroundColor: "transparent",
    marginTop: 10,
    marginBottom: 10,
  },

  changePhotoButton: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "#63a4e1",
    borderColor: "#63a4e1",
    paddingVertical: 5,
    marginBottom: 10,
  },

  photoButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  scrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingTop: 16,
    justifyContent: "space-between",
  },

  scrollGrid: {
    width: "48%",
    marginBottom: 13,
  },

  scrollCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  scrollCardBlurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },

  cardCityText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  cardCityTextContainer: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
  },

  modalCityImage: {
    width: "100%",
    height: 225,
    borderRadius: 25,
    marginTop: 18,
    overflow: "hidden",
    alignSelf: "center",
  },

  modalRatingOverlay: {
    position: "absolute",
    alignItems: "center",
    top: 15,
    left: 15,
  },

  likeOverlay: {
    position: "absolute",
    alignItems: "center",
    top: 8,
    right: 8,
  },

  likeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: "#f7f7f7",
    borderColor: "#f7f7f7",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  likeCountText: {
    color: "black",
    fontSize: 15,
    fontWeight: 500,
    paddingRight: 2,
  },

  openPostLikeCountText: {
    color: "black",
    fontSize: 17,
  },

  emptyPageImage: {
    width: 150,
    height: 150,
    marginTop: 30,
    alignSelf: "center",
  },

  dismissKeyboardConstainer: {
    flex: 1,
  },

  modalOverlayPressable: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },

  editModalInnerContainer: {
    flex: 1,
    width: "100%",
  },

  tabContainer: {
    flex: 1,
    marginTop: -500,
  },
  
  tabContent: {
    flex: 1,
    backgroundColor: "#FFFDFC",
  },

  tabIndicator: {
    backgroundColor: "#000",
    height: 3,
    borderRadius: 2,
    alignContent: "center",
  },

  tabLabel: {
    fontSize: 22,
    fontWeight: "600",
  },

  tabBar: {
    backgroundColor: "transparent",
  },
  
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  },

  sortMenuOverlay: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 10,
    bottom: 0,
    zIndex: 20,
  },

  sortMenu: {
    position: "absolute",
    top: 60,
    right: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    minWidth: 170,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(174, 170, 170, 0.15)",
  },

  sortMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  sortMenuText: {
    fontSize: 15,
    color: "#000",
  },

  sortMenuTextActive: {
    fontSize: 15,
    color: "#000",
    fontWeight: "700",
  },

  divider: {
    height: 0.5,
    backgroundColor: "#C7C7CC",
    marginHorizontal: 12,
  }
});

