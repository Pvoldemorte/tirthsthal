import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDistricts } from "../../services/contentService";
import "../../styles/home/districtExplore.css";

export default function DistrictExplore() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [visibleCards, setVisibleCards] = useState(8);

  useEffect(() => {
    getDistricts()
      .then((list) => setDistricts(list || []))
      .catch((err) => {
        console.error("Failed to load districts:", err);
        setDistricts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="district">
        <div className="district__header">
          <h2 className="district__title">Explore by District</h2>
        </div>
        <p style={{ padding: "20px 0" }}>Loading districts...</p>
      </section>
    );
  }

  if (districts.length === 0) return null;

  return (
    <section className="district">

      {/* ── Header ── */}
      <div className="district__header">
        <h2 className="district__title">Explore by District</h2>
        <Link to="/districts" className="district__view-all">
          View All Districts <FiArrowRight size={15} />
        </Link>
      </div>

      {/* ── Grid ── */}
      <div className="district__grid">
        {districts.slice(0, visibleCards).map((district, i) => (
          <motion.div
            key={district._id}
            className="district__card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/districts/${district.slug}`} className="district__card-link">
              <div className="district__img-wrap">
                <img
                  src={district.image || "/images/placeholder-temple.jpg"}
                  alt={district.name}
                  className="district__img"
                  onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                />
                <div className="district__overlay" />
                <div className="district__text">
                  <span className="district__name">
                    <FiMapPin size={13} />
                    {district.name}
                  </span>
                  <span className="district__count">
                    {district.templeCount || 0} Temples
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {visibleCards < districts.length && (
        <div className="district__load-more">
          <button onClick={() => setVisibleCards((prev) => prev + 8)}>
            Load More Districts <FiArrowRight size={14} />
          </button>
        </div>
      )}

    </section>
  );
}