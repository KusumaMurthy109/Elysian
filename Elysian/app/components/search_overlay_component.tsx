import React from "react";
import { View, TouchableOpacity, Pressable, Keyboard } from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { styles } from "../styles/app_styles.styles";

type Props = {
  searchOpen: boolean;
  setSearchOpen: (val: boolean) => void;

  value: string;
  onChange: (text: string) => void;

  placeholder?: string;
  children?: React.ReactNode;

  onClose?: () => void;

  dismissOnBackdropPress?: boolean;
};

const SearchOverlay = ({
  searchOpen,
  setSearchOpen,
  value,
  onChange,
  placeholder = "Search...",
  children,
  onClose,
  dismissOnBackdropPress = true,
}: Props) => {
  const handleToggle = () => {
    if (searchOpen) {
      setSearchOpen(false);
      onClose?.();
      Keyboard.dismiss();
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <>
      {/* Search Icon */}
      <View style={styles.searchOverlay}>
        <TouchableOpacity style={styles.topRightIcon} onPress={handleToggle}>
          <GlassView style={styles.glassButton}>
            <Ionicons name="search" size={26} color="#000" />
          </GlassView>
        </TouchableOpacity>

        {/* Expanded Search Bar */}
        {searchOpen && (
          <GlassView style={styles.searchBarExpanded}>
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#807f7fff"
              value={value}
              onChangeText={onChange}
              style={styles.searchInput}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              autoFocus
              selectionColor="#000"
            />
          </GlassView>
        )}
      </View>

      {/* Backdrop */}
      {searchOpen && dismissOnBackdropPress && (
        <Pressable
          style={styles.searchBackdrop}
          onPress={() => {
            setSearchOpen(false);
            onClose?.();
            Keyboard.dismiss();
          }}
        />
      )}

      {/* Dropdown */}
      {searchOpen && children}
    </>
  );
};

export default SearchOverlay;