import { useEffect, useState } from "react";
import { auth, db, messaging } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getToken } from "firebase/messaging";
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import {
  Bell,
  Box,
  FileUp,
  LayoutDashboard,
  List,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import OverviewPage from "./pages/OverviewPage";
import NotificationsPage from "./pages/NotificationsPage";
import InventoryPage from "./pages/InventoryPage";
import ImportPage from "./pages/ImportPage";
import AdminPage from "./pages/AdminPage";
import Auth from "./components/Auth";

const VAPID_KEY = "BNWQAD59tgRERsCJOcz9YXmc9ecOIh0DZjitsTB8N8VX5p-kGmkODxrRJUVbwfxgkp9QXCcUBxZlGDHcrcRGklc";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, roles: ["admin", "worker", "viewer"] },
  { id: "notifications", label: "Updates", icon: Bell, roles: ["admin", "worker", "viewer"] },
  { id: "import", label: "Import", icon: FileUp, roles: ["admin", "worker"] },
  { id: "inventory", label: "Assets", icon: List, roles: ["admin", "worker", "viewer"] },
  { id: "admin", label: "Admin", icon: ShieldCheck, roles: ["admin"] },
];

const PAGE_META = {
  overview: {
    title: "Operations Overview",
    description: "A calmer snapshot of inventory, activity, and what needs attention next.",
  },
  notifications: {
    title: "Notifications",
    description: "Recent broadcasts and operational updates for your team.",
  },
  import: {
    title: "Bulk Import",
    description: "Bring in CSV or spreadsheet data with a cleaner upload workflow.",
  },
  inventory: {
    title: "Asset Inventory",
    description: "Browse, review, and monitor imported assets across categories and statuses.",
  },
  admin: {
    title: "Admin Broadcasts",
    description: "Send clear operational updates to workers and viewers in real time.",
  },
};

function normalizeAsset(doc) {
  const data = doc.data();
  const name = data.Asset_Name || data.name || data.assetName || "Unnamed Asset";
  const category = data.Category || data.category || "Uncategorized";
  const status = String(data.Status || data.status || "Unknown").trim();
  const rawValue = data.Value ?? data.value ?? data.price ?? 0;
  const price = Number(rawValue) || 0;

  return {
    id: doc.id,
    name,
    category,
    status,
    price,
    purchaseDate: data.Purchase_Date || data.purchaseDate || null,
  };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [assets, setAssets] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const availableNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role || "viewer"));
  const currentMeta = PAGE_META[activeTab] || PAGE_META.overview;

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === "notifications") {
      setUnreadCount(0);
    }
  };

  const setupNotifications = async (currentUser) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          const userRef = doc(db, "users", currentUser.uid);
          await setDoc(userRef, { fcmToken: currentToken }, { merge: true });
        }
      }
    } catch (err) {
      console.error("Notification setup error:", err);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeRole = onSnapshot(userRef, (docSnap) => {
          setRole(docSnap.exists() ? docSnap.data().role : "viewer");
          setIsAuthChecking(false);
        });

        setupNotifications(currentUser);
        return () => unsubscribeRole();
      }

      setAnnouncements([]);
      setAssets([]);
      setUnreadCount(0);
      setRole(null);
      setIsAuthChecking(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const annRef = collection(db, "announcements");
    const q = query(annRef, orderBy("createdAt", "desc"), limit(10));

    const unsubscribeAnnouncements = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((announcement) => ({ id: announcement.id, ...announcement.data() }));
      setAnnouncements((prev) => {
        if (prev.length > 0 && activeTab !== "notifications" && docs.length > prev.length) {
          setUnreadCount((count) => count + (docs.length - prev.length));
        }
        return docs;
      });
    });

    return () => unsubscribeAnnouncements();
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;

    const assetsRef = collection(db, "assets");
    const q = query(assetsRef, where("userId", "==", user.uid));

    const unsubscribeAssets = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map(normalizeAsset));
    });

    return () => unsubscribeAssets();
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewPage
            announcements={announcements}
            assets={assets}
            role={role}
            setActiveTab={handleTabChange}
            user={user}
          />
        );
      case "notifications":
        return <NotificationsPage announcements={announcements} />;
      case "inventory":
        return <InventoryPage assets={assets} />;
      case "import":
        return <ImportPage />;
      case "admin":
        return <AdminPage />;
      default:
        return (
          <OverviewPage
            announcements={announcements}
            assets={assets}
            role={role}
            setActiveTab={handleTabChange}
            user={user}
          />
        );
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#ffffff,_#dbeafe_42%,_#c7d2fe_100%)] px-6 text-slate-700">
        <div className="rounded-[1.75rem] border border-white/60 bg-white/65 px-8 py-6 text-base font-medium shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          Loading AssetFlow...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ffffff,_#dbeafe_36%,_#c7d2fe_66%,_#e0e7ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute left-[-10%] top-[-5%] h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/35 bg-slate-950/82 px-3 py-3.5 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:px-4 sm:py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:flex-col lg:border-b-0 lg:border-r lg:border-white/10 lg:px-4 lg:py-5">
          <div className="flex items-center justify-between gap-3 lg:items-start">
            <div className="flex items-center gap-3">
      
              <div className="flex justify-center items-center">
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight !text-white">AssetFlow</h2>
              </div>  
              
            </div>
       
          </div>

       
          <div className="flex w-full flex-col items-center justify-center gap-2">
              <div className="grid gap-2 sm:flex">
               <HeaderChip  value={role || "viewer"} />
                </div>
              </div>

          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:mt-5">
            
            
            <div className="flex items-start justify-between gap-4">
  

              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/45">Signed In As</p>
                <p className="mt-2 max-w-[15rem] truncate text-xs font-small text-white/90">{user.email}</p>
              </div>
            
            </div>
            
          </div>

          <nav className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-2">
            {availableNavItems.map((item) => (
              <SidebarLink
                key={item.id}
                badge={item.id === "notifications" ? unreadCount : 0}
                icon={<item.icon className="h-[18px] w-[18px]" />}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
              />
            ))}
          </nav>

          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-cyan-300/12 to-indigo-300/10 p-4 text-white/90 lg:mt-auto">
            <div className="flex items-center gap-2 text-cyan-100/80">
              <Sparkles className="h-3.5 w-3.5" />
              <p className="text-xs uppercase tracking-[0.26em]">Operational Focus</p>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-white/78 sm:text-sm">
              Keep imports, asset visibility, and team updates in one calm workspace.
            </p>

            <Button
              variant="ghost"
              className="mt-4 h-10 w-full justify-center rounded-[1rem] border border-white/12 bg-white/6 text-sm text-white hover:bg-red-400/12 hover:text-red-100"
              onClick={() => signOut(auth)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 lg:h-screen lg:p-5 xl:p-6">
          <header className="rounded-[1.5rem] border border-white/45 bg-white/52 px-4 pb-4 pt-1 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:px-5 sm:py-4 lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
            {/* 2. Changed mt-2 to mt-0 */}
              <h1 className="mt-0 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                {currentMeta.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {currentMeta.description}
              </p>
              </div>

              
            </div>
          </header>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function HeaderChip({ label, value }) {
  return (
    <div className="rounded-[1.1rem] border border-white/50 bg-white/55 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold capitalize text-slate-900 sm:text-sm">{value}</p>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick, badge }) {
  return (
    <button
      className={cn(
        "group relative flex min-w-[8.25rem] items-center gap-2.5 rounded-[1rem] border px-3 py-2.5 text-left text-xs font-medium transition-all sm:text-sm lg:min-w-0",
        active
          ? "border-cyan-200/25 bg-white text-slate-950 shadow-[0_14px_30px_rgba(255,255,255,0.1)]"
          : "border-white/8 bg-white/6 text-white/74 hover:border-white/16 hover:bg-white/10 hover:text-white"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-[0.9rem] transition-colors",
          active ? "bg-slate-100 text-blue-700" : "bg-white/7 text-white/70 group-hover:bg-white/12"
        )}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <Badge className="border-none bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
          {badge}
        </Badge>
      )}
    </button>
  );
}
