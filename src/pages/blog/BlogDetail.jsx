import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome, FiChevronRight, FiClock, FiEye, FiLink
} from "react-icons/fi";
import { getBlogBySlug } from "../../services/contentService";
import "../../styles/pages/blog.css";

const categoryColors = {
  "Temple History":       "#c8610a",
  "Travel Guide":         "#10b981",
  "Spiritual Practices":  "#6366f1",
  "Pilgrimage":           "#f97316",
  "Festivals":            "#e11d48",
  "General":              "#64748b",
};

function getReadTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// Spread gallery images evenly between paragraphs, e.g. 3 images across
// 9 paragraphs -> after paragraph 3, 6, 9 (never right before the very first one).
function buildContentBlocks(paragraphs, images = []) {
  const blocks = [];
  if (paragraphs.length === 0) {
    images.forEach((src, i) => blocks.push({ type: "image", src, key: `img-${i}` }));
    return blocks;
  }

  const step = Math.max(1, Math.ceil(paragraphs.length / (images.length + 1)));
  let imgIdx = 0;

  paragraphs.forEach((p, i) => {
    blocks.push({ type: "text", text: p, key: `p-${i}` });
    const isStep = (i + 1) % step === 0;
    const isLast = i === paragraphs.length - 1;
    if (imgIdx < images.length && (isStep || isLast)) {
      blocks.push({ type: "image", src: images[imgIdx], key: `img-${imgIdx}` });
      imgIdx++;
    }
  });

  // Any leftover images (more images than slots) go at the end
  while (imgIdx < images.length) {
    blocks.push({ type: "image", src: images[imgIdx], key: `img-${imgIdx}` });
    imgIdx++;
  }

  return blocks;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog,    setBlog]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    getBlogBySlug(slug)
      .then((data) => setBlog(data))
      .catch(() => setError("Article not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyLink = () => navigator.clipboard.writeText(window.location.href);

  if (loading) {
    return (
      <div className="blog-detail__not-found">
        <h2>Loading article...</h2>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail__not-found">
        <h2>Article not found</h2>
        <Link to="/blog">Back to Blog</Link>
      </div>
    );
  }

  const categoryColor = categoryColors[blog.category] || "#c8610a";
  // Backend stores the article body as plain text -> split into paragraphs
  const paragraphs = (blog.content || "").split(/\n+/).filter((p) => p.trim());
  const contentBlocks = buildContentBlocks(paragraphs, blog.images || []);

  return (
    <div className="blog-detail">

      {/* ── Top Section ── */}
      <div className="blog-detail__top">

        {/* Left — Title area */}
        <div className="blog-detail__top-left">

          {/* Breadcrumb */}
          <div className="blog-detail__breadcrumb">
            <Link to="/"><FiHome size={13} /> Home</Link>
            <FiChevronRight size={13} />
            <Link to="/blog">Blog</Link>
            <FiChevronRight size={13} />
            <span>{blog.title}</span>
          </div>

          {/* Category */}
          <span
            className="blog-detail__category"
            style={{ background: `${categoryColor}18`, color: categoryColor }}
          >
            {blog.category || "General"}
          </span>

          {/* Title */}
          <motion.h1
            className="blog-detail__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {blog.title}
          </motion.h1>

          {/* Excerpt */}
          {blog.excerpt && <p className="blog-detail__excerpt">{blog.excerpt}</p>}

          {/* Meta */}
          <div className="blog-detail__meta">
            <img
              src={blog.authorAvatar || "/images/hero-avatar.jpg"}
              alt={blog.author || "Author"}
              className="blog-detail__avatar"
              onError={(e) => { e.target.src = "/images/hero-avatar.jpg"; }}
            />
            <span className="blog-detail__author">By {blog.author || "TirthSthal"}</span>
            <span className="blog-detail__sep">|</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span className="blog-detail__sep">|</span>
            <FiClock size={13} /> <span>{getReadTime(blog.content)}</span>
            <span className="blog-detail__sep">|</span>
            <FiEye size={13} /> <span>{blog.views ?? 0} Views</span>
          </div>
        </div>

        {/* Right — Hero Image */}
        <div className="blog-detail__top-right">
          <img
            src={blog.thumbnail || "/images/hero-temples.jpeg"}
            alt={blog.title}
            className="blog-detail__hero-img"
            onError={(e) => { e.target.src = "/images/hero-temples.jpeg"; }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="blog-detail__body">

        {/* ── Article Content ── */}
        <div className="blog-detail__content">

          <div className="blog-detail__section">
            <div className="blog-detail__section-body">
              {contentBlocks.length > 0 ? (
                contentBlocks.map((block) =>
                  block.type === "text" ? (
                    <p key={block.key} className="blog-detail__section-text" style={{ marginBottom: 16 }}>
                      {block.text}
                    </p>
                  ) : (
                    <img
                      key={block.key}
                      src={block.src}
                      alt={blog.title}
                      className="blog-detail__inline-img"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )
                )
              ) : (
                <p className="blog-detail__section-text">No content available for this article.</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="blog-detail__tags">
              <span className="blog-detail__tags-label">Tags:</span>
              {blog.tags.map((tag) => (
                <span key={tag} className="blog-detail__tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="blog-detail__share">
            <span className="blog-detail__share-label">Share this article:</span>
            <div className="blog-detail__share-btns">
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank" rel="noreferrer"
                className="blog-detail__share-btn fb"
              >
                f
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                target="_blank" rel="noreferrer"
                className="blog-detail__share-btn tw"
              >
                𝕏
              </a>
              <a
                href={`https://wa.me/?text=${window.location.href}`}
                target="_blank" rel="noreferrer"
                className="blog-detail__share-btn wa"
              >
                W
              </a>
              <button className="blog-detail__share-btn cp" onClick={copyLink}>
                <FiLink size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="blog-detail__sidebar">

          {/* Related Articles */}
          {blog.relatedPosts?.length > 0 && (
            <div className="blog-detail__related">
              <h3 className="blog-detail__related-title">Related Articles</h3>
              <div className="blog-detail__related-list">
                {blog.relatedPosts.map((r) => (
                  <Link
                    key={r._id}
                    to={`/blog/${r.slug}`}
                    className="blog-detail__related-item"
                  >
                    <img
                      src={r.thumbnail || "/images/hero-temples.jpeg"}
                      alt={r.title}
                      onError={(e) => { e.target.src = "/images/hero-temples.jpeg"; }}
                    />
                    <div>
                      <p className="blog-detail__related-name">{r.title}</p>
                      {r.category && <span className="blog-detail__related-date">{r.category}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}