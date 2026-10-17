import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BlueprintCursor } from "./components/blueprint-cursor";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* Beside the app rather than inside it: the cursor belongs to no page, and
        a `position: fixed` layer inside a scene that runs `transform` or
        `perspective` would be laid out against that scene instead of the
        window. */}
    <BlueprintCursor />
  </StrictMode>,
);
