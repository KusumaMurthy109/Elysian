import React, {useState} from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {BlurView} from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { homeStyles } from "../styles/home.styles";
import { Post } from "../hooks/usePosts";

type Props = {
    post: Post;
};

const PostCard = ({post}: Props) => {
    const [expandedReview, setExpandedReview] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const onScrollImage = (offsetX: number, width: number) => {
        const index = Math.round(offsetX /width);
        setCurrentIndex(index);
    };

    return (
        <View style={homeStyles.postContainer}>
            {/* Image */}
            <View style={homeStyles.imageContainer}>
                <FlatList
                data={post.urls}
                horizontal={post.urls.length > 1}
                pagingEnabled={post.urls.length > 1}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyExtractor={(uri, index) => uri + index}
                onScroll={
                    post.urls.length > 1
                    ? (event) =>
                        onScrollImage(
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
                    <BlurView
                        intensity={100}
                        tint="dark"
                        style={{ flex: 1 }}
                    />
                    </MaskedView>
                </View>
                )}

                {/* Scroll indicators (only if multiple images) */}
                {post.urls.length > 1 && (
                <View style={homeStyles.scrollIndicatorContainer}>
                    {post.urls.map((_, i) => (
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
                {currentIndex === 0 && post.city && (
                <View style={homeStyles.cityOverlay}>
                    <Text style={homeStyles.cityFont}>{post.city.name}</Text>
                    <View style={homeStyles.pinIcon}>
                    <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={22}
                        color="#fff"
                    />
                    <Text style={homeStyles.countryFont}>
                        {post.city.country}
                    </Text>
                    </View>
                </View>
                )}

                {/* Rating */}
                {post.ratingValue !== undefined && (
                <View style={homeStyles.ratingOverlay}>
                    <View style={homeStyles.ratingTag}>
                    <Text style={homeStyles.ratingFont}>
                        {post.ratingValue.toFixed(1)}
                    </Text>
                    <MaterialCommunityIcons
                        name="star-face"
                        size={20}
                        color="#000"
                    />
                    </View>
                </View>
                )}
            </View>

            {/* Uploader, review, date */}
            <View style={homeStyles.contentContainer}>
                <View>
                <Text style={homeStyles.uploader}>@{post.uploader}</Text> 
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setExpandedReview(!expandedReview)}
                >
                    <Text
                    style={homeStyles.reviewFont}
                    numberOfLines={expandedReview ? undefined : 2}
                    ellipsizeMode="tail"
                    >
                    {post.review}
                    </Text>
                </TouchableOpacity>
                <Text style={homeStyles.date}>
                    {new Date(post.timestamp).toLocaleDateString()}
                </Text>
                </View>

                <View style={homeStyles.postIcons}>
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={28} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="bookmark-outline" size={28} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="people-circle-outline" size={29} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default React.memo(PostCard);