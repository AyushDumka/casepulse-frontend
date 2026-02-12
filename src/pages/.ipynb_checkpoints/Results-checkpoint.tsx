import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/* ===================== TYPES ===================== */

type WithCase = {
  case_number: string;
  details: string;
};

type CaseResult = {
  case_number: string;
  petitioner: string;
  respondent: string;
  advocates: string;
  court: string;
  judge?: string;
  court_no?: string;
  date?: string;
  court_time?: string;
  remarks?: string;
  with_cases?: WithCase[];
};

/* ===================== COMPONENT ===================== */

export default function Results() {
  const [, setLocation] = useLocation();

  const [results, setResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===================== FETCH ===================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partyName = params.get("partyName");
    const date = params.get("date"); // single-date fallback
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const court = params.get("court");

    if (!partyName || !court) {
      setError("Missing search parameters");
      setLoading(false);
      return;
    }

    let endpoint = "http://127.0.0.1:8000/api/search";
    let payload: any = { partyName, court };

    // 🔥 RANGE MODE
    if (startDate && endDate) {
      endpoint = "http://127.0.0.1:8000/api/search-range";
      payload = { partyName, startDate, endDate, court };
    }
    // 🔁 SINGLE DATE MODE (BACKWARD COMPATIBLE)
    else if (date) {
      payload = { partyName, date, court };
    }
    else {
      setError("Missing date or date range");
      setLoading(false);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        console.log("🔎 API RESULTS:", data);
        setResults(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Backend error"))
      .finally(() => setLoading(false));
  }, []);

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold mt-6 mb-6">
          Search Results ({results.length})
        </h1>

        {loading && (
          <p className="text-muted-foreground">Loading…</p>
        )}

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-muted-foreground">
            No cases found for the selected criteria.
          </p>
        )}

        {/* 🔥 IMPORTANT: DO NOT WRAP IN FIXED HEIGHT CONTAINER */}
        <div className="flex flex-col gap-10">
          {results.map((item, idx) => (
            <Card
              key={`${item.court}-${item.case_number || "unknown"}-${idx}`}
              className="border border-slate-700/50 bg-slate-900/70 backdrop-blur"
            >
              <CardContent className="p-8 space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight break-all">
                    {item.case_number}
                  </h2>
                  <Badge className="w-fit text-sm px-3 py-1">
                    {item.court}
                  </Badge>
                </div>

                {/* PARTIES */}
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Petitioner:</span>{" "}
                    {item.petitioner}
                  </p>
                  <p>
                    <span className="font-medium">Respondent:</span>{" "}
                    {item.respondent}
                  </p>
                </div>

                {/* META */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p>
                    <strong>Advocates:</strong>{" "}
                    {item.advocates || "N/A"}
                  </p>
                  <p>
                    <strong>Judge:</strong>{" "}
                    {item.judge || "N/A"}
                  </p>
                  <p>
                    <strong>Court No:</strong>{" "}
                    {item.court_no || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {item.date || "N/A"}
                  </p>
                  <p>
                    <strong>Court Time:</strong>{" "}
                    {item.court_time || "N/A"}
                  </p>
                </div>

                {/* REMARKS */}
                {item.remarks && (
                  <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
                    <p className="font-semibold mb-1 text-yellow-300">
                      Remarks
                    </p>
                    <p className="leading-relaxed whitespace-pre-line break-words">
                      {item.remarks}
                    </p>
                  </div>
                )}

                {/* WITH / CONNECTED CASES */}
                {item.with_cases && item.with_cases.length > 0 && (
                  <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
                    <p className="font-semibold mb-2 text-blue-300">
                      Connected / With Cases
                    </p>
                    <ul className="space-y-1">
                      {item.with_cases.map((wc, i) => (
                        <li key={`${wc.case_number}-${i}`}>
                          <strong>{wc.case_number}</strong>{" "}
                          – {wc.details}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
