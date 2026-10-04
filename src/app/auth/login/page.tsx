"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Ship, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { signInAction } from "@/domain/auth/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInAction(
        { email, password },
        redirectTo || undefined
      );

      if (!result.success) {
        setError(result.error || "Authentication failed");
        setLoading(false);
        return;
      }

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
            <Ship className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <CardTitle className="text-xl font-extrabold tracking-tight text-white">
          Sign In to ForwardFlow
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Access your global logistics dashboard, active shipments, and quotes
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" required>Corporate Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="h-4 w-4 text-slate-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-slate-400" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="glow"
              className="w-full text-xs font-semibold gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-3 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-cyan-400 hover:underline">
            Register your company
          </Link>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 w-full flex items-center justify-center gap-3">
          <Link href="/portal/dashboard" className="text-slate-400 hover:text-white">
            Demo Portal
          </Link>
          <span>•</span>
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">
            Staff Console
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <React.Suspense fallback={<div className="text-center text-slate-400 py-12">Loading login...</div>}>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
