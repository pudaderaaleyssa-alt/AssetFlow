import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, Box, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#dbeafe] px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(219,234,254,0.74)_38%,_rgba(191,219,254,0.82)_68%,_rgba(224,231,255,0.92)_100%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/45 to-transparent" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/45 bg-white/18 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden h-[680px] overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,23,42,0.9),rgba(37,99,235,0.72)_55%,rgba(191,219,254,0.3))]" />
          <div className="absolute inset-x-10 top-10 h-px bg-white/20" />

          <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-white/20 backdrop-blur">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">AssetFlow</p>
              <p className="text-sm font-medium text-white/90">Monitoring Suite</p>
            </div>
          </div>

          <div className="absolute right-10 top-10 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Tracking
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 text-left xl:p-14">
            <div className="max-w-xl pt-24">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.34em] text-cyan-100/70">
                Secure Asset Operations
              </p>
              <h1 className="max-w-lg text-5xl font-semibold leading-tight text-white xl:text-6xl">
                Bring clarity to inventory, alerts, and every movement.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-blue-50/78">
                A calmer interface for your team, with live monitoring and cleaner decisions from one place.
              </p>
            </div>

            <div className="relative mx-auto mt-12 flex h-[360px] w-full max-w-xl items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="absolute h-[19rem] w-[19rem] rounded-[3rem] border border-white/20 bg-white/8 shadow-[0_30px_80px_rgba(10,20,60,0.28)] backdrop-blur-md" />
              <div className="absolute h-[15rem] w-[15rem] rounded-[2.5rem] border border-cyan-100/40 bg-[linear-gradient(180deg,rgba(191,219,254,0.35),rgba(30,41,59,0.32))] shadow-[0_0_45px_rgba(186,230,253,0.32)]" />
              <div className="absolute flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/20 bg-slate-950/50 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
                <ShieldCheck className="h-12 w-12 text-cyan-200" />
              </div>
              <div className="absolute left-8 top-10 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/85 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Visibility</p>
                <p className="mt-1 text-lg font-semibold">24/7 tracking</p>
              </div>
              <div className="absolute bottom-8 right-8 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/85 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Security</p>
                <p className="mt-1 text-lg font-semibold">Role-based access</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white/34 p-4 backdrop-blur-xl sm:p-8 lg:bg-white/26 lg:p-10">
          <Card className="w-full max-w-md rounded-[2rem] border border-white/65 bg-white/72 py-0 text-left shadow-[0_24px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/55 backdrop-blur-xl">
            <CardHeader className="px-7 pb-0 pt-8 sm:px-8 sm:pt-9">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                {isLogin ? "Welcome Back" : "Create Account"}
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                {isLogin ? "Sign in to AssetFlow" : "Set up your workspace"}
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? "Continue to your monitoring dashboard with a cleaner, calmer workspace."
                  : "Create your account to start managing assets, alerts, and activity in one place."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pb-7 pt-7 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-[52px] rounded-2xl border-white/70 bg-white/82 pl-11 pr-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-[52px] rounded-2xl border-white/70 bg-white/82 pl-11 pr-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-100"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-[52px] w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8_58%,#38bdf8)] text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.32)] hover:brightness-110"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/65 px-4 py-3 text-sm text-slate-500">
                <span>{isLogin ? "New to AssetFlow?" : "Already have an account?"}</span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-blue-700 transition-colors hover:text-blue-500"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
