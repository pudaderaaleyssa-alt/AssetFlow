import { Bell, Box, ChevronRight, FileUp, List, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage({ announcements, assets, role, setActiveTab, user }) {
  const activeAssets = assets.filter((asset) => asset.status.toLowerCase() === "active").length;
  const flaggedAssets = assets.filter((asset) => ["repair", "storage", "inactive", "unknown"].includes(asset.status.toLowerCase())).length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.price, 0);
  const latestAnnouncement = announcements[0];

  const quickActions = [
    {
      title: "Review Inventory",
      description: "Browse imported items, status, and category-level details.",
      icon: <List className="h-5 w-5" />,
      action: () => setActiveTab("inventory"),
    },
    {
      title: "Check Updates",
      description: "Stay aligned on new broadcasts, reminders, and operations notes.",
      icon: <Bell className="h-5 w-5" />,
      action: () => setActiveTab("notifications"),
    },
    {
      title: "Bulk Import",
      description: "Upload the latest CSV or spreadsheet for fresh asset visibility.",
      icon: <FileUp className="h-5 w-5" />,
      action: () => setActiveTab("import"),
      hidden: !(role === "admin" || role === "worker"),
    },
    {
      title: "Admin Broadcast",
      description: "Send team-wide guidance and operational announcements.",
      icon: <ShieldCheck className="h-5 w-5" />,
      action: () => setActiveTab("admin"),
      hidden: role !== "admin",
    },
  ].filter((item) => !item.hidden);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.5rem] border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(239,246,255,0.9),rgba(224,231,255,0.72))] py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <Badge className="border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] text-blue-700">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Daily Focus
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                  Welcome back, {user?.email?.split("@")[0] || "team"}.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  AssetFlow is keeping your inventory, updates, and imports in one calmer control surface.
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-white/55 bg-white/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Latest Update</p>
                <p className="mt-2 max-w-xs text-sm leading-5 text-slate-700">
                  {latestAnnouncement?.content || "No broadcasts yet. Your team updates will appear here."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border border-slate-900/85 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(30,41,59,0.94),rgba(37,99,235,0.75))] py-0 text-white shadow-[0_22px_50px_rgba(15,23,42,0.18)]">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white/10 ring-1 ring-white/10">
                <Box className="h-4 w-4 text-cyan-200" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Inventory Health</p>
                <h3 className="mt-1 text-lg font-semibold text-white">At-a-glance readiness</h3>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <MetricBlock label="Tracked" value={assets.length} />
              <MetricBlock label="Active" value={activeAssets} />
              <MetricBlock label="Flagged" value={flaggedAssets} />
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/6 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Total Asset Value</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((item) => (
          <QuickActionCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={item.action}
          />
        ))}
      </section>
    </div>
  );
}

function QuickActionCard({ title, description, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left"
    >
      <Card className="group h-full rounded-[1.35rem] border-white/55 bg-white/62 py-0 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:bg-white/78 hover:shadow-[0_22px_44px_rgba(15,23,42,0.1)]">
        <CardContent className="flex h-full flex-col p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-500 text-white shadow-[0_10px_22px_rgba(37,99,235,0.18)]">
            {icon}
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
          <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-blue-700">
            Open section
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function MetricBlock({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-white">{String(value).padStart(2, "0")}</p>
    </div>
  );
}
