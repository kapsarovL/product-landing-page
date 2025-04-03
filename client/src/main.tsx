import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { clientEnv } from "./lib/env";

// Initialize client environment
// clientEnv is already an instance, no need to call getInstance()

createRoot(document.getElementById("root")!).render(<App />);
