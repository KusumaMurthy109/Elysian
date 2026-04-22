/**
 * file: post_component.tsx
 * 
 * This file contains the post component that renders an individual post item
 */

import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { homeStyles } from "../styles/home.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

// This defines what the post object should look like
export type Post = {
  id: string;
  urls: string[];
  uploader: string;
  uid: string;
  city: {
    id: string;
    name: string;
    country: string;
  };
  review: string;
  tagFriends: string[];
  ratingValue: number;
  timestamp: number;
  likeCount?: number;
};

type PostItemProps = {
  item: Post;
  postImageIndices: { [postId: string]: number };
  onScrollImage: (postId: string, offsetX: number, imageWidth: number) => void;
  onHandleReview: (postId: string) => void;
  expandedReview: { [key: string]: boolean };
  currentUser: any;
  userFriends: { [uid: string]: boolean };
  friendRequestsSent: { [uid: string]: boolean };
  friendRequestsReceieved: { [uid: string]: boolean };
  onAddFriend: (friendUid: string) => Promise<void>;
  onLikePost: (postId: string) => Promise<void>;
  userLikes: { [postId: string]: boolean };
  userFavorites: { [key: string]: boolean };
  onRemoveCity: (city: { id: string; name: string; country: string }) => Promise<void>;
  onAddCity: (city: { id: string; name: string; country: string }) => Promise<void>;
};

const PostItem: React.FC<PostItemProps> = ({
  item,
  postImageIndices,
  onScrollImage,
  onHandleReview,
  expandedReview,
  currentUser,
  userFriends,
  friendRequestsSent,
  friendRequestsReceieved,
  onAddFriend,
  onLikePost,
  userLikes,
  userFavorites,
  onRemoveCity,
  onAddCity,
}) => {
  const currentIndex = postImageIndices[item.id] || 0;

  return (
    <View style={homeStyles.postContainer}>
      {/* Image */}
      <View style={homeStyles.imageContainer}>
        <FlatList
          data={item.urls}
          horizontal={item.urls.length > 1}
          pagingEnabled={item.urls.length > 1}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(uri, index) => uri + index}
          onScroll={
            item.urls.length > 1
              ? (event) =>
                  onScrollImage(
                    item.id,
                    event.nativeEvent.contentOffset.x,
                    homeStyles.cityImage.width,
                  )
              : undefined
          }
          scrollEventThrottle={16}
          renderItem={({ item: uri }) => (
            <Image
              source={{ uri }}
              style={homeStyles.cityImage}
              resizeMode="cover"
            />
          )}
        />

        {/* Progressive Blur on bottom - only on first image */}
        {currentIndex === 0 && (
          <View style={homeStyles.postBlurContainer}>
            <MaskedView
              maskElement={
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.9)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                />
              }
              style={{ flex: 1 }}
            >
              <BlurView intensity={100} tint="dark" style={{ flex: 1 }} />
            </MaskedView>
          </View>
        )}

        {/* Scroll indicators (only if multiple images) */}
        {item.urls.length > 1 && (
          <View style={homeStyles.scrollIndicatorContainer}>
            {item.urls.map((_, i) => (
              <View
                key={i}
                style={[
                  homeStyles.scrollDot,
                  i === currentIndex && homeStyles.activeScrollDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* City, Country overlay - hide if not first image */}
        {currentIndex === 0 && item.city && (
          <View style={homeStyles.cityOverlay}>
            <Text style={homeStyles.cityFont}>{item.city.name}</Text>
            <View style={homeStyles.pinIcon}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={22}
                color="#fff"
              />
              <Text style={homeStyles.countryFont}>{item.city.country}</Text>
            </View>
          </View>
        )}

        {/* Rating */}
        {item.ratingValue !== undefined && (
          <View style={homeStyles.ratingOverlay}>
            <View style={homeStyles.ratingTag}>
              <Text style={homeStyles.ratingFont}>
                {item.ratingValue.toFixed(1)}
              </Text>
              <MaterialCommunityIcons name="star-face" size={20} color="#000" />
            </View>
          </View>
        )}
      </View>

      {/* Uploader, review, date */}
      <View style={homeStyles.contentContainer}>
        <View>
          <Text style={homeStyles.uploader}>@{item.uploader}</Text>

          {item.tagFriends && item.tagFriends.length > 0 && (
            <Text style={homeStyles.tagFriends}>
              {item.tagFriends.map((friend, index) => (
                <Text key={friend}>
                  @{friend}
                  {index < item.tagFriends.length - 1 && (
                    <Text style={homeStyles.tagFriendsDivider}> | </Text>
                  )}
                </Text>
              ))}
            </Text>
          )}

          <TouchableOpacity activeOpacity={1} onPress={() => onHandleReview(item.id)}>
            <Text
              style={homeStyles.reviewFont}
              numberOfLines={expandedReview[item.id] ? undefined : 2}
              ellipsizeMode="tail"
            >
              {item.review}
            </Text>
          </TouchableOpacity>

          <Text style={homeStyles.date}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>

        <View style={homeStyles.postIcons}>
          {item.uid !== currentUser?.uid && (
            <TouchableOpacity
              onPress={() => onAddFriend(item.uid)}
              disabled={
                userFriends[item.uid] ||
                friendRequestsSent[item.uid] ||
                friendRequestsReceieved[item.uid]
              }
            >
              <Ionicons
                name={
                  userFriends[item.uid]
                    ? "people-circle"
                    : friendRequestsSent[item.uid] || friendRequestsReceieved[item.uid]
                    ? "time-outline"
                    : "people-circle-outline"
                }
                size={29}
                color={
                  userFriends[item.uid]
                    ? "#63a4e1"
                    : friendRequestsSent[item.uid] || friendRequestsReceieved[item.uid]
                    ? "#ccc"
                    : "#000"
                }
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onLikePost(item.id)}>
            <Ionicons
              name={userLikes[item.id] ? "heart" : "heart-outline"}
              size={28}
              color={userLikes[item.id] ? "#EB7D87" : "#000"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!item.city) return;

              const postCity = {
                id: item.city.id,
                name: item.city.name,
                country: item.city.country,
              };

              if (userFavorites[item.city.id]) {
                onRemoveCity(postCity);
              } else {
                onAddCity(postCity);
              }
            }}
          >
            <Ionicons
              name={
                item.city && userFavorites[item.city.id]
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={28}
              color={"#000"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostItem;