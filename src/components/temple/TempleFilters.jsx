import { useState, useEffect } from "react";
import { FiSearch, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import "../../styles/temple/templeFilters.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const deityFilters = [
  { name: "Shiva"   },
  { name: "Vishnu"  },
  { name: "Devi"    },
  { name: "Ganesh"  },
  { name: "Hanuman" },
  { name: "Brahma"  },
  { name: "Krishna" },
];

const indianStates = [
  "All States",
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

const sortOptions = ["Popularity", "Name A-Z", "Name Z-A", "Rating", "Most Visited"];

export default function TempleFilters({ onFilterChange }) {
  const [searchParams] = useSearchParams();

  const [search,           setSearch]           = useState(searchParams.get("search")   || "");
  const [selectedState,    setSelectedState]    = useState(searchParams.get("state")    || "All States");
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get("district") || "All Districts");
  const [selectedDeities,  setSelectedDeities]  = useState(
    searchParams.get("deity") ? [searchParams.get("deity")] : []
  );
  const [selectedSort,     setSelectedSort]     = useState("Popularity");

  const [stateOpen,    setStateOpen]    = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [sortOpen,     setSortOpen]     = useState(false);
  const [showMoreDeities, setShowMoreDeities] = useState(false);

  const [districtOptions, setDistrictOptions] = useState(["All Districts"]);

  // Fetch real districts from backend
  useEffect(() => {
    fetch(`${API}/districts`)
      .then((r) => r.json())
      .then((data) => {
        const names = (data.districts || []).map((d) => d.name);
        setDistrictOptions(["All Districts", ...names]);
      })
      .catch(() => {});
  }, []);

  // If URL has ?district= pre-select it
  useEffect(() => {
    const d = searchParams.get("district");
    if (d) setSelectedDistrict(d);
  }, [searchParams]);

  const emit = (overrides = {}) => {
    onFilterChange?.({
      search, deities: selectedDeities,
      state: selectedState,
      district: selectedDistrict,
      sort: selectedSort,
      ...overrides,
    });
  };

  const toggleDeity = (name) => {
    const updated = selectedDeities.includes(name)
      ? selectedDeities.filter((d) => d !== name)
      : [...selectedDeities, name];
    setSelectedDeities(updated);
    emit({ deities: updated });
  };

  const handleSearch   = (val) => { setSearch(val);          emit({ search: val }); };
  const handleState    = (val) => { setSelectedState(val);   setStateOpen(false);    emit({ state: val }); };
  const handleDistrict = (val) => { setSelectedDistrict(val); setDistrictOpen(false); emit({ district: val }); };
  const handleSort     = (val) => { setSelectedSort(val);    setSortOpen(false);     emit({ sort: val }); };

  const clearFilters = () => {
    setSearch(""); setSelectedDeities([]);
    setSelectedState("All States");
    setSelectedDistrict("All Districts");
    setSelectedSort("Popularity");
    onFilterChange?.({
      search: "", deities: [],
      state: "All States",
      district: "All Districts",
      sort: "Popularity",
    });
  };

  const visibleDeities = showMoreDeities ? deityFilters : deityFilters.slice(0, 5);

  return (
    <aside className="tfilter">
      <h3 className="tfilter__title">Filters</h3>

      {/* Search */}
      <div className="tfilter__section">
        <p className="tfilter__label">Search Temples</p>
        <div className="tfilter__search">
          <input
            type="text"
            placeholder="Search by name, deity, place..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="tfilter__search-input"
          />
          <FiSearch size={15} className="tfilter__search-icon" />
        </div>
      </div>

      {/* Deity */}
      <div className="tfilter__section">
        <p className="tfilter__label">Deity</p>
        <div className="tfilter__deity-list">
          {visibleDeities.map((deity) => (
            <label key={deity.name} className="tfilter__check-row">
              <input
                type="checkbox"
                className="tfilter__checkbox"
                checked={selectedDeities.includes(deity.name)}
                onChange={() => toggleDeity(deity.name)}
              />
              <span className="tfilter__check-name">{deity.name}</span>
            </label>
          ))}
        </div>
        <button className="tfilter__more-btn"
          onClick={() => setShowMoreDeities(!showMoreDeities)}>
          {showMoreDeities ? "Less ▲" : "More ▼"}
        </button>
      </div>

      {/* District — fetched from API */}
      <div className="tfilter__section">
        <p className="tfilter__label">District</p>
        <div className="tfilter__dropdown" onClick={() => setDistrictOpen(!districtOpen)}>
          <span>{selectedDistrict}</span>
          <FiChevronDown size={14} className={`tfilter__dropdown-arrow ${districtOpen ? "open" : ""}`} />
          {districtOpen && (
            <ul className="tfilter__dropdown-list">
              {districtOptions.map((d) => (
                <li key={d}
                  className={selectedDistrict === d ? "selected" : ""}
                  onClick={(e) => { e.stopPropagation(); handleDistrict(d); }}>
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* State */}
      <div className="tfilter__section">
        <p className="tfilter__label">State</p>
        <div className="tfilter__dropdown" onClick={() => setStateOpen(!stateOpen)}>
          <span>{selectedState}</span>
          <FiChevronDown size={14} className={`tfilter__dropdown-arrow ${stateOpen ? "open" : ""}`} />
          {stateOpen && (
            <ul className="tfilter__dropdown-list">
              {indianStates.map((s) => (
                <li key={s}
                  className={selectedState === s ? "selected" : ""}
                  onClick={(e) => { e.stopPropagation(); handleState(s); }}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="tfilter__section">
        <p className="tfilter__label">Sort By</p>
        <div className="tfilter__dropdown" onClick={() => setSortOpen(!sortOpen)}>
          <span>{selectedSort}</span>
          <FiChevronDown size={14} className={`tfilter__dropdown-arrow ${sortOpen ? "open" : ""}`} />
          {sortOpen && (
            <ul className="tfilter__dropdown-list">
              {sortOptions.map((s) => (
                <li key={s}
                  className={selectedSort === s ? "selected" : ""}
                  onClick={(e) => { e.stopPropagation(); handleSort(s); }}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Clear */}
      <button className="tfilter__clear" onClick={clearFilters}>
        <FiRefreshCw size={14} /> Clear Filters
      </button>
    </aside>
  );
}