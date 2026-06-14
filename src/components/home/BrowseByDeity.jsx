import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/home/browseByDeity.css";

const fallbackDeities = [
  { name: "Shiva",   filterKey: "Shiva",   image: "/images/LordShiva.jpg", color: "#3b82f6" },
  { name: "Vishnu",  filterKey: "Vishnu",  image: "/images/vishnu.jpg",    color: "#f59e0b" },
  { name: "Devi",    filterKey: "Devi",    image: "/images/durga.jpg",     color: "#ec4899" },
  { name: "Ganesh",  filterKey: "Ganesh",  image: "/images/ganesh.jpg",    color: "#f97316" },
  { name: "Hanuman", filterKey: "Hanuman", image: "/images/hanuman.jpg",   color: "#ef4444" },
];

export default function BrowseByDeity() {
  const navigate = useNavigate();
  const [deities, setDeities] = useState(fallbackDeities);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${API}/deities`)
      .then((r) => r.json())
      .then((data) => {
        if (data.deities?.length > 0) setDeities(data.deities);
      })
      .catch(() => {}); // silently fall back to hardcoded list
  }, []);

  const handleClick = (deity) => {
    if (!deity.filterKey) {
      navigate("/temples");
    } else {
      navigate(`/temples?deity=${encodeURIComponent(deity.filterKey)}`);
    }
  };

  return (
    <section className="deity">
      <div className="deity__header">
        <h2 className="deity__title">Browse by Deity</h2>
        <button className="deity__view-all" onClick={() => navigate("/temples")}>
          View All <FiArrowRight size={15} />
        </button>
      </div>

      <div className="deity__grid">
        {deities.map((deity, i) => (
          <motion.div
            key={deity._id || deity.name}
            className="deity__card"
            onClick={() => handleClick(deity)}
            style={{ cursor: "pointer" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            whileHover={{ y: -4 }}
          >
            <div
              className="deity__icon-wrap"
              style={{ borderColor: deity.color || "#f4a261" }}
            >
              {deity.image ? (
                <img
                  src={deity.image}
                  alt={deity.name}
                  className="deity__img"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <span className="deity__more-icon">+</span>
              )}
            </div>
            <span className="deity__name">{deity.name}</span>
          </motion.div>
        ))}

        {/* Always show More button */}
        <motion.div
          className="deity__card"
          onClick={() => navigate("/temples")}
          style={{ cursor: "pointer" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: deities.length * 0.07 }}
          whileHover={{ y: -4 }}
        >
          <div className="deity__icon-wrap" style={{ borderColor: "#6b7280" }}>
            <span className="deity__more-icon">+</span>
          </div>
          <span className="deity__name">More</span>
        </motion.div>
      </div>
    </section>
  );
}