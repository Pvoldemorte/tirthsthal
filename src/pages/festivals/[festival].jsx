import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome, FiChevronRight, FiCalendar, FiMapPin, FiHeart,
  FiClock, FiX, FiChevronLeft, FiZoomIn, FiBell,
} from "react-icons/fi";
import { useFavorites } from "../../context/FavoritesContext";
import { getFestivalBySlug } from "../../services/contentService";
import "../../styles/pages/festivalDetail.css"

export default function FestivalDetail() {
  const { festival: slug } = useParams();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFestivalBySlug(slug)
      .then((data) => setFestival(data))
      .catch(() => setError("Festival not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const allImages = festival
    ? [festival.image, ...(festival.images || [])].filter((img, i, arr) => img && arr.indexOf(img) === i)
    : [];

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i + 1) % allImages.length),
    [allImages.length]
  );
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length),
    [allImages.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  const handleFav = () => {
    if (!festival) return;
    toggleFavorite({
      id: festival._id,
      name: festival.name,
      image: festival.image,
      location: festival.location,
      deityColor: festival.deityColor,
      type: "festival",
    });
  };

  if (loading) {
    return (
      <div className="fd">
        <div className="fd__state">
          <span className="fd__state-flame">🪔</span>
          <p className="fd__state-text">Loading festival details…</p>
        </div>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="fd">
        <div className="fd__state">
          <span className="fd__state-flame">🪔</span>
          <p className="fd__state-text">This festival couldn't be found.</p>
          <Link to="/festivals">← Back to all festivals</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fd">
      <div className="fd__inner">

        <div className="fd__crumb">
          <Link to="/"><FiHome size={13} /> Home</Link>
          <FiChevronRight size={12} />
          <Link to="/festivals">Festivals</Link>
          <FiChevronRight size={12} />
          <span>{festival.name}</span>
        </div>

        <div className="fd__hero" onClick={() => allImages.length > 0 && openLightbox(0)}>
          <img
            src={festival.image || "/images/hero-temples.jpeg"}
            className="fd__hero-img"
            alt={festival.name}
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="fd__hero-scrim" />
          {allImages.length > 0 && (
            <div className="fd__hero-zoom-hint">
              <FiZoomIn size={13} /> View {allImages.length > 1 ? `${allImages.length} photos` : "photo"}
            </div>
          )}
          <div className="fd__hero-content">
            {festival.type && <span className="fd__eyebrow">🪔 {festival.type}</span>}
            <h1 className="fd__title">{festival.name}</h1>
            <div className="fd__meta-row">
              {festival.location && (
                <span className="fd__meta-item"><FiMapPin size={14} /> {festival.location}</span>
              )}
              {festival.month && (
                <>
                  <span className="fd__meta-dot" />
                  <span className="fd__meta-item"><FiCalendar size={14} /> {festival.month}</span>
                </>
              )}
              {festival.duration && (
                <>
                  <span className="fd__meta-dot" />
                  <span className="fd__meta-item"><FiClock size={14} /> {festival.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="fd__scallop" />

        <div className="fd__grid">
          <div>
            <motion.div
              className="fd__card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="fd__card-head">
                <h2>About the Festival</h2>
                <button
                  className={`fd__fav-btn ${isFavorite(festival._id) ? "active" : ""}`}
                  onClick={handleFav}
                  aria-label="Save festival"
                >
                  <FiHeart size={17} />
                </button>
              </div>

              {(festival.deity || festival.type) && (
                <div className="fd__tags">
                  {festival.deity && <span className="fd__tag">🕉️ {festival.deity}</span>}
                  {festival.type && <span className="fd__tag">{festival.type}</span>}
                </div>
              )}

              {festival.description && (
                <div className="fd__section">
                  <h3>Description</h3>
                  <p>{festival.description}</p>
                </div>
              )}

              {festival.importance && (
                <div className="fd__section">
                  <h3>Significance</h3>
                  <p>{festival.importance}</p>
                </div>
              )}

              {festival.history && (
                <div className="fd__section">
                  <h3>History</h3>
                  <p>{festival.history}</p>
                </div>
              )}

              {festival.howToCelebrate && (
                <div className="fd__section">
                  <h3>How It's Celebrated</h3>
                  <p>{festival.howToCelebrate}</p>
                </div>
              )}

              {festival.templesCelebrated?.length > 0 && (
                <div className="fd__section">
                  <h3>Temples Celebrating This Festival</h3>
                  <ul>
                    {festival.templesCelebrated.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>

            {allImages.length > 0 && (
              <div className="fd__gallery-wrap">
                <h3 className="fd__gallery-title">Photo Gallery</h3>
                <div className="fd__gallery">
                  {allImages.map((img, i) => (
                    <div key={i} className="fd__gallery-item" onClick={() => openLightbox(i)}>
                      <img src={img} alt={`${festival.name} ${i + 1}`}
                        onError={(e) => (e.target.style.display = "none")} />
                      <div className="fd__gallery-item-overlay">
                        <FiZoomIn size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="fd__sidebar">
            <div className="fd__side-card">
              <h4 className="fd__side-title">Festival Details</h4>
              {festival.date     && <div className="fd__side-row"><span className="fd__side-label">Date</span><span className="fd__side-value">{festival.date}</span></div>}
              {festival.month    && <div className="fd__side-row"><span className="fd__side-label">Month</span><span className="fd__side-value">{festival.month}</span></div>}
              {festival.duration && <div className="fd__side-row"><span className="fd__side-label">Duration</span><span className="fd__side-value">{festival.duration}</span></div>}
              {festival.state    && <div className="fd__side-row"><span className="fd__side-label">State</span><span className="fd__side-value">{festival.state}</span></div>}
              {festival.location && <div className="fd__side-row"><span className="fd__side-label">Location</span><span className="fd__side-value">{festival.location}</span></div>}
            </div>

            <div className="fd__side-cta">
              <div className="fd__side-cta-icon">🔔</div>
              <h4>Never miss it</h4>
              <p>Get notified before {festival.name} begins next year.</p>
              <button><FiBell size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Notify Me</button>
            </div>
          </aside>

        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <motion.div
            className="fd-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="fd-lightbox__close" onClick={closeLightbox} aria-label="Close">
              <FiX size={20} />
            </button>

            {allImages.length > 1 && (
              <button
                className="fd-lightbox__nav fd-lightbox__nav--prev"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Previous image"
              >
                <FiChevronLeft size={22} />
              </button>
            )}

            <motion.div
              className="fd-lightbox__img-wrap"
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[lightboxIndex]}
                alt={`${festival.name} ${lightboxIndex + 1}`}
                className="fd-lightbox__img"
              />
            </motion.div>

            {allImages.length > 1 && (
              <button
                className="fd-lightbox__nav fd-lightbox__nav--next"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Next image"
              >
                <FiChevronRight size={22} />
              </button>
            )}

            {allImages.length > 1 && (
              <div className="fd-lightbox__counter">
                {lightboxIndex + 1} / {allImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}