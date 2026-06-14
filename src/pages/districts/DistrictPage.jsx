import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch, FiMapPin, FiHeart, FiChevronRight,
  FiHome, FiChevronDown, FiChevronLeft
} from "react-icons/fi";
import { useFavorites } from "../../context/FavoritesContext";
import { getDistricts, getDistrictBySlug } from "../../services/contentService";
import "../../styles/pages/districtsPage.css";

const ITEMS_PER_PAGE = 8;
const sortOptions = ["Popularity", "Name A-Z", "Rating"];

export default function DistrictPage() {
  const { district: slug } = useParams();

  const [allDistricts, setAllDistricts] = useState([]);
  const [district,     setDistrict]     = useState(null);
  const [temples,      setTemples]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy,   setSortBy]   = useState("Popularity");

  const { isFavorite, toggleFavorite } = useFavorites();

  // ── Fetch all districts (sidebar list) ──
  useEffect(() => {
    getDistricts()
      .then((list) => setAllDistricts(list || []))
      .catch(() => setAllDistricts([]));
  }, []);

  // ── Fetch current district + its temples ──
  useEffect(() => {
    setLoading(true);
    setPage(1);

    // No slug -> show first available district
    const targetSlug = slug || allDistricts[0]?.slug;
    if (!targetSlug) {
      setLoading(false);
      return;
    }

    getDistrictBySlug(targetSlug)
      .then((data) => {
        setDistrict(data.district);
        setTemples(data.temples || []);
      })
      .catch(() => {
        setDistrict(null);
        setTemples([]);
      })
      .finally(() => setLoading(false));
  }, [slug, allDistricts]);

  const handleFav = (e, temple) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: temple._id, name: temple.name,
      image: temple.images?.[0] || "/images/placeholder-temple.jpg",
      location: temple.address || district?.name,
      deity: temple.deity, deityColor: temple.deityColor,
      rating: temple.rating, slug: temple.slug, type: "temple",
    });
  };

  // ── Sort temples client-side ──
  const sortedTemples = [...temples];
  if (sortBy === "Name A-Z") sortedTemples.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "Rating")   sortedTemples.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const totalPages = Math.ceil(sortedTemples.length / ITEMS_PER_PAGE);
  const paginated  = sortedTemples.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filteredDistricts = allDistricts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const getPaginationPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 4) pages.push("...");
      if (page > 3 && page < totalPages - 2) pages.push(page);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return <div className="dist-page"><p style={{ padding: 60, textAlign: "center" }}>Loading district...</p></div>;
  }

  if (!district) {
    return (
      <div className="dist-page">
        <div style={{ padding: 60, textAlign: "center" }}>
          <p>No districts found yet.</p>
          <Link to="/temples">Browse Temples</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dist-page">
      <div className="dist-page__layout">

        {/* ── Left Sidebar ── */}
        <aside className="dist-sidebar">
          <div className="dist-sidebar__header">
            <span className="dist-sidebar__header-icon">🛕</span>
            <h3>Districts in {district.state}</h3>
          </div>

          <div className="dist-sidebar__search">
            <input
              type="text"
              placeholder="Search district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch size={15} className="dist-sidebar__search-icon" />
          </div>

          <ul className="dist-sidebar__list">
            {filteredDistricts.map((d) => (
              <li key={d._id}>
                <Link
                  to={`/districts/${d.slug}`}
                  className={`dist-sidebar__item ${d.slug === slug ? "active" : ""}`}
                >
                  <span className="dist-sidebar__item-name">{d.name}</span>
                  <span className="dist-sidebar__item-count">{d.templeCount || 0}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/districts" className="dist-sidebar__view-all">
            <FiMapPin size={14} />
            View All Districts
          </Link>
        </aside>

        {/* ── Main Content ── */}
        <main className="dist-main">

          <div className="dist-main__breadcrumb">
            <Link to="/"><FiHome size={13} /> Home</Link>
            <FiChevronRight size={13} />
            <span>{district.state}</span>
            <FiChevronRight size={13} />
            <span>{district.name} District</span>
          </div>

          <div className="dist-main__hero">
            <img
              src={district.image || "/images/hero-temples.jpeg"}
              alt={district.name}
              className="dist-main__hero-bg"
              onError={(e) => e.target.src = "/images/hero-temples.jpeg"}
            />
            <div className="dist-main__hero-overlay" />
            <div className="dist-main__hero-content">
              <motion.h1
                className="dist-main__title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {district.name} District
                <span className="dist-main__title-state">, {district.state}</span>
              </motion.h1>
              <motion.p
                className="dist-main__desc"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {district.description || `Explore ${sortedTemples.length} temples in ${district.name} district. Discover ancient temples, spiritual places and seek blessings from the divine.`}
              </motion.p>

              <motion.div
                className="dist-main__hero-pills"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span className="hero-pill">🛕 {sortedTemples.length} Temples</span>
                <span className="hero-pill">📍 {district.state}</span>
                {district.famousFor?.length > 0 && (
                  <span className="hero-pill">✨ {district.famousFor.join(", ")}</span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="dist-main__stats">
            <div className="dist-main__stats-left">
              <div className="dist-stat">
                <span className="dist-stat__icon">🛕</span>
                <div>
                  <p className="dist-stat__num">{sortedTemples.length}</p>
                  <p className="dist-stat__label">Total Temples</p>
                </div>
              </div>
            </div>

            <div className="dist-main__sort" onClick={() => setSortOpen(!sortOpen)}>
              <span>Sort by: {sortBy}</span>
              <FiChevronDown size={14} className={sortOpen ? "rotated" : ""} />
              {sortOpen && (
                <ul className="dist-main__sort-dropdown">
                  {sortOptions.map((s) => (
                    <li
                      key={s}
                      className={sortBy === s ? "selected" : ""}
                      onClick={(e) => { e.stopPropagation(); setSortBy(s); setSortOpen(false); }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Temple Grid */}
          {sortedTemples.length === 0 ? (
            <p style={{ padding: "40px 0", textAlign: "center", color: "#6b7280" }}>
              No temples added in {district.name} yet.
            </p>
          ) : (
            <div className="dist-grid">
              {paginated.map((temple, i) => (
                <motion.div
                  key={temple._id}
                  className="dist-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div className="dist-card__img-wrap">
                    <img
                      src={temple.images?.[0] || "/images/placeholder-temple.jpg"}
                      alt={temple.name}
                      className="dist-card__img"
                      onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                    />
                    <button
                      className={`dist-card__fav ${isFavorite(temple._id) ? "active" : ""}`}
                      onClick={(e) => handleFav(e, temple)}
                    >
                      <FiHeart size={14} />
                    </button>
                  </div>

                  <div className="dist-card__info">
                    <h3 className="dist-card__name">{temple.name}</h3>
                    <span
                      className="dist-card__type"
                      style={{ background: `${temple.deityColor || "#f4a261"}18`, color: temple.deityColor || "#f4a261" }}
                    >
                      {temple.type || temple.deity}
                    </span>
                    <div className="dist-card__location">
                      <FiMapPin size={12} />
                      <span>{temple.address || district.name}</span>
                    </div>
                    <Link to={`/temples/${temple.slug}`} className="dist-card__btn">
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="dist-pagination">
              <button
                className="dist-pagination__arrow"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft size={16} />
              </button>

              {getPaginationPages().map((p, i) => (
                <button
                  key={i}
                  className={`dist-pagination__btn ${p === page ? "active" : ""} ${p === "..." ? "dots" : ""}`}
                  onClick={() => p !== "..." && setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="dist-pagination__arrow"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}