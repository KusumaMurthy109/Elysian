import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
    topImageContainer: {
    position: 'absolute',
    top: -10,
    left: -150,
    height: '50%',
    width: '100%', 
    },

    topImage: {
    width: '200%',
    height: '100%',
    },

    halfCircleCutout: {
        position: 'absolute',
        bottom: -320,               // controls how deep the curve goes
        left: '30%',
        transform: [{ translateX: -150 }],
        width: 800,
        height: 400, 
        borderTopLeftRadius: 400,
        borderTopRightRadius: 400,
        backgroundColor: 'white',
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
    borderWidth: 3,
    borderColor: '#fff',
  },

  editIconContainer: { // Pen icon near profile picture 
    height: 31,
    width: 31,
    borderRadius: 15,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    marginLeft: 70,
  },

  nameContainer: { 
    alignItems: 'center',
    marginVertical: 10,
  },

  name: {
    fontSize: 30, 
    fontWeight: 600,
    marginBottom: 5,
    color: 'white'
  },

  username: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },

  editError: { // Error message for editing name and username 
    fontSize: 15,
    color: 'red',
    marginBottom: 5, 
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 80,
    paddingHorizontal: 20,
  },

  saveButton: {
    width: '40%',
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#000',
    paddingVertical: 5,
  },

  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})