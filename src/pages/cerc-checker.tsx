import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CercResult = {
  sno: string;
  petition_no: string;
  petitioner: string;
  subject: string;
  hearing_date_if_present?: string;
  source_pdf: string;
  page: number;
};

export default function CercChecker() {
  const [month, setMonth] = useState("");
  const [party, setParty] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CercResult[]>([]);
  const [error, setError] = useState("");

  const runSearch = async () => {
    if (!month || !party) {
      alert("Enter month and party");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const r = await fetch("http://127.0.0.1:8000/api/cerc/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          party
        }),
      });

      if (!r.ok) throw new Error("API failed");

      const data = await r.json();
      setResults(data.results || []);

    } catch (e) {
      setError("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <h1 className="text-3xl font-bold">
          CERC Cause List Checker
        </h1>

        <Card className="bg-slate-900/70 border border-slate-700/50">
          <CardContent className="p-8 space-y-6">

            <Input
              placeholder="Month (e.g. February)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            <Input
              placeholder="Petitioner name"
              value={party}
              onChange={(e) => setParty(e.target.value)}
            />

            <Button
              onClick={runSearch}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Running…" : "Run CERC Check"}
            </Button>

          </CardContent>
        </Card>

        {/* RESULTS */}

        {error && <p className="text-red-500">{error}</p>}

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-2">
                  <p><strong>S. No:</strong> {r.sno}</p>
                  <p><strong>Petition:</strong> {r.petition_no}</p>
                  <p><strong>Petitioner:</strong> {r.petitioner}</p>
                  <p><strong>Subject:</strong> {r.subject}</p>
                  <p><strong>Date:</strong> {r.hearing_date_if_present || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.source_pdf} — page {r.page}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
