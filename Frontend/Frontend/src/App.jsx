import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  Outlet,
  useOutletContext,
} from "react-router-dom";

import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  MapPin,
  CircleAlert,
  Search,
  BookOpen,
  Bus,
  Bell,
  LogOut,
  ArrowUpRight,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

import api from "./ApiClient/api";

import Dashboard from "./Pages/Dashboard";
import Announcements from "./Pages/Announcements";
import Events from "./Pages/Events";
import CampusLocations from "./Pages/CampusLocations";
import ReportIssue from "./Pages/ReportIssue";
import LostFound from "./Pages/LostFound";
import StudyResources from "./Pages/StudyResource";
import Transport from "./Pages/Transport";
import Notifications from "./Pages/Notifications";
import Signup from "./Pages/Signup";
import Signin from "./Pages/Signin";
import ProtectedRoute from "./Pages/ProtectedRoute";
import AddUser from "./Pages/AddUser";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Announcements", path: "/announcements", icon: Megaphone },
  { name: "Events", path: "/events", icon: CalendarDays },
  { name: "Campus Locations", path: "/locations", icon: MapPin },
  { name: "Report an Issue", path: "/issues", icon: CircleAlert },
  { name: "Lost & Found", path: "/lost-found", icon: Search },
  { name: "Study Resources", path: "/resources", icon: BookOpen },
  { name: "Transport", path: "/transport", icon: Bus },
  { name: "Notifications", path: "/notifications", icon: Bell },
];

const adminNavigation = {
  name: "Manage Users",
  path: "/manage-users",
  icon: UserPlus,
};

function AdminOnly() {
  const { currentUser, userLoading } = useOutletContext();

  if (userLoading) {
    return (
      <div className="page-content">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (currentUser.role !== "Admin") {
    return (
      <div className="page-content">
        <section className="support-panel">
          <div className="support-icon">
            <ShieldCheck size={30} />
          </div>

          <span className="section-kicker">
            RESTRICTED ACCESS
          </span>

          <h2>Access Denied</h2>

          <p>
            You are not authorized to access User Management.
            Only administrators can manage campus accounts.
          </p>

          <Link to="/" className="hero-button">
            Back to Dashboard
          </Link>
        </section>
      </div>
    );
  }

  return <AddUser />;
}

function AppLayout() {
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/api/auth/get-user");

        const data = response.data;

        setCurrentUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data._id,
            userName: data.userName,
            email: data.email,
            role: data.role,
          })
        );
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null);
        localStorage.removeItem("user");
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await api.post("/api/auth/logout");

      setCurrentUser(null);
      localStorage.removeItem("user");

      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("Unable to logout. Please try again.");
    }
  };

  const sidebarNavigation = [
    ...navigation,
    ...(currentUser?.role === "Admin"
      ? [adminNavigation]
      : []),
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-icon">SC</div>

          <div>
            <h2>StudentConnect</h2>
            <p>Smart Campus Platform</p>
          </div>
        </Link>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">
          {sidebarNavigation.map((item) => {
            const Icon = item.icon;

            const active =
              location.pathname === item.path ||
              (item.path !== "/" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">
              {currentUser?.userName
                ? currentUser.userName.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="profile-info">
              <strong>
                {currentUser?.userName || "Loading user..."}
              </strong>

              <span>
                {currentUser?.role || "Campus Portal"}
              </span>
            </div>

            <ArrowUpRight size={17} />
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={18} />

            <span>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet context={{ currentUser, userLoading }} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/announcements"
            element={<Announcements />}
          />

          <Route path="/events" element={<Events />} />

          <Route
            path="/locations"
            element={<CampusLocations />}
          />

          <Route path="/issues" element={<ReportIssue />} />

          <Route
            path="/lost-found"
            element={<LostFound />}
          />

          <Route
            path="/resources"
            element={<StudyResources />}
          />

          <Route path="/transport" element={<Transport />} />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/manage-users"
            element={<AdminOnly />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
