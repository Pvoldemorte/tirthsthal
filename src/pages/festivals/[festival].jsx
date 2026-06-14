import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiChevronRight, FiCalendar, FiMapPin, FiHeart, FiClock } from "react-icons/fi";
import { useFavorites } from "../../context/FavoritesContext";
import { getFestivalBySlug } from "../../services/contentService";
import "../../styles/pages/festivals.css";

export default function FestivalDetail() {
  const { festival: slug } = useParams();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFestivalBySlug(slug)
      .then((data) => setFestival(data))
      .catch(() => setError("Festival not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFav = () => {
    if (!festival) return;
    toggleFavorite({
      id: festival._id,
      name: festival.name,
      image: festival.image,
      location: festival.location,
      deityColor: festival.deityColor,
      slug: festival.slug,
      type: "festival",
    });
  };

  if (loading) {
    return <div className="fest-page"><p style={{ padding: 60, textAlign: "center" }}>Loading festival...</p></div>;
  }

  if (error || !festival) {
    return (
      <div className="fest-page">
        <div style={{ padding: 60, textAlign: "center" }}>
          <p>Festival not found.</p>
          <Link to="/festivals">← Back to Festivals</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fest-page">

      {/* Breadcrumb */}
      <div className="fest-page__breadcrumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <Link to="/festivals">Festivals</Link>
        <FiChevronRight size={13} />
        <span>{festival.name}</span>
      </div>

      {/* Hero */}
      <div className="fest-page__hero">
        <img
          src={festival.image || "/images/hero-temples.jpeg"}
          className="dist-main__hero-bg"
          alt={festival.name}
          onError={(e) => e.target.style.display = "none"}
        />
        <div className="dist-main__hero-overlay" />
        <div className="fest-page__hero-left">
          <h1 className="fest-page__title">{festival.name}</h1>
          <p className="fest-page__sub">
            <FiMapPin size={14} /> {festival.location}
            {festival.month && <> &nbsp;•&nbsp; <FiCalendar size={14} /> {festival.month}</>}
            {festival.duration && <> &nbsp;•&nbsp; <FiClock size={14} /> {festival.duration}</>}
          </p>
        </div>
      </div>

      <div className="fest-page__body">
        <div className="fest-page__main">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: "#fff", borderRadius: 16, padding: 24 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 className="fest-page__section-title" style={{ margin: 0 }}>About the Festival</h2>
              <button
                className={`fest-card__fav ${isFavorite(festival._id) ? "active" : ""}`}
                onClick={handleFav}
                style={{ position: "static" }}
              >
                <FiHeart size={16} />
              </button>
            </div>

            {festival.deity && (
              <p><strong>Deity:</strong> {festival.deity}</p>
            )}
            {festival.type && (
              <p><strong>Type:</strong> {festival.type}</p>
            )}

            {festival.description && (
              <>
                <h3>Description</h3>
                <p>{festival.description}</p>
              </>
            )}

            {festival.importance && (
              <>
                <h3>Significance</h3>
                <p>{festival.importance}</p>
              </>
            )}

            {festival.history && (
              <>
                <h3>History</h3>
                <p>{festival.history}</p>
              </>
            )}

            {festival.howToCelebrate && (
              <>
                <h3>How It's Celebrated</h3>
                <p>{festival.howToCelebrate}</p>
              </>
            )}

            {festival.templesCelebrated?.length > 0 && (
              <>
                <h3>Temples Celebrating This Festival</h3>
                <ul>
                  {festival.templesCelebrated.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </>
            )}
          </motion.div>

          {festival.images?.length > 0 && (
            <div className="fest-grid" style={{ marginTop: 24 }}>
              {festival.images.map((img, i) => (
                <img key={i} src={img} alt={`${festival.name} ${i + 1}`}
                  style={{ width: "100%", borderRadius: 12, objectFit: "cover", height: 180 }} />
              ))}
            </div>
          )}
        </div>

        <div className="fest-page__sidebar">
          <div className="fest-sidebar__box">
            <h3 className="fest-sidebar__guide-title">Festival Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              {festival.date && <p><strong>Date:</strong> {festival.date}</p>}
              {festival.month && <p><strong>Month:</strong> {festival.month}</p>}
              {festival.duration && <p><strong>Duration:</strong> {festival.duration}</p>}
              {festival.state && <p><strong>State:</strong> {festival.state}</p>}
              {festival.location && <p><strong>Location:</strong> {festival.location}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}