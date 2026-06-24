import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiHome, FiChevronRight, FiMapPin, FiClock,
  FiHeart, FiShare2, FiCamera, FiInfo,
  FiNavigation, FiPhone, FiCalendar
} from "react-icons/fi";
import { getTempleBySlug, markTempleVisited } from "../../services/templeService";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/temple/templeDetail.css";

const tabs = ["Overview", "Gallery", "Location", "Festivals", "Nearby"];

export default function TempleDetail() {
  const { slug }                    = useParams();
  const [temple,    setTemple]      = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);
  const [activeTab, setActiveTab]   = useState("Overview");
  const [imgIndex,  setImgIndex]    = useState(0);
  const [isFav,     setIsFav]       = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setImgIndex(0);
    setActiveTab("Overview");
    getTempleBySlug(slug)
      .then((t) => {
        setTemple(t);
        // ── Logged-in user ne temple page dekha → visited mark karo ──
        if (isAuthenticated && t?._id) {
          markTempleVisited(t._id).catch(() => {});
        }
      })
      .catch(() => setError("Temple not found"))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  if (loading) return (
    <div className="temple-detail__not-found">
      <span>🛕</span><h2>Loading...</h2>
    </div>
  );

  if (error || !temple) return (
    <div className="temple-detail__not-found">
      <span>🛕</span>
      <h2>Temple not found</h2>
      <Link to="/temples">Back to Temples</Link>
    </div>
  );

  const images = temple.images?.length > 0
    ? temple.images
    : ["/images/placeholder-temple.jpg"];

  return (
    <div className="temple-detail">

      {/* Breadcrumb */}
      <div className="temple-detail__breadcrumb">
        <Link to="/" className="breadcrumb__item"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <Link to="/temples" className="breadcrumb__item">Temples</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <span className="breadcrumb__item breadcrumb__item--active">{temple.name}</span>
      </div>

      {/* Hero */}
      <div className="temple-detail__hero">
        <motion.img
          key={imgIndex}
          src={images[imgIndex]}
          alt={temple.name}
          className="temple-detail__hero-img"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
        />
        <div className="temple-detail__hero-overlay" />

        {images.length > 1 && (
          <div className="temple-detail__thumbnails">
            {images.map((img, i) => (
              <img key={i} src={img} alt=""
                className={`temple-detail__thumb ${i === imgIndex ? "active" : ""}`}
                onClick={() => setImgIndex(i)}
                onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
              />
            ))}
          </div>
        )}

        <div className="temple-detail__hero-actions">
          <button
            className={`temple-detail__fav-btn ${isFavorite(temple._id) ? "active" : ""}`}
            onClick={() => toggleFavorite({
              id: temple._id, name: temple.name,
              image: images[0], location: `${temple.city}, ${temple.district}`,
              deity: temple.deity, slug: temple.slug, type: "temple",
            })}
          >
            <FiHeart size={17} />
            {isFavorite(temple._id) ? "Saved" : "Save"}
          </button>
          <button className="temple-detail__share-btn" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: temple.name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }
          }}>
            <FiShare2 size={17} /> Share
          </button>
        </div>

        <div className="temple-detail__hero-badge">
          <span className="temple-detail__deity-tag"
            style={{ background: `${temple.deityColor || "#f4a261"}22`, color: temple.deityColor || "#f4a261" }}>
            {temple.deity}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="temple-detail__body">
        <div className="temple-detail__left">

          <motion.div className="temple-detail__title-wrap"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="temple-detail__title">{temple.name}</h1>
            <div className="temple-detail__meta">
              <span className="temple-detail__location">
                <FiMapPin size={14} /> {temple.city}{temple.city && ", "}{temple.district}
              </span>
              <span className="temple-detail__timing">
                <FiClock size={14} />
                {temple.timings?.morning && temple.timings?.evening
                  ? `${temple.timings.morning} – ${temple.timings.evening}`
                  : "5:00 AM – 10:00 PM"}
              </span>
              {temple.rating > 0 && (
                <span className="temple-detail__rating">⭐ {temple.rating} / 5</span>
              )}
            </div>
          </motion.div>

          <div className="temple-detail__tabs">
            {tabs.map((tab) => (
              <button key={tab}
                className={`temple-detail__tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <motion.div key={activeTab} className="temple-detail__tab-content"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            {/* Overview */}
            {activeTab === "Overview" && (
              <div className="temple-detail__overview">
                {temple.description && <><h3>About the Temple</h3><p>{temple.description}</p></>}
                {temple.history     && <><h3>History</h3><p>{temple.history}</p></>}
                {temple.significance && <><h3>Significance</h3><p>{temple.significance}</p></>}

                <div className="temple-detail__info-cards">
                  <div className="temple-detail__info-card">
                    <FiClock size={18} className="info-card__icon" />
                    <span className="info-card__label">Open</span>
                    <span className="info-card__value">{temple.timings?.morning || "5:00 AM"}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiClock size={18} className="info-card__icon" />
                    <span className="info-card__label">Close</span>
                    <span className="info-card__value">{temple.timings?.evening || "10:00 PM"}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiCalendar size={18} className="info-card__icon" />
                    <span className="info-card__label">Best Time</span>
                    <span className="info-card__value">{temple.bestTime || "Oct – Mar"}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiInfo size={18} className="info-card__icon" />
                    <span className="info-card__label">Entry Fee</span>
                    <span className="info-card__value">{temple.entryFee || "Free"}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiCamera size={18} className="info-card__icon" />
                    <span className="info-card__label">Photography</span>
                    <span className="info-card__value">{temple.photography || "Allowed"}</span>
                  </div>
                </div>

                {temple.facilities?.length > 0 && (
                  <>
                    <h3>Facilities</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {temple.facilities.map((f) => (
                        <span key={f} style={{
                          padding: "4px 12px", borderRadius: 20,
                          background: "#fff7ed", color: "#c2410c", fontSize: 13
                        }}>{f}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Gallery */}
            {activeTab === "Gallery" && (
              <div className="temple-detail__gallery">
                {images.map((img, i) => (
                  <motion.img key={i} src={img} alt={`${temple.name} ${i + 1}`}
                    className="temple-detail__gallery-img"
                    whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                    onClick={() => setImgIndex(i)}
                    onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                  />
                ))}
              </div>
            )} 

            {/* Location */}
            {activeTab === "Location" && (
              <div className="temple-detail__location-tab">
                <div className="temple-detail__map-placeholder">
                  <FiMapPin size={32} />
                  <p>{temple.name}</p>
                  <span>{temple.city}, {temple.district}, {temple.state}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(temple.name + " " + (temple.city || "") + " " + (temple.state || ""))}`}
                    target="_blank" rel="noreferrer"
                    className="temple-detail__maps-btn"
                  >
                    <FiNavigation size={15} /> Open in Google Maps
                  </a>
                </div>
                <div className="temple-detail__address-card">
                  <h4>Address</h4>
                  <p>{temple.address || `${temple.name}, ${temple.city}, ${temple.district}`}</p>
                  {temple.website && (
                    <>
                      <h4>Official Website</h4>

                      <a href={temple.website} target="_blank" rel="noreferrer">{temple.website}</a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Festivals */}
            {activeTab === "Festivals" && (
              <div className="temple-detail__festivals">
                {temple.festivals?.length > 0 ? (
                  temple.festivals.map((f, i) => (
                    <div key={i} className="temple-detail__festival-card">
                      <div className="festival-card__month">🪔</div>
                      <div className="festival-card__info">
                        <h4>{typeof f === "string" ? f : f.name}</h4>
                        {f.desc && <p>{f.desc}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#6b7280", fontSize: 14 }}>No festival info added yet.</p>
                )}
              </div>
            )}

            {/* Nearby */}
            {activeTab === "Nearby" && (
              <div className="temple-detail__nearby">
                <p className="temple-detail__nearby-sub">Other temples near {temple.city || temple.district}</p>
                {temple.nearby?.length > 0 ? (
                  <div className="temple-detail__nearby-grid">
                    {temple.nearby.slice(0, 4).map((t, i) => (
                      <Link key={i} to={t.slug ? `/temples/${t.slug}` : "#"}
                        className="temple-detail__nearby-card">
                        <img src={t.image || "/images/placeholder-temple.jpg"} alt={t.name}
                          onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }} />
                        <div>
                          <p className="nearby-card__name">{t.name}</p>
                          <p className="nearby-card__dist"><FiMapPin size={11} /> {t.distance}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280", fontSize: 14 }}>No nearby temples found.</p>
                )}
              </div>
            )}

          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="temple-detail__sidebar">
          <div className="temple-detail__sidebar-card">
            <h4 className="sidebar-card__title">Temple Contact</h4>
            <ul className="sidebar-card__list">
              {temple.phone && <li><FiPhone size={14} /><span>{temple.phone}</span></li>}
              <li><FiMapPin size={14} /><span>{temple.city}, {temple.district}</span></li>
              <li>
                <FiClock size={14} />
                <span>
                  {temple.timings?.morning && temple.timings?.evening
                    ? `${temple.timings.morning} – ${temple.timings.evening}`
                    : "5:00 AM – 10:00 PM"}
                </span>
              </li>
            </ul>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(temple.name + " " + (temple.city || "") + " " + (temple.state || ""))}`}
              target="_blank" rel="noreferrer"
              className="sidebar-card__directions-btn"
            >
              <FiNavigation size={14} /> Get Directions
            </a>
          </div>

          <div className="temple-detail__sidebar-card">
            <h4 className="sidebar-card__title">Visit Information</h4>
            <ul className="sidebar-card__info-list">
              <li>
                <span className="info-list__label">Entry Fee</span>
                <span className="info-list__value">{temple.entryFee || "Free"}</span>
              </li>
              <li>
                <span className="info-list__label">Dress Code</span>
                <span className="info-list__value">{temple.dressCode || "Traditional"}</span>
              </li>
              <li>
                <span className="info-list__label">Best Season</span>
                <span className="info-list__value">{temple.bestTime || "Oct – Mar"}</span>
              </li>
              <li>
                <span className="info-list__label">Photography</span>
                <span className="info-list__value">{temple.photography || "Allowed"}</span>
              </li>
              {temple.type && (
                <li>
                  <span className="info-list__label">Type</span>
                  <span className="info-list__value">{temple.type}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}