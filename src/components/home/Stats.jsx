import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../styles/home/stats.css";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function CountUp({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat__value">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Stats() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({
    temples:   0,
    districts: 0,
    festivals: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [templesRes, districtsRes, festivalsRes] = await Promise.all([
          fetch(`${API}/temples?limit=1`).then((r) => r.json()),
          fetch(`${API}/districts`).then((r) => r.json()),
          fetch(`${API}/festivals`).then((r) => r.json()),
        ]);

        setCounts({
          temples:   templesRes.total        || templesRes.count   || 0,
          districts: districtsRes.count      || districtsRes.districts?.length || 0,
          festivals: festivalsRes.count      || festivalsRes.festivals?.length || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    { icon: "🛕", value: counts.temples,   suffix: "+", label: t("stats.temples")   },
    { icon: "🏙️", value: counts.districts, suffix: "+", label: t("stats.districts") },
    { icon: "🪔", value: counts.festivals, suffix: "+", label: t("stats.festivals") },
    { icon: "👥", value: 10,               suffix: "L+", label: t("stats.devotees") },
  ];

  return (
    <section className="stats">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          className="stat__item"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <span className="stat__icon">{stat.icon}</span>
          <div className="stat__info">
            <CountUp target={stat.value} suffix={stat.suffix} />
            <span className="stat__label">{stat.label}</span>
          </div>
        </motion.div>
      ))}
    </section>
  );
}