import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import AnnouncementsScreen      from "../screens/announcements/AnnouncementsScreen";
import AnnouncementDetailScreen from "../screens/announcements/AnnouncementDetailScreen";
import CreateAnnouncementScreen from "../screens/announcements/CreateAnnouncementScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack inside the Announcements tab so Detail screen stays in tab layout
function AnnouncementsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnnouncementsList"   component={AnnouncementsScreen} />
      <Stack.Screen name="AnnouncementDetail"  component={AnnouncementDetailScreen} />
      <Stack.Screen name="CreateAnnouncement"  component={CreateAnnouncementScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  const { isStaffOrAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   "#0ea5e9",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabel: ({ color }) => (
          <Text style={{ fontSize: 10, color }}>{route.name}</Text>
        ),
      })}
    >
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsStack}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📢</Text> }}
      />
    </Tab.Navigator>
  );
}
