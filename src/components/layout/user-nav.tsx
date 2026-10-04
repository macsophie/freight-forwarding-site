"use client";

import Link from "next/link";
import { User, Settings, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/database";
import { signOutAction } from "@/domain/auth/actions";

export function UserNav({
  name = "John Doe",
  email = "john@example.com",
  role = "CUSTOMER_ADMIN",
  companyName = "Apex Global Imports",
}: {
  name?: string;
  email?: string;
  role?: UserRole;
  companyName?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isStaff = [
    "SUPER_ADMIN",
    "OPERATIONS_MANAGER",
    "OPERATIONS_AGENT",
    "FINANCE",
    "SUPPORT",
  ].includes(role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer">
          <Avatar initials={initials} />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {companyName}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="right" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold text-white leading-none">{name}</p>
            <p className="text-[10px] text-slate-400 leading-none">{email}</p>
            <div className="pt-1">
              <Badge variant={isStaff ? "info" : "default"} className="text-[9px] py-0 px-1.5 font-bold">
                {role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isStaff ? (
          <>
            <Link href="/admin/dashboard">
              <DropdownMenuItem>
                <Shield className="h-3.5 w-3.5 mr-2 text-sky-400" />
                Staff Operations
              </DropdownMenuItem>
            </Link>
            <Link href="/portal/dashboard">
              <DropdownMenuItem>
                <User className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                Customer View
              </DropdownMenuItem>
            </Link>
          </>
        ) : (
          <Link href="/portal/settings">
            <DropdownMenuItem>
              <Settings className="h-3.5 w-3.5 mr-2 text-slate-400" />
              Account Settings
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />

        <form action={signOutAction} className="w-full">
          <DropdownMenuItem type="submit" destructive>
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
