import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/home/browseByDeity.css";

const fallbackDeities = [
  { name: "Shiva",      filterKey: "Shiva",      image: "/images/Mahakal.png", color: "#3b82f6" },
  { name: "Vishnu",     filterKey: "Vishnu",     image: "/images/Vishnu.png",    color: "#f59e0b" },
  { name: "Devi",       filterKey: "Devi",       image: "/images/durga.png",     color: "#ec4899" },
  { name: "Ganesh",     filterKey: "Ganesh",     image: "/images/ganesh.png",    color: "#f97316" },
  { name: "Hanuman",    filterKey: "Hanuman",    image: "/images/hanuman.png",   color: "#ef4444" },
  // { name: "Ram",        filterKey: "Ram",        image: "/images/ram.jpg",       color: "#10b981" },
  // { name: "Krishna",    filterKey: "Krishna",    image: "/images/krishna.jpg",   color: "#8b5cf6" },
  // { name: "Durga Mata", filterKey: "Durga Mata", image: "/images/durga.jpg",     color: "#ec4899" },
  // { name: "Shani Dev",  filterKey: "Shani Dev",  image: "/images/shani.jpg",     color: "#6b7280" },
];

export default function BrowseByDeity() {
  const navigate = useNavigate();
  const [deities, setDeities] = useState(fallbackDeities);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "https://tirthsthal-backend.vercel.app/api";
    fetch(`${API}/deities`)
      .then((r) => r.json())
      .then((data) => { if (data.deities?.length > 0) setDeities(data.deities); })
      .catch(() => {});
  }, []);

  const handleClick = (deity) => {
    const key = deity.filterKey || deity.name;
    navigate(`/temples?deity=${encodeURIComponent(key)}`);
  };

  return (
    <section className="deity">
      <div className="deity__header">
        <h2 className="deity__title">
          Browse by <span className="deity__title-accent">Deity</span>
        </h2>
        <button className="deity__view-all" onClick={() => navigate("/temples")}>
          View All <FiArrowRight size={14} />
        </button>
      </div>

      <div className="deity__grid">
        {deities.map((deity, i) => (
          <motion.div
            key={deity._id || deity.name}
            className="deity__card"
            style={{ "--deity-color": deity.color || "#E8742C" }}
            onClick={() => handleClick(deity)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div
              className="deity__halo"
              style={{ "--deity-color": deity.color || "#E8742C" }}
            >
              <div className="deity__img-circle">
                {deity.image ? (
                  <img
                    src={deity.image}
                    alt={deity.name}
                    className="deity__img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div class="deity__fallback">🕉️</div>`;
                    }}
                  />
                ) : (
                  <div className="deity__fallback">🕉️</div>
                )}
              </div>
            </div>
            <span className="deity__name">{deity.name}</span>
          </motion.div>
        ))}

        {/* More card
        <motion.div
          className="deity__card"
          style={{ "--deity-color": "#D4A96A" }}
          onClick={() => navigate("/temples")}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: deities.length * 0.06 }}
        >
          <div className="deity__halo" style={{ "--deity-color": "#D4A96A" }}>
            <div className="deity__img-circle">
              <div className="deity__fallback" style={{ fontSize: 30, color: "#D4A96A" }}>
                ✿
              </div>
            </div>
          </div>
          <span className="deity__name">More</span>
        </motion.div> */}
      </div>
    </section>
  );
}