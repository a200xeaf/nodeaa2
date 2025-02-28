// ./src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./index.css";
// import { startAverageFPSMonitor } from "@/engine/utils/startAverageFPSMonitor.ts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NodeaaApp from "./NodeaaApp";
import EditorApp from "@/components/editor/EditorApp.tsx";

const rootElement = document.getElementById("root") as HTMLElement;

// startAverageFPSMonitor();

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <div style={{ width: "100vw", height: "100vh" }}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ReactFlowProvider>
                                <NodeaaApp />
                            </ReactFlowProvider>
                        }
                    />
                    <Route path="/editor" element={<EditorApp />} />
                </Routes>
            </BrowserRouter>
        </div>
    </React.StrictMode>,
);
