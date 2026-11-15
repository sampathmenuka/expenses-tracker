import { createRoot } from "react-dom/client";
import App from "./App";
// Fonts are self-hosted (Latin only), so first paint doesn't wait on a third-party host.
// Every serif heading is bold, so a single 18 KB weight is all that ships.
import "@fontsource/fraunces/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
