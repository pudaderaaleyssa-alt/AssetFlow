import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AlertCircle, Megaphone, Send, ShieldCheck } from "lucide-react";
import { auth, db } from "../firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  const [announcement, setAnnouncement] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await addDoc(collection(db, "announcements"), {
        content: announcement,
        senderEmail: auth.currentUser.email,
        senderUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        target: "all",
      });

      setStatus({ type: "success", msg: "Announcement saved and ready for notification processing." });
      setAnnouncement("");
    } catch (error) {
      console.error("Error sending announcement:", error);
      setStatus({ type: "error", msg: "Failed to save announcement. Check your Firestore permissions." });
    } finally {
      setLoading(false);
    }
  };

  const statusTone =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <Card className="rounded-[1.5rem] border border-slate-900/85 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(30,41,59,0.92),rgba(37,99,235,0.78))] py-0 text-white shadow-[0_22px_50px_rgba(15,23,42,0.18)]">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/10 ring-1 ring-white/10">
            <Megaphone className="h-5 w-5 text-cyan-100" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Team announcement center</h2>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Broadcast clear operational guidance to workers and viewers from one focused control panel.
          </p>

          <div className="mt-4 space-y-2.5">
            <InfoCard
              icon={<ShieldCheck className="h-[18px] w-[18px]" />}
              title="Trusted source"
              text="Messages are stored with sender identity so your team knows who issued the update."
            />
            <InfoCard
              icon={<Send className="h-[18px] w-[18px]" />}
              title="Faster alignment"
              text="Use this panel for maintenance windows, urgent alerts, and daily operational notes."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-white/55 bg-white/62 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <form onSubmit={handleSendAnnouncement} className="space-y-5">
            <div>
              <label className="mb-2.5 block text-sm font-medium text-slate-700">Announcement</label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Enter announcement details, for example: System maintenance starts at 5 PM."
                rows={7}
                disabled={loading}
                className="w-full resize-y rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {status.msg ? (
              <div className={`flex items-start gap-3 rounded-[1rem] border px-4 py-3 text-sm leading-5 ${statusTone}`}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{status.msg}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading || !announcement.trim()}
              className="h-11 w-full rounded-[1rem] bg-[linear-gradient(135deg,#0f172a,#1d4ed8_58%,#38bdf8)] text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] hover:brightness-110"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Send Broadcast"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3.5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] bg-white/10 text-cyan-100">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-5 text-white/68">{text}</p>
        </div>
      </div>
    </div>
  );
}
