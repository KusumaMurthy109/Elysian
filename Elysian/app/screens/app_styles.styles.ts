import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },

  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#008CFF',
  },

  subtext: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#7D848D',
  },

  input: {
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 60,
    fontSize: 18,
  },

  button: {
    borderRadius: 50,
    marginTop: 8,
    paddingVertical: 6,
    height: 60,
    backgroundColor: '#008CFF',
    justifyContent: 'center',
  },

  buttonLabel: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  signupContainer: {
    marginTop: 30,
    alignItems: 'center',
  },

  signupLink: {
    color: '#95CD00',
    fontWeight: '600',
  },

  image: {
    width: 350,
    height: 350,
    marginTop: 20,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10, // Minimal vertical spacing
    columnGap: 10, // Consistent spacing between columns (if RN 0.71+)
  },

  answerButton: {
    flexBasis: '48%', // Two buttons per row
    height: 120,
    backgroundColor: '#F7F7F9', // Same light gray as input background
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Subtle shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  answerButtonSelected: {
    backgroundColor: '#008CFF', // Brand blue when selected
    shadowOpacity: 0.2,
  },

  answerText: {
    color: '#1B1E28',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  answerTextSelected: {
    color: '#FFFFFF', // White text on blue button
    fontWeight: '700',
  },

  questionText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1B1E28',
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  globeLoaderContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // --- HOME / RECOMMENDATIONS SCREEN STYLES ---

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  homeContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  homeTitle: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    color: '#008CFF',
    marginBottom: 24,
  },

  recommendButton: {
    alignSelf: 'center',
    width: '100%',
    borderRadius: 999,
    paddingVertical: 8,
    marginBottom: 24,
    backgroundColor: '#6540D8',
  },

  recommendButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  loader: {
    marginTop: 20,
  },

  resultsContainer: {
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1B1E28',
  },

  cityCard: {
    marginBottom: 18,
    borderRadius: 20, // Rounded corners
    backgroundColor: '#F7F4FF',
    elevation: 2,  // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cityCardRecommendation: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  removeIconBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    padding: 6,
  },  

  removeIconBtnShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },  

  imageWrapper: {
    position: 'relative',
  },
  
  cityCardInner: {
    borderRadius: 20, // Clips content for rounded edges
    overflow: 'hidden', // Keeps image within rounded corners
  },

  cityImage: {
    width: '100%',
    height: 140,
  },
  cityImageRecommendation: {
    width: '100%',
    height: '100%',
  },

  cityImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2DDFF',
  },
  cityImagePlaceholderRec: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  cityInfo: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cityInfoRec: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  cityNameRec: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "white",
    marginBottom: 25,
    textShadowColor: "rgba(0,0,0,0)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  cityTagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },

  tag: {
    backgroundColor: "rgba(111, 106, 106, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderColor: "rgba(33, 30, 30, 0.64)",
    marginRight: 6,
    marginBottom: 45,
  },

  tagText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 14,
  },
    glassTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 45,
  },


  cityScore: {
    fontSize: 13,
    color: '#666',
  },

  // --- CITY INFO MODAL ---

  cityModalContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },  

  cityModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1E28',
    marginBottom: 10,
  },

  cityModalImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },

  cityModalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 14,
  },

  cityModalCloseBtn: {
    borderRadius: 999,
    backgroundColor: '#008CFF',
  },

  // ---------------------- Used on Profile page ------------------------------
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
  },

  profileImage: {
    height: 140, 
    width: 140,
    borderRadius: 70,
  },

  editIconContainer: { // Pen icon near profile picture 
    height: 31,
    width: 31,
    borderRadius: 15,
    backgroundColor: '#008CFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginLeft: 70,
  },

  nameContainer: { 
    alignItems: 'center',
    marginVertical: 10,
  },

  name: {
    fontSize: 25, 
    marginBottom: 5,
  },

  username: {
    fontSize: 20,
    color: '#999',
    marginBottom: 10,
  },

  editError: { // Error message for editing name and username 
    fontSize: 15,
    color: 'red',
    marginBottom: 5, 
  },

  modalBackground: { // The background when menu pops up 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: { // Menu popup 
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 25,
  },

  topRightIcon: { // Search icon and menu icon 
    position: 'absolute', 
    top: 83,
    right: 30,
    zIndex: 11,
  },

  topLeftIcon: { // Back arrow icon 
    position: 'absolute', 
    top: 83, 
    left: 15, 
    zIndex: 10,
  },

  // ---------------------- Used on Navigation Bar page ------------------------------
  navBar: {
    position: "absolute",
    bottom: 45,
    width: 353,
    height: 60,
    backgroundColor: "#000",
    borderRadius: 50,
    paddingHorizontal: 20,
    marginLeft: 20,
    marginRight: 20,
    borderTopWidth: 0,
  },

  navBarIcons: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  
  // ---------------------- Used on Home page ------------------------------
  floatingUploadButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  uploadIcon: {
    fontSize: 32,
    color: '#000'
  },
   post: {
    marginBottom: 16,
    alignItems: 'center',
  },
  uploader: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
  },
  uploadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    zIndex: 100,
},

searchOverlay: {
  position: "absolute",
  top: 0,              // Align with itinerary icon
  right: 0,
  width: "100%",
  paddingHorizontal: 15,
  zIndex: 10,
},
searchRow: { 
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginTop: 60,
},

searchBarExpanded: {
  position: "absolute",
  top: 87,
  left: 30,
  right: 15,
  width: "75%",
  height: 45,

  // Glass look
  borderRadius: 26, // Rounded
  overflow: "hidden",

  // Glass effect border
  borderWidth: 1,
  borderColor: 'rgba(174, 170, 170, 0.15)',

  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  zIndex: 10,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
},

searchInput: {
  flex: 1,
  backgroundColor: "transparent",
  marginRight: 8,
},

searchDropdown: {
  position: "absolute",
  top: 140,
  left: 30,
  right: 30,
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  maxHeight: 220,
  zIndex: 9,
},

searchResultItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

searchBackdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 5,
},
glassButton: {
    padding: 10,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(174, 170, 170, 0.15)',
    },
});

export const inputTheme = {
  roundness: 50,
  colors: {
    primary: '#008CFF', // Underline and label when focused
    background: '#F7F7F9', // Input background color
    text: '#1B1E28', // Input text color
    placeholder: '#807f7fff', // Label/placeholder color
    outline: 'transparent',
  },
};

export const selectedColors = [
  '#95CD00',
  '#F49F9A',
  '#FBD605',
];
