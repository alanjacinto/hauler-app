import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedbackBanner from '../components/FeedbackBanner';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import MainTabNavigator from './MainTabNavigator';
import SessionSelectionScreen from '../screens/SessionSelectionScreen';
import TruckDetailScreen from '../screens/TruckDetailScreen';

const Stack = createNativeStackNavigator();

function AppLoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <View style={styles.loadingCard}>
        <Text style={styles.loadingEyebrow}>Hauler Beta</Text>
        <Text style={styles.loadingTitle}>Restoring your workspace</Text>
        <Text style={styles.loadingCopy}>
          Hydrating fleets, workshop links, and the last selected session.
        </Text>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isHydrated } = useAppData();

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!isHydrated ? (
          <Stack.Screen
            name="AppLoading"
            component={AppLoadingScreen}
            options={{ headerShown: false }}
          />
        ) : !isAuthenticated ? (
          <Stack.Screen
            name="SessionSelection"
            component={SessionSelectionScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="TruckDetail"
              component={TruckDetailScreen}
              options={{ title: 'Truck detail' }}
            />
          </>
        )}
      </Stack.Navigator>
      <FeedbackBanner />
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 10,
  },
  loadingEyebrow: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  loadingCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
