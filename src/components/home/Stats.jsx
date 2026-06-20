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
    started.current = false;
    setCount(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current && target > 0) {
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

const fetchJson = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

export default function Stats() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ temples: 0, districts: 0, festivals: 0 });

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      const results = await Promise.allSettled([
        fetchJson(`${API}/temples?limit=1`),
        fetchJson(`${API}/districts`),
        fetchJson(`${API}/festivals`),
      ]);

      if (cancelled) return;

      const [templesResult, districtsResult, festivalsResult] = results;

      setCounts((prev) => ({
        temples:
          templesResult.status === "fulfilled"
            ? (templesResult.value.total ?? prev.temples)
            : prev.temples,
        districts:
          districtsResult.status === "fulfilled"
            ? (districtsResult.value.count ?? districtsResult.value.districts?.length ?? prev.districts)
            : prev.districts,
        festivals:
          festivalsResult.status === "fulfilled"
            ? (festivalsResult.value.count ?? festivalsResult.value.festivals?.length ?? prev.festivals)
            : prev.festivals,
      }));

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          const names = ["temples", "districts", "festivals"];
          console.error(`Stats: failed to fetch ${names[i]} count:`, r.reason);
        }
      });
    };

    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { icon: "🛕",  value: counts.temples,   suffix: "+",  label: t("stats.temples")   },
    { icon: "🏙️", value: counts.districts, suffix: "+",  label: t("stats.districts") },
    { icon: "🪔",  value: counts.festivals, suffix: "+",  label: t("stats.festivals") },
    { icon: "👥",  value: 10,               suffix: "L+", label: t("stats.devotees")  },
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