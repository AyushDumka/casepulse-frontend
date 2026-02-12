import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, PlayCircle, RefreshCcw } from "lucide-react";

type DelhiStatusRow = {
  s_no?: string;
  case_number: string;
  status?: string | null;
  petitioner: string;
  respondent: string;
  advocates: string;
  listing_info: string;
  court: string;
  court_no?: string | null;
  order_link?: string | null;
  judgment_link?: string | null;
};

export default function DelhiMonitor() {
  const [keyword, setKeyword] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DelhiStatusRow[]>([]);
  const [error, setError] = useState("");

  const handleMonitor = () => {
    if (!keyword.trim()) {
      alert("Please enter a party name");
      return;
    }

    if (!year.trim()) {
      alert("Please enter a case year");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    fetch("http://127.0.0.1:8000/api/delhi/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: keyword.trim(),
        year: year.trim(),
        mode: "party",
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("API failed");
        return r.json();
      })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
      })
      .catch(() =>
        setError("Backend error while fetching Delhi case status")
      )
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setKeyword("");
    setYear("");
    setResults([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Landmark className="h-8 w-8 text-primary" />
              Delhi High Court Case Status
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Search and view live case-status details from the Delhi High Court
              by party name and year.
            </p>
          </div>

        </div>

        {/* INPUT CARD */}
        <Card className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">
                Party Name
              </label>
              <Input
                placeholder="e.g. XYZ Ltd"
                className="h-12 text-lg"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">
                Case Year
              </label>
              <Input
                placeholder="e.g. 2023"
                className="h-12 text-lg"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={handleMonitor}
                disabled={loading}
                className="h-12 text-lg gap-2 flex-1"
              >
                <PlayCircle className="h-5 w-5" />
                {loading ? "Searching…" : "Search Case Status"}
              </Button>

              <Button
                variant="outline"
                onClick={handleClear}
                disabled={loading}
                className="h-12 text-lg gap-2"
              >
                <RefreshCcw className="h-5 w-5" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ERROR */}
        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* LOADING */}
        {loading && (
          <p className="text-muted-foreground">
            Fetching Delhi High Court case status…
          </p>
        )}

        {/* RESULTS TABLE */}
        {!loading && results.length > 0 && (
          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="min-w-full text-sm text-left text-slate-200">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3">S.No.</th>
                  <th className="px-4 py-3">Case Info</th>
                  <th className="px-4 py-3">Petitioner vs Respondent</th>
                  <th className="px-4 py-3">Advocate</th>
                  <th className="px-4 py-3">Listing Info</th>
                  <th className="px-4 py-3">Court No</th>
                  <th className="px-4 py-3">Order Link</th>
                  <th className="px-4 py-3">Judgment Link</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {results.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold">
                      {item.s_no || idx + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold break-all">
                        {item.case_number}
                      </div>
                      {item.status && (
                        <div className="text-red-400 text-xs mt-1">
                          [{item.status}]
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-pre-line">
                      {item.petitioner}
                      <br />
                      <strong>VS.</strong> {item.respondent}
                    </td>

                    <td className="px-4 py-3">
                      {item.advocates || "N/A"}
                    </td>

                    <td className="px-4 py-3 whitespace-pre-line">
                      {item.listing_info || "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      {item.court_no || "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      {item.order_link ? (
                        <a
                          href={item.order_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Order(s)
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {item.judgment_link ? (
                        <a
                          href={item.judgment_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Judgment
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && results.length === 0 && !error && (
          <p className="text-muted-foreground">
            No case status found. Enter a party name and year, then search.
          </p>
        )}
      </main>
    </div>
  );
}
