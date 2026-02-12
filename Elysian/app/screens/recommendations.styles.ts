import { StyleSheet } from 'react-native';

export const recommendationStyles = StyleSheet.create({
    cityCardRecommendation: {
        position: "absolute",
        top: 0,
        left: 0,
    },

    cityImageRecommendation: {
        width: '100%',
        height: '100%',
    },

    cityImagePlaceholderRec: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
    },

    cityInfoRec: {
        position: "absolute",
        bottom: 60,
        left: 40,
        right: 20,
    },

    cityNameRec: {
        fontSize: 45,
        fontWeight: '800',
        color: "white",
        marginBottom: 25,
    },

    cityTagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 2,
    },

    glassTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 100,
        backgroundColor: "#1c1c1c"
    },

    tagText: {
        color: "white",
        fontWeight: 'bold',
        fontSize: 18,
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

    cityImageContainerRec: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
    },

    bottomBlurOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50%",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
    }
    
})