import Link from "next/link";
import { Ship, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 shadow-xl shadow-sky-950/40">
        <Ship className="h-8 w-8" />
      </div>
      <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400">
        404 — Cargo Not Found
      </span>
      <h1 className="text-3xl font-extrabold text-white mt-2">
        Off-Course Logistics Route
      </h1>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        The consignment, voyage record, or documentation file you requested does not exist or has been relocated to cold storage.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link href="/">
          <Button variant="glow" size="sm" className="gap-1.5 text-xs">
            <Home className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Button>
        </Link>
        <Link href="/portal/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-slate-800 text-slate-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
