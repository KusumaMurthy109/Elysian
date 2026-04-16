import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

// HAPTICS
export const triggerLightHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.log("Light haptic failed:", error);
  }
};

export const triggerMediumHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.log("Medium haptic failed:", error);
  }
};

export const triggerSuccessHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.log("Success haptic failed:", error);
  }
};

export const triggerSelectionHaptic = () => {
  Haptics.selectionAsync();
};

export const triggerErrorHaptic = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.log("Error haptic failed:", error);
  }
};

// SOUND
export const playAppSound = async (soundFile: any) => {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(soundFile);
    currentSound = sound;

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch (error) {
    console.log("Sound playback failed:", error);
  }
};
