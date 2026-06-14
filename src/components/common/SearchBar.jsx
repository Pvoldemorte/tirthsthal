import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiArrowRight, FiX } from "react-icons/fi";
import { searchTemples } from "../../services/templeService";
import "../../styles/common/searchbar.css";

const typeColors = {
  temple:   { bg: "#fff6f0", color: "#c8610a" },
  state:    { bg: "#f0f7ff", color: "#3b82f6" },
  district: { bg: "#f0fdf4", color: "#10b981" },
  deity:    { bg: "#fdf4ff", color: "#8b5cf6" },
  popular:  { bg: "#fffbeb", color: "#f59e0b" },
};

const defaultSuggestions = [
  { type: "popular", label: "Jyotirlinga Temples",  icon: "⭐", path: "/temples?type=Jyotirlinga"       },
  { type: "popular", label: "Shakti Peeth Temples", icon: "⚡", path: "/temples?type=Shakti Peeth"      },
  { type: "state",   label: "Temples in MP",        icon: "📍", path: "/temples?state=Madhya Pradesh"   },
  { type: "deity",   label: "Shiva Temples",        icon: "🔱", path: "/temples?deity=Shiva"             },
  { type: "deity",   label: "Vishnu Temples",       icon: "🪷", path: "/temples?deity=Vishnu"            },
  { type: "district",label: "Ujjain District",      icon: "🗺️", path: "/districts/ujjain"               },
];

export default function SearchBar({ placeholder = "Search temples, deities, places..." }) {
  const navigate = useNavigate();
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading,     setLoading]     = useState(false);
  const inputRef = useRef(null);
  const wrapRef  = useRef(null);
  const debounceRef = useRef(null);

  // Debounced live search against backend
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const suggestions = await searchTemples(query.trim());
        setResults(suggestions || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Click outside closes
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") setActiveIndex((p) => Math.min(p + 1, results.length - 1));
    else if (e.key === "ArrowUp") setActiveIndex((p) => Math.max(p - 1, -1));
    else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) handleSelect(results[activeIndex]);
      else handleSearch();
    } else if (e.key === "Escape") setShowResults(false);
  };

  const handleSelect = (item) => {
    setQuery(item.label || item.name);
    setShowResults(false);
    navigate(item.path || `/temples/${item.slug}`);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setShowResults(false);
    navigate(`/temples?search=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery(""); setResults([]); setShowResults(false);
    inputRef.current?.focus();
  };

  const showDefaults  = showResults && query.trim().length < 2;
  const displayItems  = query.trim().length >= 2 ? results : [];

  return (
    <div className="smartsearch" ref={wrapRef}>

      <div className={`smartsearch__input-wrap ${showResults ? "active" : ""}`}>
        <FiSearch size={16} className="smartsearch__icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className="smartsearch__input"
        />
        {query && (
          <button className="smartsearch__clear" onClick={handleClear}>
            <FiX size={14} />
          </button>
        )}
        <button className="smartsearch__btn" onClick={handleSearch}>
          Search <FiArrowRight size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showResults && (showDefaults || displayItems.length > 0 || loading) && (
          <motion.div className="smartsearch__dropdown"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}>

            {/* Default Suggestions */}
            {showDefaults && (
              <>
                <p className="smartsearch__section-title">Popular Searches</p>
                {defaultSuggestions.map((item, i) => (
                  <div key={i} className="smartsearch__item" onClick={() => handleSelect(item)}>
                    <span className="smartsearch__item-icon" style={{ background: typeColors[item.type]?.bg }}>
                      {item.icon}
                    </span>
                    <span className="smartsearch__item-label">{item.label}</span>
                    <FiArrowRight size={13} className="smartsearch__item-arrow" />
                  </div>
                ))}
              </>
            )}

            {/* Live Results */}
            {loading && (
              <p className="smartsearch__section-title" style={{ padding: "12px 16px" }}>Searching...</p>
            )}

            {!loading && displayItems.length > 0 && (
              <>
                <p className="smartsearch__section-title">🛕 Temples</p>
                {displayItems.map((item, i) => (
                  <div key={i}
                    className={`smartsearch__item ${activeIndex === i ? "active" : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(i)}>
                    <span className="smartsearch__item-icon" style={{ background: typeColors.temple.bg, color: typeColors.temple.color }}>
                      🛕
                    </span>
                    <div className="smartsearch__item-info">
                      <span className="smartsearch__item-label">{item.name || item.label}</span>
                      {(item.district || item.state) && (
                        <span className="smartsearch__item-sub">
                          {item.district}{item.district && item.state ? ", " : ""}{item.state}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* No Results */}
            {!loading && query.trim().length >= 2 && displayItems.length === 0 && (
              <div className="smartsearch__empty">
                <span>🔍</span>
                <p>No results for "<strong>{query}</strong>"</p>
                <button onClick={handleSearch}>Search anyway <FiArrowRight size={13} /></button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}