import { useEffect, useState } from "react";
import api from "../ApiClient/api";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "All",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/api/announcements/get-ann");

      setAnnouncements(
        Array.isArray(response.data.annoucements)
          ? response.data.annoucements
          : []
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/get-user");
      setCurrentUser(response.data.user || response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch user."
      );
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchCurrentUser();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createAnnouncement = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/api/announcements/create-ann",
        form
      );

      setSuccess(
        response.data.message || "Announcement created successfully!"
      );

      setForm({
        title: "",
        message: "",
        targetAudience: "All",
      });

      await fetchAnnouncements();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create announcement."
      );
    } finally {
      setCreating(false);
    }
  };

  const canCreate = ["Admin", "Faculty"].includes(currentUser?.role);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS COMMUNICATION</span>
          <h2>Announcements</h2>
          <p>Stay updated with the latest campus announcements.</p>
        </div>
      </div>

      {canCreate && (
        <section className="announcement-form-section">
          <h2>Create Announcement</h2>

          <form onSubmit={createAnnouncement}>
            <div className="announcement-form-group">
              <label htmlFor="title">Announcement Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div className="announcement-form-group">
              <label htmlFor="message">Announcement Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Enter announcement message"
                required
                rows={4}
              />
            </div>

            <div className="announcement-form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={form.targetAudience}
                onChange={handleChange}
              >
                <option value="All">All Users</option>
                <option value="Student">Students</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Announcement"}
            </button>
          </form>
        </section>
      )}

      {error && (
        <p className="notification-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="notification-success" role="status">
          {success}
        </p>
      )}

      <div className="section-heading">
        <div>
          <span className="section-kicker">LATEST UPDATES</span>
          <h2>All Announcements</h2>
          <p>Important updates from your campus.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements available yet.</p>
      ) : (
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <article className="announcement-card" key={announcement._id}>
              <h2>{announcement.title}</h2>
              <p>{announcement.message}</p>

              <p>
                Posted by:{" "}
                {announcement.createdBy?.userName || "Campus Admin"}
              </p>

              <p>Audience: {announcement.targetAudience || "All"}</p>

              <p>{formatDate(announcement.createdAt)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
