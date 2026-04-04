import { useEffect, useState } from "react";
import { auth, db, messaging } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { LayoutDashboard, FileUp, List, ShieldCheck, LogOut, Bell } from "lucide-react"; // Added Bell

// Components
import Auth from "./components/Auth";
import AssetList from "./components/AssetList";
import FileUpload from "./components/FileUpload";
import AdminTools from "./components/AdminTools";

const VAPID_KEY = "BNWQAD59tgRERsCJOcz9YXmc9ecOIh0DZjitsTB8N8VX5p-kGmkODxrRJUVbwfxgkp9QXCcUBxZlGDHcrcRGklc";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- New States for Notification History ---
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- 1. Notification Setup ---
  const setupNotifications = async (currentUser) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration 
        });

        if (currentToken) {
          const userRef = doc(db, "users", currentUser.uid);
          await setDoc(userRef, { fcmToken: currentToken }, { merge: true });
        }
      }
    } catch (err) {
      console.error("❌ Notification Setup Error:", err);
    }
  };

  // --- 2. Real-time Listeners (Auth, Role, Announcements) ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // Listen for Role
        const unsubscribeRole = onSnapshot(userRef, (docSnap) => {
          setRole(docSnap.exists() ? docSnap.data().role : "viewer");
          setIsAuthChecking(false);
        });

        // --- NEW: Listen for latest 10 Announcements ---
        const annRef = collection(db, "announcements");
        const q = query(annRef, orderBy("createdAt", "desc"), limit(10));
        
        const unsubscribeAnnouncements = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Only increment unread count if user isn't currently looking at notifications
          setAnnouncements((prev) => {
            if (prev.length > 0 && activeTab !== "notifications") {
              setUnreadCount(c => c + 1);
            }
            return docs;
          });
        });

        setupNotifications(currentUser);

        // Foreground messaging
        const unsubscribeMsg = onMessage(messaging, (payload) => {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
          });
        });

        return () => {
          unsubscribeRole();
          unsubscribeAnnouncements();
          unsubscribeMsg();
        };
      } else {
        setRole(null);
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribeAuth();
  }, [activeTab]); // Listen for activeTab changes to handle unread reset

  // Reset unread count when clicking the tab
  useEffect(() => {
    if (activeTab === "notifications") setUnreadCount(0);
  }, [activeTab]);

  if (isAuthChecking) return <div style={centerStyle}><h2>Loading AssetFlow...</h2></div>;
  if (!user) return <Auth />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <nav style={sidebarStyle}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: "30px" }}>AssetFlow</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li onClick={() => setActiveTab("overview")} style={activeTab === "overview" ? activeNavItemStyle : navItemStyle}>
              <LayoutDashboard size={20} /> Overview
            </li>

            {/* --- NEW: Notification Sidebar Button --- */}
            <li onClick={() => setActiveTab("notifications")} style={activeTab === "notifications" ? activeNavItemStyle : navItemStyle}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
                <Bell size={20} /> Notifications
                {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
              </div>
            </li>

            {(role === "admin" || role === "worker") && (
              <li onClick={() => setActiveTab("import")} style={activeTab === "import" ? activeNavItemStyle : navItemStyle}>
                <FileUp size={20} /> Bulk Import
              </li>
            )}
            <li onClick={() => setActiveTab("inventory")} style={activeTab === "inventory" ? activeNavItemStyle : navItemStyle}>
              <List size={20} /> Asset List
            </li>
            {role === "admin" && (
              <li onClick={() => setActiveTab("admin")} style={activeTab === "admin" ? activeNavItemStyle : navItemStyle}>
                <ShieldCheck size={20} /> Admin Panel
              </li>
            )}
          </ul>
        </div>

        <div style={{ borderTop: "1px solid #334155", paddingTop: "20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>
            Role: <span style={{ fontWeight: "bold" }}>{role?.toUpperCase()}</span>
          </p>
          <button onClick={() => signOut(auth)} style={logoutBtnStyle}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", backgroundColor: "#f8fafc" }}>
        <section style={contentCardStyle}>
          
          {/* --- NEW: Notification UI --- */}
          {activeTab === "notifications" && (
            <div>
              <h2 style={{ marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Recent Announcements</h2>
              {announcements.length === 0 ? (
                <p style={{ color: "#64748b" }}>No announcements yet.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} style={notificationCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <strong style={{ color: "#1e293b" }}>Admin Broadcast</strong>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleString() : "Just now"}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#475569", lineHeight: "1.5" }}>{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div onClick={() => setActiveTab("inventory")} style={cardStyle}><h3>Inventory</h3><p>View Assets</p></div>
              <div onClick={() => setActiveTab("notifications")} style={cardStyle}><h3>Updates</h3><p>Check Announcements</p></div>
            </div>
          )}
          {activeTab === "import" && <FileUpload />}
          {activeTab === "inventory" && <AssetList />}
          {activeTab === "admin" && <AdminTools />}
        </section>
      </main>
    </div>
  );
}

// --- Added Styles ---
const sidebarStyle = { width: "260px", background: "#1e293b", color: "white", padding: "25px", display: "flex", flexDirection: "column" };
const navItemStyle = { display: "flex", alignItems: "center", gap: "10px", padding: "12px", cursor: "pointer", borderRadius: "8px", marginBottom: "5px", color: "#cbd5e1" };
const activeNavItemStyle = { ...navItemStyle, background: "#334155", color: "white" };
const badgeStyle = { background: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", position: "absolute", top: "-5px", right: "-12px", fontWeight: "bold", border: "2px solid #1e293b" };
const notificationCardStyle = { padding: "15px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "15px" };
const logoutBtnStyle = { display: "flex", alignItems: "center", gap: "10px", background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "10px", cursor: "pointer", borderRadius: "8px", width: "100%", marginTop: "10px" };
const contentCardStyle = { background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", minHeight: "80vh" };
const cardStyle = { padding: "30px", border: "1px solid #e2e8f0", borderRadius: "12px", textAlign: "center", cursor: "pointer" };
const centerStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };

export default App;