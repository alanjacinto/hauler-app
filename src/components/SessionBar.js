import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';

export default function SessionBar() {
  const {
    currentCompany,
    currentRole,
    currentUser,
    currentWorkshop,
    isManager,
    logout,
    resetDemoData,
  } = useAppData();

  if (!currentUser) {
    return null;
  }

  const confirmReset = () => {
    Alert.alert(
      'Reset demo data?',
      'This clears saved progress on this device and returns Hauler to the seeded beta state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDemoData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.meta}>
          {currentRole}
          {' • '}
          {isManager
            ? currentCompany?.name || 'Company account'
            : currentWorkshop?.name || 'Workshop account'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={confirmReset}>
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Switch</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  button: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
