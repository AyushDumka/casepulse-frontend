import { Route, Switch } from "wouter";

import Home from "./pages/Home";
import Results from "./pages/Results";
import SupremeMonitor from "./pages/SupremeMonitor";
import DelhiMonitor from "./pages/DelhiMonitor";
import CercChecker from "@/pages/cerc-checker";

function App() {
  return (
    <Switch>
      {/* HOME PAGE */}
      <Route path="/" component={Home} />

      {/* SEARCH RESULTS PAGE */}
      <Route path="/results" component={Results} />

      {/* SUPREME COURT MONITOR PAGE */}
      <Route path="/supreme-monitor" component={SupremeMonitor} />

      {/* DELHI HIGH COURT CASE STATUS PAGE */}
      <Route path="/delhi-monitor" component={DelhiMonitor} />

      {/* ✅ CERC CAUSE LIST CHECKER */}
      <Route path="/cerc-checker" component={CercChecker} />

      {/* FALLBACK */}
      <Route>
        <div style={{ padding: "2rem", color: "white" }}>
          404 — Page Not Found
        </div>
      </Route>
    </Switch>
  );
}

export default App;
