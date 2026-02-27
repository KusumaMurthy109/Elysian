import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import UserPosts from "./user_posts";
import UserItineraries from "./user_itineraries";

export type ProfileTopTabParamList = {
  Posts: undefined;
  Itineraries: undefined;
};

const Tab = createMaterialTopTabNavigator<ProfileTopTabParamList>();

const ProfileMainScreen = ({ userId }: { userId: string }) => {
  return (
    <Tab.Navigator
      initialRouteName="Posts"
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: "#000", height: 3, borderRadius: 2 },
        tabBarLabelStyle: { fontSize: 20, fontWeight: "600" },
        tabBarStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tab.Screen name="Posts">
        {() => <UserPosts userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Itineraries" component={UserItineraries} />
    </Tab.Navigator>
  );
};

export default ProfileMainScreen;