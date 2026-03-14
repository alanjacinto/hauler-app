import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import MainTabNavigator from './MainTabNavigator';
import SessionSelectionScreen from '../screens/SessionSelectionScreen';
import TruckDetailScreen from '../screens/TruckDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAppData();

  return (
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
      {!isAuthenticated ? (
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
  );
}
