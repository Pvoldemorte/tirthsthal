import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiClock, FiEye, FiArrowRight } from "react-icons/fi";
import { getBlogs } from "../../services/contentService";
import "../../styles/pages/blog.css";

const categories = ["All", "Temple History", "Travel Guide", "Spiritual Practices", "Pilgrimage", "Festivals", "General"];

const categoryColors = {
  "Temple History":       "#c8610a",
  "Travel Guide":         "#10b981",
  "Spiritual Practices":  "#6366f1",
  "Pilgrimage":           "#f97316",
  "Festivals":            "#e11d48",
  "General":              "#64748b",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function Blog() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [visible,  setVisible]  = useState(6);

  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch blogs from backend ──
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { limit: 100 };
        if (search) params.search = search;
        if (category !== "All") params.category = category;
        const data = await getBlogs(params);
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error("Failed to load blogs:", err);
        setError("Failed to load blog posts.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [search, category]);

  // Featured = most-viewed published post
  const featured = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  const rest = featured ? blogs.filter((b) => b._id !== featured._id) : blogs;

  return (
    <div className="blog-page">

      {/* ── Header ── */}
      <div className="blog-page__header">
        <h1 className="blog-page__title">Blog & Stories</h1>
        <p className="blog-page__sub">
          Stories, guides and insights about India's sacred temples and traditions.
        </p>
      </div>

      {/* ── Featured ── */}
      {featured && (
        <Link to={`/blog/${featured.slug}`} className="blog-page__featured">
          <img
            src={featured.thumbnail || "/images/placeholder-temple.jpg"}
            alt={featured.title}
            className="blog-page__featured-img"
            onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
          />
          <div className="blog-page__featured-overlay" />
          <div className="blog-page__featured-content">
            <span
              className="blog-page__featured-cat"
              style={{ background: categoryColors[featured.category] || "#c8610a" }}
            >
              {featured.category || "General"}
            </span>
            <h2 className="blog-page__featured-title">{featured.title}</h2>
            <p className="blog-page__featured-excerpt">{featured.excerpt}</p>
            <div className="blog-page__featured-meta">
              <span>By {featured.author || "TirthSthal"}</span>
              <span>|</span>
              <span>{formatDate(featured.createdAt)}</span>
              <span>|</span>
              <FiEye size={13} /> <span>{featured.views ?? 0} views</span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Filters ── */}
      <div className="blog-page__filters">
        <div className="blog-page__search">
          <FiSearch size={15} />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="blog-page__cats">
          {categories.map((c) => (
            <button
              key={c}
              className={`blog-page__cat ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="blog-page__load-more"><p>Loading articles...</p></div>
      ) : error ? (
        <div className="blog-page__load-more"><p>{error}</p></div>
      ) : rest.length === 0 ? (
        <div className="blog-page__load-more"><p>No blog posts found.</p></div>
      ) : (
        <div className="blog-page__grid">
          {rest.slice(0, visible).map((b, i) => (
            <motion.div
              key={b._id}
              className="blog-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/blog/${b.slug}`} className="blog-card__img-wrap">
                <img
                  src={b.thumbnail || "/images/placeholder-temple.jpg"}
                  alt={b.title}
                  className="blog-card__img"
                  onError={(e) => { e.target.src = "/images/placeholder-temple.jpg"; }}
                />
                <span
                  className="blog-card__cat"
                  style={{ background: categoryColors[b.category] || "#c8610a" }}
                >
                  {b.category || "General"}
                </span>
              </Link>
              <div className="blog-card__info">
                <Link to={`/blog/${b.slug}`} className="blog-card__title">{b.title}</Link>
                <p className="blog-card__excerpt">{b.excerpt}</p>
                <div className="blog-card__meta">
                  <span><FiClock size={12} /> {formatDate(b.createdAt)}</span>
                  <span><FiEye  size={12} /> {b.views ?? 0}</span>
                </div>
                <div className="blog-card__footer">
                  <span className="blog-card__author">By {b.author || "TirthSthal"}</span>
                  <Link to={`/blog/${b.slug}`} className="blog-card__read-more">
                    Read More <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && visible < rest.length && (
        <div className="blog-page__load-more">
          <button onClick={() => setVisible((v) => v + 6)}>Load More</button>
        </div>
      )}
    </div>
  );
}