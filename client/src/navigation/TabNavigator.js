import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useAuth } from "../context/AuthContext";

// Home
import HomeScreen from "../screens/main/HomeScreen";

// Announcements
import AnnouncementsScreen from "../screens/announcements/AnnouncementsScreen";
import AnnouncementDetailScreen from "../screens/announcements/AnnouncementDetailScreen";
import CreateAnnouncementScreen from "../screens/announcements/CreateAnnouncementScreen";
import EditAnnouncementScreen from "../screens/announcements/EditAnnouncementScreen";

// Resources
import ResourcesScreen from "../screens/resources/ResourcesScreen";
import ResourceDetailScreen from "../screens/resources/ResourceDetailScreen";
import PendingResourcesScreen from "../screens/resources/PendingResourcesScreen";
import CreateResourceScreen from "../screens/resources/CreateResourceScreen";
import EditResourceScreen from "../screens/resources/EditResourceScreen";

// Lost & Found
import LostFoundScreen from "../screens/lostfound/LostFoundScreen";
import LostFoundDetailScreen from "../screens/lostfound/LostFoundDetailScreen";
import CreateLostFoundScreen from "../screens/lostfound/CreateLostFoundScreen";
import EditLostFoundScreen from "../screens/lostfound/EditLostFoundScreen";

// Profile
import ProfileScreen from "../screens/profile/ProfileScreen";

// Events
import EventsScreen from "../screens/events/EventsScreen";
import EventDetailScreen from "../screens/events/EventDetailScreen";
import CreateEventScreen from "../screens/events/CreateEventScreen";
import EditEventScreen from "../screens/events/EditEventScreen";

// Portfolio
import PortfolioScreen from "../screens/portfolio/PortfolioScreen";
import PortfolioItemDetailScreen from "../screens/portfolio/PortfolioItemDetailScreen";
import CreatePortfolioItemScreen from "../screens/portfolio/CreatePortfolioItemScreen";
import EditPortfolioItemScreen from "../screens/portfolio/EditPortfolioItemScreen";
import EditPortfolioScreen from "../screens/portfolio/EditPortfolioScreen";
import ViewUserPortfolioScreen from "../screens/portfolio/ViewUserPortfolioScreen";

// Admin
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Home Stack ──────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}

// ─── Announcements Stack ─────────────────────────────────
function AnnouncementsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnnouncementsList" component={AnnouncementsScreen} />
      <Stack.Screen
        name="AnnouncementDetail"
        component={AnnouncementDetailScreen}
      />
      <Stack.Screen
        name="CreateAnnouncement"
        component={CreateAnnouncementScreen}
      />
      <Stack.Screen
        name="EditAnnouncement"
        component={EditAnnouncementScreen}
      />
    </Stack.Navigator>
  );
}

// ─── Resources Stack ─────────────────────────────────────
function ResourcesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResourcesList" component={ResourcesScreen} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
      <Stack.Screen
        name="PendingResources"
        component={PendingResourcesScreen}
      />{" "}
      <Stack.Screen name="CreateResource" component={CreateResourceScreen} />
      <Stack.Screen name="EditResource" component={EditResourceScreen} />{" "}
    </Stack.Navigator>
  );
}

// ─── Lost & Found Stack ───────────────────────────────────
function LostFoundStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LostFoundList" component={LostFoundScreen} />
      <Stack.Screen name="LostFoundDetail" component={LostFoundDetailScreen} />
      <Stack.Screen name="CreateLostFound" component={CreateLostFoundScreen} />
      <Stack.Screen name="EditLostFound" component={EditLostFoundScreen} />
    </Stack.Navigator>
  );
}

// ─── Profile Stack ───────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// ─── Events Stack ────────────────────────────────────────
function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
    </Stack.Navigator>
  );
}

// ─── Portfolio Stack ─────────────────────────────────────
function PortfolioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PortfolioMain" component={PortfolioScreen} />
      <Stack.Screen
        name="PortfolioItemDetail"
        component={PortfolioItemDetailScreen}
      />
      <Stack.Screen
        name="CreatePortfolioItem"
        component={CreatePortfolioItemScreen}
      />
      <Stack.Screen
        name="EditPortfolioItem"
        component={EditPortfolioItemScreen}
      />
      <Stack.Screen name="EditPortfolio" component={EditPortfolioScreen} />
      <Stack.Screen
        name="ViewUserPortfolio"
        component={ViewUserPortfolioScreen}
      />
    </Stack.Navigator>
  );
}

// ─── Admin Stack ────────────────────────────────────────
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  );
}

// ─── Tab Navigator ───────────────────────────────────────
export default function TabNavigator() {
  const { user } = useAuth();
  const isAdmin = user?.role?.includes("ADMIN");
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
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabel: ({ color }) => (
          <Text style={{ fontSize: 10, color }}>{route.name}</Text>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📢</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="LostFound"
        component={LostFoundStack}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, color }}>Lost & Found</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🎉</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💼</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20, color }}>⚙️</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
