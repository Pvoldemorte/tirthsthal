 

import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams }        from "react-router-dom";
import { FiHome, FiChevronRight, FiFilter, FiX } from "react-icons/fi";
import { motion, AnimatePresence }      from "framer-motion";
import TempleFilters                    from "../../components/temple/TempleFilters";
import TempleCard                       from "../../components/temple/TempleCard";
import { useTemples }                   from "../../hooks/useTemples";
import "../../styles/pages/temples.css";

export default function Temples() {
  const [searchParams]  = useSearchParams();
  const [filterOpen,    setFilterOpen]   = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get("search")   || "",
    state:    searchParams.get("state")    || "All States",
    district: searchParams.get("district") || "All Districts",
    deities:  searchParams.get("deity") ? [searchParams.get("deity")] : [],
    sort: "Popularity",
  });

  // ── Real data from backend (MongoDB) ──
  const {
    temples, total, page, totalPages,
    loading, error, setPage, updateFilters,
  } = useTemples({
    search:   filters.search,
    state:    filters.state    !== "All States"    ? filters.state    : undefined,
    district: filters.district !== "All Districts" ? filters.district : undefined,
    deity:    filters.deities[0] || undefined,
    type:     searchParams.get("type") || undefined,
    sort:     filters.sort,
  });

  useEffect(() => {
    const newFilters = {
      search:   searchParams.get("search")   || "",
      state:    searchParams.get("state")    || "All States",
      district: searchParams.get("district") || "All Districts",
      deities:  searchParams.get("deity") ? [searchParams.get("deity")] : [],
      sort: "Popularity",
    };
    setFilters(newFilters);
    updateFilters({
      search:   newFilters.search,
      state:    newFilters.state    !== "All States"    ? newFilters.state    : undefined,
      district: newFilters.district !== "All Districts" ? newFilters.district : undefined,
      deity:    newFilters.deities[0] || undefined,
      type:     searchParams.get("type") || undefined,
      sort:     newFilters.sort,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // lock scroll when filter open on mobile
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateFilters({
      search:   newFilters.search,
      state:    newFilters.state    !== "All States"    ? newFilters.state    : undefined,
      district: newFilters.district !== "All Districts" ? newFilters.district : undefined,
      deity:    newFilters.deities[0] || undefined,
      sort:     newFilters.sort,
    });
  };

  const clearFilters = () => {
    handleFilterChange({
      search: "", deities: [], state: "All States",
      district: "All Districts", sort: "Popularity",
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (page > 3) pages.push("...");
      if (page > 2 && page < totalPages - 1) pages.push(page);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return pages;
  };

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.deities.length +
    (filters.state !== "All States" ? 1 : 0) +
    (filters.district !== "All Districts" ? 1 : 0);

  const ITEMS_PER_PAGE = 12;

  return (
    <div className="temples-page">

      {/* Breadcrumb */}
      <div className="temples-page__breadcrumb">
        <Link to="/" className="breadcrumb__item">
          <FiHome size={13} /> Home
        </Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <span className="breadcrumb__item breadcrumb__item--active">Temples</span>
      </div>

      {/* Header */}
      <div className="temples-page__header">
        <div>
          <h1 className="temples-page__title">
            {filters.state !== "All States" ? `Temples in ${filters.state}` : "All Temples"}
          </h1>
          <p className="temples-page__sub">{total} temples found</p>
        </div>
        <div className="temples-page__meta">
          <span className="temples-page__count">
            Showing {temples.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
          </span>

          {/* Mobile Filter Button */}
          <button
            className="temples-page__filter-btn"
            onClick={() => setFilterOpen(true)}
          >
            <FiFilter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="temples-page__filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="temples-page__body">

        {/* Desktop Sidebar */}
        <div className="temples-page__sidebar-desktop">
          <TempleFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Grid */}
        <div className="temples-page__right">
          {loading ? (
            <div className="temples-page__empty">
              <span>🛕</span>
              <p>Loading temples...</p>
            </div>
          ) : error ? (
            <div className="temples-page__empty">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : temples.length === 0 ? (
            <div className="temples-page__empty">
              <span>🛕</span>
              <p>No temples found matching your filters.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <motion.div className="temples-page__grid">
              {temples.map((temple, i) => (
                <TempleCard key={temple._id || temple.id} temple={temple} index={i} />
              ))}
            </motion.div>
          )}

          {totalPages > 1 && (
            <div className="temples-page__pagination">
              <button
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >←</button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="page-dots">...</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                )
              )}
              <button
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >→</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="temples-page__filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="temples-page__filter-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="temples-page__drawer-header">
                <h3>Filters</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <FiX size={20} />
                </button>
              </div>
              <div className="temples-page__drawer-body">
                <TempleFilters onFilterChange={handleFilterChange} />
              </div>
              <div className="temples-page__drawer-footer">
                <button
                  className="temples-page__drawer-apply"
                  onClick={() => setFilterOpen(false)}
                >
                  Show {total} Temples
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
