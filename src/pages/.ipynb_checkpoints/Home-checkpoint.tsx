import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Scale,
  Landmark,
  Gavel,
  Globe,
  Search,
  Calendar as CalendarIcon,
  Building2,
} from "lucide-react";

type CourtType = "supreme" | "delhi" | "bombay" | "nclat" | "all";

export default function Home() {
  const [, setLocation] = useLocation();

  const [partyName, setPartyName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [court, setCourt] = useState<CourtType>("supreme");
  const [loading, setLoading] = useState(false);

  // ✅ SAME LOGIC — only NCLAT line added
  const formatDateForCourt = (date: Date, court: CourtType) => {
    switch (court) {
      case "delhi":
        return format(date, "dd.MM.yyyy");

      case "bombay":
        return format(date, "dd-MM-yyyy");

      case "nclat": // ✅ added
        return format(date, "dd/MM/yyyy");

      case "all":
      case "supreme":
      default:
        return format(date, "yyyy-MM-dd");
    }
  };

  const handleSearch = () => {
    if (!partyName.trim()) {
      alert("Please enter party name or case number");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select a start and end date");
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    const formattedStart = formatDateForCourt(startDate, court);
    const formattedEnd = formatDateForCourt(endDate, court);

    setLoading(true);

    setLocation(
      `/results?partyName=${encodeURIComponent(
        partyName.trim()
      )}&startDate=${formattedStart}&endDate=${formattedEnd}&court=${court}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl space-y-12">

          {/* HERO */}
          <div className="text-center space-y-5">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Litigation Intelligence,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Track hearings and monitor cases across Supreme Court,
              Delhi High Court, and Bombay High Court.
            </p>
          </div>

          {/* SEARCH CARD */}
          <Card className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl">
            <CardContent className="p-8 space-y-8">

              {/* Party Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Party Name or Case No. (e.g. Union of India, APL/928/2022)"
                  className="pl-12 h-14 text-lg"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                />
              </div>

              {/* Start Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-14 gap-3 text-left">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    {startDate
                      ? format(startDate, "dd-MM-yyyy")
                      : "Select Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>

              {/* End Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-14 gap-3 text-left">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    {endDate
                      ? format(endDate, "dd-MM-yyyy")
                      : "Select End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => startDate ? d < startDate : false}
                  />
                </PopoverContent>
              </Popover>

              {/* COURTS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: "supreme", label: "Supreme Court", icon: Scale },
                  { key: "delhi", label: "Delhi High Court", icon: Landmark },
                  { key: "bombay", label: "Bombay High Court", icon: Gavel },
                  { key: "nclat", label: "NCLAT", icon: Building2 },
                  { key: "all", label: "All Courts", icon: Globe },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCourt(key as CourtType)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all ${
                      court === key
                        ? "bg-primary/10 border-primary text-primary shadow-lg"
                        : "bg-muted/40 hover:bg-muted border-border"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <Button
                className="w-full h-14 text-lg font-semibold tracking-wide"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Searching…" : "Search Cases"}
              </Button>

            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
