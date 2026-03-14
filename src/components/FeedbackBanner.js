import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';

export default function FeedbackBanner() {
  const { dismissFeedback, feedback } = useAppData();

  if (!feedback) {
    return null;
  }

  const toneStyles = {
    success: {
      backgroundColor: colors.successMuted,
      borderColor: colors.success,
      textColor: colors.text,
    },
    info: {
      backgroundColor: colors.primaryMuted,
      borderColor: colors.primary,
      textColor: colors.text,
    },
  };

  const currentTone = toneStyles[feedback.tone] || toneStyles.success;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: currentTone.backgroundColor,
            borderColor: currentTone.borderColor,
          },
        ]}
      >
        <Text style={[styles.message, { color: currentTone.textColor }]}>{feedback.message}</Text>

        <Pressable style={styles.dismissButton} onPress={dismissFeedback}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dismissText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
