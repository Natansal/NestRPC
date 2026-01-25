import { useState } from "react";
import Navigation from "./Navigation";
import RawRpcPage from "./RawRpcPage";
import ReactQueryPage from "./ReactQueryPage";
import "./App.css";

/**
 * ✨ Main App component showcasing NestRPC capabilities
 * 
 * Features two pages:
 * - 📦 Raw RPC: Direct RPC calls with manual state management
 * - ⚡ React Query: RPC with React Query hooks for automatic caching
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState<"raw" | "query">("raw");

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="logo-circle">NR</div>
          <div>
            <h1 className="title">NestRPC Example</h1>
            <p className="subtitle">Type‑safe RPC with file uploads & CRUD operations</p>
          </div>
        </div>
      </header>

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === "raw" ? <RawRpcPage /> : <ReactQueryPage />}

      <footer className="footer">
        <span className="muted">
          Made with ❤️ using NestRPC — Type-safe RPC with file upload support
        </span>
        <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          <span className="muted">
            {currentPage === "raw"
              ? "📦 Raw RPC: Manual state management, manual cache invalidation"
              : "⚡ React Query: Automatic caching, automatic cache invalidation"}
          </span>
        </div>
      </footer>
    </div>
  );
}
