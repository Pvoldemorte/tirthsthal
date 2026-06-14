import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin, FiHeart } from "react-icons/fi";
import { useFavorites } from "../../context/FavoritesContext";
import { getTemples } from "../../services/templeService";
import "../../styles/home/popularTemples.css";

export default function PopularTemples() {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getTemples({ sort: "Rating", limit: 6 });
        setTemples(data.temples || []);
      } catch (err) {
        console.error("Failed to load popular temples:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const handleFav = (e, temple) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id:         temple._id,
      name:       temple.name,
      image:      temple.images?.[0] || "/images/placeholder-temple.jpg",
      location:   `${temple.district}, ${temple.state}`,
      deity:      temple.deity,
      deityColor: temple.deityColor,
      rating:     temple.rating,
      slug:       temple.slug,
      type:       "temple",
    });
  };

  if (loading) {
    return (
      <section className="popular">
        <div className="popular__header">
          <h2 className="popular__title">Popular Temples</h2>
        </div>
        <p style={{ padding: "20px 0" }}>Loading temples...</p>
      </section>
    );
  }

  if (temples.length === 0) return null;

  return (
    <section className="popular">

      {/* ── Header ── */}
      <div className="popular__header">
        <h2 className="popular__title">Popular Temples</h2>
        <Link to="/temples" className="popular__view-all">
          View All Temples <FiArrowRight size={15} />
        </Link>
      </div>

      {/* ── Cards ── */}
      <div className="popular__grid">
        {temples.map((temple, i) => (
          <motion.div
            key={temple._id}
            className="popular__card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/temples/${temple.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              {/* Image */}
              <div className="popular__img-wrap">
                <img
                  src={temple.images?.[0] || "/images/placeholder-temple.jpg"}
                  alt={temple.name}
                  className="popular__img"
                  onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                />

                {/* Favorite Button */}
                <button
                  className={`popular__fav ${isFavorite(temple._id) ? "active" : ""}`}
                  onClick={(e) => handleFav(e, temple)}
                >
                  <FiHeart size={15} />
                </button>
              </div>

              {/* Info */}
              <div className="popular__info">
                <h3 className="popular__name">{temple.name}</h3>
                <div className="popular__bottom">
                  <span className="popular__city">
                    <FiMapPin size={12} />
                    {temple.city || temple.district}
                  </span>
                  <span
                    className="popular__deity"
                    style={{ background: `${temple.deityColor || "#f4a261"}18`, color: temple.deityColor || "#f4a261" }}
                  >
                    {temple.deity?.replace("Lord ", "").replace("Goddess ", "")}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </section>
  );
}