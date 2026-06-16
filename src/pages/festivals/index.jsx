import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch, FiCalendar, FiMapPin, FiHeart,
  FiChevronDown, FiRefreshCw, FiArrowRight, FiChevronRight
} from "react-icons/fi";
import { useFavorites } from "../../context/FavoritesContext";
import { getFestivals, getUpcomingFestivals } from "../../services/contentService";
import "../../styles/pages/festivals.css";

const months = [
  "All Months","January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const states = ["All States","Madhya Pradesh","Maharashtra","Rajasthan","Uttar Pradesh"];
const types  = [
  "All Types","National Festival","Regional Festival",
  "Cultural Festival","Major Pilgrimage Mela","Monthly Observance","State Festival"
];

const guideItems = [
  { icon:"🪔", title:"How to Participate",  sub:"Learn the rituals and significance"      },
  { icon:"🧳", title:"Travel & Stay",        sub:"Tips for a comfortable journey"          },
  { icon:"🛡️", title:"Do's & Don'ts",        sub:"Follow guidelines and respect traditions"},
];

function Dropdown({ value, options, open, setOpen, onSelect }) {
  return (
    <div className="fest-filter__dropdown" onClick={() => setOpen(!open)}>
      <span>{value}</span>
      <FiChevronDown size={13} className={`fest-filter__arrow ${open ? "open" : ""}`} />
      {open && (
        <ul className="fest-filter__list">
          {options.map((o) => (
            <li
              key={o}
              className={value === o ? "selected" : ""}
              onClick={(e) => { e.stopPropagation(); onSelect(o); setOpen(false); }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Festivals() {
  const [festivals, setFestivals] = useState([]);
  const [upcoming,  setUpcoming]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [search,    setSearch]    = useState("");
  const [selMonth,  setSelMonth]  = useState("All Months");
  const [selState,  setSelState]  = useState("All States");
  const [selType,   setSelType]   = useState("All Types");
  const [monthOpen, setMonthOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [typeOpen,  setTypeOpen]  = useState(false);
  const [visible,   setVisible]   = useState(8);

  const { isFavorite, toggleFavorite } = useFavorites();

  // ── Fetch festivals from backend ──
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selMonth !== "All Months") params.month = selMonth;
        if (selState !== "All States") params.state = selState;
        if (selType  !== "All Types")  params.type  = selType;

        const data = await getFestivals(params);
        setFestivals(data.festivals || []);
      } catch (err) {
        console.error("Failed to load festivals:", err);
        setFestivals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selMonth, selState, selType]);

  // ── Fetch upcoming festivals (sidebar) ──
  useEffect(() => {
    getUpcomingFestivals()
      .then((list) => setUpcoming(list || []))
      .catch(() => setUpcoming([]));
  }, []);

  const toggleFav = (e, f) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: f._id, name: f.name, image: f.image,
      location: f.location, deityColor: f.deityColor,
      slug: f.slug, type: "festival",
    });
  };

  const filtered = festivals.filter((f) => {
    const q = search.toLowerCase();
    return !q ||
      f.name?.toLowerCase().includes(q) ||
      f.location?.toLowerCase().includes(q);
  });

  const reset = () => {
    setSearch(""); setSelMonth("All Months");
    setSelState("All States"); setSelType("All Types");
  };

  return (
    <div className="fest-page">

      {/* ── Breadcrumb ── */}
      <div className="fest-page__breadcrumb">
        <Link to="/">Home</Link>
        <FiChevronRight size={13} />
        <span>Festivals</span>
      </div>

      {/* ── Hero Header ── */}
      <div className="fest-page__hero">
          <img src="/images/hero-temples.jpeg" className="dist-main__hero-bg" alt="Festivals"
            onError={(e) => e.target.style.display = "none"} />
            <div className="dist-main__hero-overlay" />
        <div className="fest-page__hero-left">
          <h1 className="fest-page__title">Festivals</h1>
          <p className="fest-page__sub">
            Celebrating devotion, culture and traditions.<br />
            Explore festivals at temples across India.
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="fest-filter">
        <div className="fest-filter__search">
          <FiSearch size={15} />
          <input
            type="text"
            placeholder="Search festivals, temples..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dropdown
          value={selMonth} options={months}
          open={monthOpen} setOpen={setMonthOpen} onSelect={setSelMonth}
        />
        <Dropdown
          value={selState} options={states}
          open={stateOpen} setOpen={setStateOpen} onSelect={setSelState}
        />
        <Dropdown
          value={selType} options={types}
          open={typeOpen} setOpen={setTypeOpen} onSelect={setSelType}
        />
        <button className="fest-filter__reset-btn" onClick={reset}>
          <FiRefreshCw size={13} /> Reset
        </button>
      </div>

      {/* ── Body ── */}
      <div className="fest-page__body">

        {/* ── Left Main ── */}
        <div className="fest-page__main">

          {/* Section Header */}
          <div className="fest-page__section-header">
            <h2 className="fest-page__section-title">
              {loading ? "Loading..." : `${filtered.length} Festivals Found`}
            </h2>
          </div>

          {/* Festival Grid */}
          {!loading && filtered.length === 0 ? (
            <div className="fest-page__empty">
              <p>No festivals found matching your filters.</p>
              <button onClick={reset}>Clear Filters</button>
            </div>
          ) : (
            <div className="fest-grid">
              {filtered.slice(0, visible).map((f, i) => (
                <Link to={f.slug ? `/festivals/${f.slug}` : "#"} key={f._id} style={{ textDecoration: "none", color: "inherit" }}>
                  <motion.div
                    className="fest-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    {/* Image */}
                    <div className="fest-card__img-wrap">
                      <img
                        src={f.image || "/images/placeholder-temple.jpg"}
                        alt={f.name}
                        className="fest-card__img"
                        onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                      />
                      <span className="fest-card__month-badge">{f.month}</span>
                      <button
                        className={`fest-card__fav ${isFavorite(f._id) ? "active" : ""}`}
                        onClick={(e) => toggleFav(e, f)}
                      >
                        <FiHeart size={14} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="fest-card__info">
                      <div className="fest-card__top-row">
                        <span className="fest-card__deity-icon">🪔</span>
                        <h3 className="fest-card__name">{f.name}</h3>
                      </div>
                      <div className="fest-card__location">
                        <FiMapPin size={11} />
                        <span>{f.location}</span>
                      </div>
                      <div className="fest-card__bottom">
                        <span className="fest-card__date">
                          <FiCalendar size={11} />
                          {f.month}
                        </span>
                        {f.type && (
                          <span
                            className="fest-card__type-badge"
                            style={{ background: `${f.deityColor || "#f4a261"}18`, color: f.deityColor || "#f4a261" }}
                          >
                            {f.type.split(" ").pop()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          {visible < filtered.length && (
            <div className="fest-page__load-more">
              <button onClick={() => setVisible((v) => v + 8)}>
                Load More <FiChevronDown size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="fest-page__sidebar">

          {/* Upcoming Festivals */}
          <div className="fest-sidebar__box">
            <div className="fest-sidebar__box-header">
              <h3>Upcoming Festivals</h3>
            </div>
            <div className="fest-sidebar__upcoming-list">
              {upcoming.length === 0 && <p style={{ fontSize: 13, color: "#888" }}>No upcoming festivals.</p>}
              {upcoming.map((u) => {
                const d = u.upcomingDate ? new Date(u.upcomingDate) : null;
                const monthLabel = d ? d.toLocaleString("default", { month: "short" }).toUpperCase() : "";
                const dayLabel = d ? d.getDate() : "";
                const daysLeft = d ? Math.max(0, Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))) : null;
                return (
                  <Link to={`/festivals/${u.slug}`} key={u._id} className="fest-sidebar__upcoming-item" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="fest-sidebar__date-box">
                      <span className="fest-sidebar__date-month">{monthLabel}</span>
                      <span className="fest-sidebar__date-day">{dayLabel}</span>
                    </div>
                    <div className="fest-sidebar__upcoming-info">
                      <p className="fest-sidebar__upcoming-name">{u.name}</p>
                      <p className="fest-sidebar__upcoming-loc">{u.location}</p>
                      {daysLeft !== null && (
                        <p className="fest-sidebar__upcoming-days">Starts in {daysLeft} days</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className="fest-sidebar__box fest-sidebar__newsletter">
            <div className="fest-sidebar__news-icon">📅</div>
            <h3>Never Miss a Festival</h3>
            <p>Subscribe to get festival alerts, dates and special updates.</p>
            <div className="fest-sidebar__news-input">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>

          {/* Festival Guide */}
          <div className="fest-sidebar__box">
            <h3 className="fest-sidebar__guide-title">Festival Guide</h3>
            <div className="fest-sidebar__guide-list">
              {guideItems.map((g, i) => (
                <div key={i} className="fest-sidebar__guide-item">
                  <span className="fest-sidebar__guide-icon">{g.icon}</span>
                  <div className="fest-sidebar__guide-text">
                    <p className="fest-sidebar__guide-name">{g.title}</p>
                    <p className="fest-sidebar__guide-sub">{g.sub}</p>
                  </div>
                  <FiChevronRight size={15} className="fest-sidebar__guide-arrow" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}