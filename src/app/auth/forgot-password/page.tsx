"use client";

import * as React from "react";
import Link from "next/link";
import { Ship, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/domain/auth/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await requestPasswordResetAction({ email });
      if (!result.success) {
        setError(result.error || "Failed to send reset link");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Ship className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight text-white">
              Reset Password
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your registered corporate email to receive password reset instructions
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="space-y-4 text-center text-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Recovery Email Dispatched</p>
                <p className="text-slate-400 text-xs">
                  If an account exists for <strong className="text-slate-200">{email}</strong>, we have sent instructions to reset your password.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full text-xs">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
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
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          )}

          <CardFooter className="flex justify-center text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
