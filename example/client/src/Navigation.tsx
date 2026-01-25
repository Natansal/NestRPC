import "./App.css";

type NavigationProps = {
  currentPage: "raw" | "query";
  onNavigate: (page: "raw" | "query") => void;
};

/**
 * 🧭 Navigation component for switching between Raw RPC and React Query examples
 */
export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="navigation">
      <button
        className={`nav-button ${currentPage === "raw" ? "active" : ""}`}
        onClick={() => onNavigate("raw")}
      >
        📦 Raw RPC
      </button>
      <button
        className={`nav-button ${currentPage === "query" ? "active" : ""}`}
        onClick={() => onNavigate("query")}
      >
        ⚡ React Query
      </button>
    </nav>
  );
}
