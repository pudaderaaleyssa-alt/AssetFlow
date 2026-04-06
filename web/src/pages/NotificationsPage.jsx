import { BellRing, Info, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage({ announcements }) {
  if (announcements.length === 0) {
    return (
      <Card className="rounded-[1.5rem] border-white/55 bg-white/60 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="flex min-h-[18rem] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-slate-100 text-slate-400">
            <Info className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No announcements yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Admin broadcasts, reminders, and operational updates will appear here once they are sent.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.68fr_1.32fr]">
      <Card className="rounded-[1.5rem] border border-slate-900/85 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(30,41,59,0.92),rgba(37,99,235,0.78))] py-0 text-white shadow-[0_22px_50px_rgba(15,23,42,0.18)]">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <Badge className="border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
            <Sparkles className="mr-1 h-3 w-3" />
            Broadcast Center
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {announcements.length} recent update{announcements.length === 1 ? "" : "s"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Keep your team aligned with the latest messages, maintenance notes, and announcements.
          </p>

          <div className="mt-4 space-y-2.5">
            {announcements.slice(0, 3).map((announcement, index) => (
              <div key={announcement.id} className="rounded-[1.1rem] border border-white/10 bg-white/7 px-3.5 py-3.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Update {index + 1}</p>
                <p className="mt-1.5 max-h-[4rem] overflow-hidden text-sm leading-5 text-white/86">{announcement.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-white/55 bg-white/62 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="p-3 sm:p-4">
          <ScrollArea className="h-[58vh] min-h-[22rem] pr-1 sm:pr-3">
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.86))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-blue-50 text-blue-700">
                        <BellRing className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Admin Broadcast</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Team-wide notification</p>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {announcement.createdAt?.toDate
                        ? announcement.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {announcement.content}
                  </p>
                </article>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
