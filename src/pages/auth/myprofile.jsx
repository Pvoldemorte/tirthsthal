import { useState, useEffect } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { motion }              from "framer-motion";
import {
  FiHome, FiChevronRight, FiEdit2, FiSave,
  FiUser, FiMail, FiPhone, FiMapPin,
  FiHeart, FiSettings, FiCamera, FiLock,
  FiGlobe, FiLogOut, FiStar, FiLoader
} from "react-icons/fi";
import { useAuth }        from "../../context/AuthContext";
import { useFavorites }   from "../../context/FavoritesContext";
import {
  updateProfile as updateProfileAPI,
  changePassword as changePasswordAPI,
  updateSettings as updateSettingsAPI,
  deleteAccount as deleteAccountAPI,
} from "../../services/authServices";
import {
  getMyVisitedTemples,
} from "../../services/templeService";
import { getMyReviews } from "../../services/contentService";
import "../../styles/pages/profilePage.css";

const tabs = [
  { id: "profile",   label: "My Profile",   icon: <FiUser />     },
  { id: "favorites", label: "Favorites",    icon: <FiHeart />    },
  { id: "settings",  label: "Settings",     icon: <FiSettings /> },
  { id: "security",  label: "Security",     icon: <FiLock />     },
];

const languages = ["English", "हिंदी", "मराठी", "ગુજરાતી"];

export default function Profile() {
  const navigate          = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { favorites, removeFavorite, loading: favLoading } = useFavorites();

  const [activeTab, setActiveTab] = useState("profile");
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [errMsg,    setErrMsg]    = useState("");

  const [form, setForm] = useState({
    name:     user?.name     || "",
    email:    user?.email    || "",
    phone:    user?.phone    || "",
    city:     user?.city     || "",
    language: user?.language || "English",
    bio:      user?.bio      || "",
  });

  // ── Visited temples & reviews — real backend data ──
  const [visitedTemples, setVisitedTemples] = useState([]);
  const [visitedLoading, setVisitedLoading] = useState(true);
  const [myReviews,      setMyReviews]      = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setVisitedLoading(true);
    getMyVisitedTemples()
      .then(setVisitedTemples)
      .catch((err) => console.error("Failed to load visited temples:", err))
      .finally(() => setVisitedLoading(false));

    setReviewsLoading(true);
    getMyReviews()
      .then(setMyReviews)
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => setReviewsLoading(false));
  }, [user]);

  // ── Settings state — initialized from user, saved to backend ──
  const [notifSettings, setNotifSettings] = useState(
    user?.notificationSettings || {
      festivalReminders: true,
      newTempleAdded:    true,
      reviewReplies:     false,
      weeklyNewsletter:  false,
    }
  );
  const [privacySettings, setPrivacySettings] = useState(
    user?.privacySettings || {
      showFavoritesPublicly: true,
      showReviewsPublicly:   true,
    }
  );
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved,  setSettingsSaved]  = useState(false);

  // ── Password change state ──
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // ── Delete account state ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (field, val) =>
    setForm((p) => ({ ...p, [field]: val }));

  // ── Save profile to backend ──
  const handleSave = async () => {
    setSaving(true);
    setErrMsg("");
    try {
      await updateProfileAPI({
        name:     form.name,
        phone:    form.phone,
        city:     form.city,
        language: form.language,
        bio:      form.bio,
      });
      await refreshUser?.();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle a notification/privacy setting and persist immediately ──
  const handleToggleNotif = async (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    await persistSettings(updated, privacySettings);
  };

  const handleTogglePrivacy = async (key) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] };
    setPrivacySettings(updated);
    await persistSettings(notifSettings, updated);
  };

  const persistSettings = async (notif, privacy) => {
    setSettingsSaving(true);
    try {
      await updateSettingsAPI({ notificationSettings: notif, privacySettings: privacy });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("Please fill in all fields.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await changePasswordAPI(pwForm.current, pwForm.next);
      setPwSuccess("Password updated successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccountAPI();
      logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">

      {/* ── Breadcrumb ── */}
      <div className="profile-page__breadcrumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <span>My Profile</span>
      </div>

      <div className="profile-page__body">

        {/* ── Left Sidebar ── */}
        <aside className="profile-sidebar">

          {/* Avatar */}
          <div className="profile-sidebar__avatar-wrap">
            <div className="profile-sidebar__avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{userInitial}</span>
              }
            </div>
            <button className="profile-sidebar__avatar-edit" title="Avatar upload coming soon">
              <FiCamera size={14} />
            </button>
          </div>

          {/* Name & Email */}
          <h2 className="profile-sidebar__name">{user?.name || "Devotee"}</h2>
          <p className="profile-sidebar__email">{user?.email || ""}</p>

          {/* Badge */}
          <span className="profile-sidebar__badge">
            {user?.role === "admin" ? "🛡️ Admin" : "🙏 Devotee"}
          </span>

          {/* Stats — real numbers */}
          <div className="profile-sidebar__stats">
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">
                {visitedLoading ? "—" : visitedTemples.length}
              </span>
              <span className="profile-sidebar__stat-label">Temples Visited</span>
            </div>
            <div className="profile-sidebar__stat-divider" />
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">
                {favLoading ? "—" : favorites.length}
              </span>
              <span className="profile-sidebar__stat-label">Favorites</span>
            </div>
            <div className="profile-sidebar__stat-divider" />
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">
                {reviewsLoading ? "—" : myReviews.length}
              </span>
              <span className="profile-sidebar__stat-label">Reviews</span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="profile-sidebar__nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-sidebar__nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button className="profile-sidebar__logout" onClick={logout}>
            <FiLogOut size={15} />
            Logout
          </button>

        </aside>

        {/* ── Main Content ── */}
        <main className="profile-main">

          {/* ══ TAB 1 — My Profile ══ */}
          {activeTab === "profile" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              {/* Header */}
              <div className="profile-card__header">
                <h3 className="profile-card__title">Personal Information</h3>
                {editing ? (
                  <button className="profile-card__save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? <FiLoader size={15} className="spin" /> : <FiSave size={15} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <button className="profile-card__edit-btn" onClick={() => setEditing(true)}>
                    <FiEdit2 size={15} /> Edit Profile
                  </button>
                )}
              </div>

              {/* Error */}
              {errMsg && (
                <div className="profile-card__error">⚠️ {errMsg}</div>
              )}

              {/* Success */}
              {saved && (
                <motion.div
                  className="profile-card__success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✅ Profile updated successfully!
                </motion.div>
              )}

              {/* Form */}
              <div className="profile-form">

                {/* Name + Email */}
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label><FiUser size={13} /> Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label><FiMail size={13} /> Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                {/* Phone + City */}
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label><FiPhone size={13} /> Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label><FiMapPin size={13} /> City</label>
                    <input
                      type="text"
                      placeholder="Enter your city"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                </div>

                {/* Language */}
                <div className="profile-form__field">
                  <label><FiGlobe size={13} /> Preferred Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    disabled={!editing}
                    className={editing ? "active" : ""}
                  >
                    {languages.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div className="profile-form__field">
                  <label><FiEdit2 size={13} /> Bio</label>
                  <textarea
                    placeholder="Write something about yourself..."
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    disabled={!editing}
                    className={editing ? "active" : ""}
                    rows={3}
                    maxLength={300}
                  />
                </div>

              </div>

              {/* Recently Visited — real data */}
              <div className="profile-visited">
                <h4 className="profile-visited__title">Recently Visited Temples</h4>

                {visitedLoading ? (
                  <p className="profile-empty-note">Loading...</p>
                ) : visitedTemples.length === 0 ? (
                  <div className="profile-empty-note">
                    <p>You haven't marked any temples as visited yet.</p>
                    <Link to="/temples" className="profile-empty-note__link">Explore Temples →</Link>
                  </div>
                ) : (
                  <div className="profile-visited__list">
                    {visitedTemples.slice(0, 5).map((t) => (
                      <div key={t._id} className="profile-visited__item">
                        <img
                          src={t.images?.[0] || "https://images.unsplash.com/photo-1548013146-72479768bada?w=400"}
                          alt={t.name}
                          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=400"}
                        />
                        <div className="profile-visited__info">
                          <p className="profile-visited__name">{t.name}</p>
                          <p className="profile-visited__loc">
                            <FiMapPin size={11} /> {t.district}, {t.state}
                          </p>
                          <p className="profile-visited__date">
                            {new Date(t.visitedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <Link to={`/temples/${t.slug}`} className="profile-visited__btn">
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* ══ TAB 2 — Favorites ══ */}
          {activeTab === "favorites" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">My Favorite Temples</h3>
                <span className="profile-card__count">{favorites.length} temples</span>
              </div>

              {favLoading ? (
                <p className="profile-empty-note">Loading...</p>
              ) : favorites.length === 0 ? (
                <div className="profile-empty-note">
                  <p>You haven't saved any temples yet.</p>
                  <Link to="/temples" className="profile-empty-note__link">Explore Temples →</Link>
                </div>
              ) : (
                <div className="profile-favorites__grid">
                  {favorites.map((t) => (
                    <div key={t.id} className="profile-fav-card">
                      <div className="profile-fav-card__img">
                        <img src={t.image} alt={t.name}
                          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=400"}
                        />
                        <button
                          className="profile-fav-card__remove"
                          onClick={() => removeFavorite(t.id)}
                          title="Remove from favorites"
                        >
                          <FiHeart size={14} />
                        </button>
                      </div>
                      <div className="profile-fav-card__info">
                        <p className="profile-fav-card__name">{t.name}</p>
                        <p className="profile-fav-card__loc">
                          <FiMapPin size={11} /> {t.location}
                        </p>
                        <Link to={`/temples/${t.slug}`} className="profile-fav-card__btn">
                          View Temple
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}

          {/* ══ TAB 3 — Settings ══ */}
          {activeTab === "settings" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">Settings</h3>
                {settingsSaving && <span className="profile-card__count">Saving...</span>}
                {settingsSaved   && <span className="profile-card__count">✅ Saved</span>}
              </div>

              <div className="profile-settings">

                {/* Notifications */}
                <div className="profile-settings__section">
                  <h4>🔔 Notifications</h4>
                  {[
                    { key: "festivalReminders", label: "Festival Reminders",    sub: "Get notified about upcoming festivals" },
                    { key: "newTempleAdded",    label: "New Temple Added",      sub: "When a new temple is added in your area" },
                    { key: "reviewReplies",     label: "Review Replies",        sub: "When someone replies to your review" },
                    { key: "weeklyNewsletter",  label: "Weekly Newsletter",     sub: "Weekly digest of temple news" },
                  ].map((item) => (
                    <div key={item.key} className="profile-settings__toggle-row">
                      <div>
                        <p className="profile-settings__toggle-label">{item.label}</p>
                        <p className="profile-settings__toggle-sub">{item.sub}</p>
                      </div>
                      <label className="profile-settings__toggle">
                        <input
                          type="checkbox"
                          checked={!!notifSettings[item.key]}
                          onChange={() => handleToggleNotif(item.key)}
                        />
                        <span className="profile-settings__toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>

                {/* Privacy */}
                <div className="profile-settings__section">
                  <h4>🔒 Privacy</h4>
                  {[
                    { key: "showFavoritesPublicly", label: "Show my favorites publicly",  sub: "Others can see your saved temples" },
                    { key: "showReviewsPublicly",   label: "Show my reviews publicly",    sub: "Your reviews are visible to all"   },
                  ].map((item) => (
                    <div key={item.key} className="profile-settings__toggle-row">
                      <div>
                        <p className="profile-settings__toggle-label">{item.label}</p>
                        <p className="profile-settings__toggle-sub">{item.sub}</p>
                      </div>
                      <label className="profile-settings__toggle">
                        <input
                          type="checkbox"
                          checked={!!privacySettings[item.key]}
                          onChange={() => handleTogglePrivacy(item.key)}
                        />
                        <span className="profile-settings__toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>

                {/* Danger Zone */}
                <div className="profile-settings__section profile-settings__danger">
                  <h4>⚠️ Danger Zone</h4>
                  {!showDeleteConfirm ? (
                    <button
                      className="profile-settings__delete-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <div className="profile-settings__delete-confirm">
                      <p>Are you sure? This will permanently delete your account, favorites and reviews. This cannot be undone.</p>
                      <div className="profile-settings__delete-confirm-btns">
                        <button
                          className="profile-settings__delete-btn"
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Yes, Delete Permanently"}
                        </button>
                        <button
                          className="profile-card__edit-btn"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* ══ TAB 4 — Security ══ */}
          {activeTab === "security" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">Security</h3>
              </div>

              <div className="profile-security">

                {/* Change Password */}
                <div className="profile-security__section">
                  <h4>🔑 Change Password</h4>

                  {pwError   && <div className="profile-card__error">⚠️ {pwError}</div>}
                  {pwSuccess && <div className="profile-card__success">✅ {pwSuccess}</div>}

                  <div className="profile-form__field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={pwForm.current}
                      onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={pwForm.next}
                      onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                    />
                  </div>
                  <button
                    className="profile-security__save-btn"
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                  >
                    {pwSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>

                {/* My Reviews — replaces fake login activity with real data */}
                <div className="profile-security__section">
                  <h4>⭐ My Reviews</h4>

                  {reviewsLoading ? (
                    <p className="profile-empty-note">Loading...</p>
                  ) : myReviews.length === 0 ? (
                    <p className="profile-empty-note">You haven't written any reviews yet.</p>
                  ) : (
                    myReviews.map((r) => (
                      <div key={r._id} className="profile-security__activity">
                        <div className="profile-security__activity-icon">
                          <FiStar size={18} style={{ color: "#f59e0b" }} />
                        </div>
                        <div className="profile-security__activity-info">
                          <p className="profile-security__activity-device">
                            {r.temple?.name || "Temple"}
                            <span className="profile-security__activity-current">
                              {r.rating}★
                            </span>
                          </p>
                          <p className="profile-security__activity-meta">
                            {r.comment?.slice(0, 60)}{r.comment?.length > 60 ? "..." : ""}
                          </p>
                        </div>
                        {r.temple?.slug && (
                          <Link to={`/temples/${r.temple.slug}`} className="profile-security__activity-revoke">
                            View
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}