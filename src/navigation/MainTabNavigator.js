import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import FleetScreen from '../screens/FleetScreen';
import IssuesScreen from '../screens/IssuesScreen';
import OrganizationScreen from '../screens/OrganizationScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Fleet: 'bus-outline',
  Issues: 'alert-circle-outline',
  Schedule: 'calendar-outline',
  Workspace: 'business-outline',
};

export default function MainTabNavigator() {
  const { isManager } = useAppData();

  return (
    <Tab.Navigator
      initialRouteName={isManager ? 'Fleet' : 'Issues'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Fleet" component={FleetScreen} />
      {!isManager ? <Tab.Screen name="Issues" component={IssuesScreen} /> : null}
      {!isManager ? <Tab.Screen name="Schedule" component={ScheduleScreen} /> : null}
      <Tab.Screen
        name="Workspace"
        component={OrganizationScreen}
        options={{
          title: isManager ? 'Company' : 'Workshop',
          tabBarLabel: isManager ? 'Company' : 'Workshop',
        }}
      />
    </Tab.Navigator>
  );
}
