import { Scale, Landmark, Gavel, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Navbar() {
  const [, setLocation] = useLocation();

  return (
    <nav className="w-full border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* LEFT — BRAND */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/15 text-primary">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide leading-tight">
              Case<span className="text-primary">Pulse</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Litigation Intelligence Platform
            </p>
          </div>
        </div>

        {/* CENTER — QUICK COURTS */}
        <div className="hidden md:flex items-center gap-2">

          {/* SUPREME COURT */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setLocation("/supreme-monitor")}
          >
            <Scale className="h-4 w-4" />
            Supreme Court Monitor
          </Button>

          {/* DELHI HC */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setLocation("/delhi-monitor")}
          >
            <Landmark className="h-4 w-4" />
            Delhi HC Monitor
          </Button>

          {/* ✅ ONLY CHANGE — label + route */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setLocation("/cerc-checker")}
          >
            <Gavel className="h-4 w-4" />
            CERC Cause List Checker
          </Button>

        </div>

        {/* RIGHT — ACTIONS */}
        <div className="flex items-center justify-between md:justify-end gap-3">

          <span className="hidden lg:inline text-xs text-muted-foreground border border-border rounded-md px-2 py-1">
            ⌘ / Ctrl + K to search
          </span>

          <Button variant="outline" size="sm" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

        </div>
      </div>
    </nav>
  );
}
