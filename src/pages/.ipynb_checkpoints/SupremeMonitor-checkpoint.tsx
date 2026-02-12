import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export default function SupremeMonitor() {
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState("allwords");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<any>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [downloading, setDownloading] = useState(false);

  const [downloadedPdfs, setDownloadedPdfs] = useState<
    { file: string; url: string }[]
  >([]);

  const [expanded, setExpanded] = useState<number | null>(null);

  // ---------------- RUN MONITOR ----------------

  const runMonitor = async () => {
    if (!keyword.trim()) {
      alert("Enter party name or keyword");
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedCases([]);
    setDownloadedPdfs([]);

    const res = await fetch("http://127.0.0.1:8000/api/supreme/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, mode }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  // ---------------- LOAD SAVED FILES ----------------

  const loadSavedFiles = async () => {
    setLoadingSaved(true);

    const res = await fetch("http://127.0.0.1:8000/api/supreme/monitors");
    const data = await res.json();

    setSavedFiles(data.files || []);
    setLoadingSaved(false);
  };

  // ---------------- OPEN SAVED FILE ----------------

  const openSavedFile = async (filename: string) => {
    setLoadingSaved(true);

    const res = await fetch(
      `http://127.0.0.1:8000/api/supreme/monitors/${filename}`
    );
    const data = await res.json();

    setSelectedSaved(data);
    setLoadingSaved(false);
  };

  // ---------------- DELETE SAVED FILE ----------------

  const deleteSavedFile = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    await fetch(
      `http://127.0.0.1:8000/api/supreme/delete/${filename}`,
      { method: "DELETE" }
    );

    loadSavedFiles();
    setSelectedSaved(null);
  };

  // ---------------- DOWNLOAD + SHOW PDF LINKS ----------------

  const downloadSelected = async () => {
    if (!result || selectedCases.length === 0) {
      alert("Select at least one case to download");
      return;
    }

    setDownloading(true);
    const newLinks: { file: string; url: string }[] = [];

    for (const caseIndex of selectedCases) {
      const res = await fetch("http://127.0.0.1:8000/api/supreme/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: result.file,
          case_index: caseIndex,
        }),
      });

      const data = await res.json();

      if (data.status === "ok") {
        newLinks.push({ file: data.file, url: data.url });
      }
    }

    setDownloadedPdfs(newLinks);
    setDownloading(false);
  };

  // ---------------- TOGGLE CHECKBOX ----------------

  const toggleCase = (num: number) => {
    setSelectedCases((prev) =>
      prev.includes(num)
        ? prev.filter((x) => x !== num)
        : [...prev, num]
    );
  };

  // ---------------- FORMAT RESULT ----------------

  const parseResult = (text: string) => {
    const lines = text.split("\n");
    const title = lines[0] || "Judgment";
    const meta = lines.slice(1, 3).join(" ");
    const body = lines.slice(3).join("\n");

    return { title, meta, body };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Supreme Court – Judgment Monitor
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor, download & view judgments.
            </p>
          </div>

          <Button variant="outline" onClick={loadSavedFiles}>
            📂 Refresh Saved
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">

            {/* 🔥 COOL RUN MONITOR BOX */}
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-xl">
              <CardContent className="p-8 space-y-6">

                <h2 className="text-lg font-semibold tracking-wide">
                  🔍 Start Monitoring
                </h2>

                <Input
                  placeholder="Enter party name, company or keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-12 text-lg"
                />

                <div className="flex gap-3">
                  <Button
                    title="Search for the exact phrase in the same order"
                    variant={mode === "phrase" ? "default" : "outline"}
                    onClick={() => setMode("phrase")}
                  >
                    Phrase
                  </Button>

                  <Button
                    title="All entered words must be present in the judgment (Default mode)"
                    variant={mode === "allwords" ? "default" : "outline"}
                    onClick={() => setMode("allwords")}
                  >
                    All Words
                  </Button>

                  <Button
                    title="At least one of the entered words must appear in the judgment"
                    variant={mode === "anywords" ? "default" : "outline"}
                    onClick={() => setMode("anywords")}
                  >
                    Any Words
                  </Button>
                </div>


                <Button
                  onClick={runMonitor}
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold"
                >
                  {loading ? "Scanning Supreme Court…" : "🚀 Run Monitor"}
                </Button>

              </CardContent>
            </Card>

            {/* ✅ NO NEW UPDATE MESSAGE */}
            {result &&
              (
                result.message?.toLowerCase().includes("no new") ||
                result.status === "no_new" ||
                (Array.isArray(result.new_items) && result.new_items.length === 0)
              ) && (
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-sm text-emerald-400">
                  <span>✅</span>
                  <span>
                    {result.message || "No new judgments found. You are already up to date."}
                  </span>
                </div>
            )}


            {/* LIVE RESULTS – CLEAN CARDS */}
            {result && result.new_items?.length > 0 && (
              <Card className="flex-1 overflow-hidden bg-slate-900/70 border border-slate-700/50">
                <CardContent className="p-6 flex flex-col h-full">

                  <div className="flex justify-between mb-4">
                    <p className="font-semibold">📑 Live Results</p>
                    <Button
                      variant="outline"
                      disabled={downloading}
                      onClick={downloadSelected}
                    >
                      {downloading ? "Downloading…" : "📥 Download Selected"}
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">

                    {result.new_items?.map((item: string, index: number) => {
                      const parsed = parseResult(item);

                      return (
                        <div
                          key={index}
                          className="border rounded-xl p-4 bg-slate-950 hover:bg-slate-900 transition space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCases.includes(index + 1)}
                              onChange={() => toggleCase(index + 1)}
                            />

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge>#{index + 1}</Badge>
                                <h3 className="font-semibold leading-snug">
                                  {parsed.title}
                                </h3>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {parsed.meta}
                              </p>

                              {expanded === index ? (
                                <p className="text-sm whitespace-pre-line mt-2">
                                  {parsed.body}
                                </p>
                              ) : null}

                              <button
                                onClick={() =>
                                  setExpanded(expanded === index ? null : index)
                                }
                                className="flex items-center gap-1 text-xs text-primary mt-2"
                              >
                                {expanded === index ? (
                                  <>Hide details <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                  <>View details <ChevronDown className="h-3 w-3" /></>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                </CardContent>
              </Card>
            )}

            {/* DOWNLOADED PDF PANEL */}
            {downloadedPdfs.length > 0 && (
              <Card className="bg-slate-900/70 border border-slate-700/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">📄 Downloaded PDFs</h3>

                  {downloadedPdfs.map((pdf, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border rounded-lg p-3 bg-slate-950"
                    >
                      <span className="truncate text-sm">{pdf.file}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(pdf.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> View PDF
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDE — SAVED */}
          <div className="flex flex-col gap-6 h-full overflow-hidden">

            <Card className="flex-1 overflow-hidden bg-slate-900/70 border border-slate-700/50">
              <CardContent className="p-5 flex flex-col h-full">

                <h2 className="font-semibold mb-3">📂 Saved Monitors</h2>

                <div className="flex-1 overflow-y-auto space-y-2">

                  {savedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2"
                    >
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start truncate"
                        onClick={() => openSavedFile(file)}
                      >
                        📄 {file}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSavedFile(file)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}

                </div>

              </CardContent>
            </Card>

            {selectedSaved && (
              <Card className="flex-1 overflow-hidden bg-slate-900/70 border border-slate-700/50">
                <CardContent className="p-5 flex flex-col h-full">

                  <h3 className="text-sm font-semibold truncate">
                    {selectedSaved.file}
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3 mt-3">

                    {selectedSaved.results.map(
                      (item: string, index: number) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 bg-slate-950"
                        >
                          <Badge>#{index + 1}</Badge>
                          <p className="text-xs mt-2 whitespace-pre-line">
                            {item}
                          </p>
                        </div>
                      )
                    )}

                  </div>

                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
