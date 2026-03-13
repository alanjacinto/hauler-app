import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import TruckDetailScreen from '../screens/TruckDetailScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
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
      <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="TruckDetail"
        component={TruckDetailScreen}
        options={{ title: 'Truck detail' }}
      />
    </Stack.Navigator>
  );
}
