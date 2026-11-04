import { useEffect, useState } from "react";
import api from "../ApiClient/api";

const initialForm = {
  title: "",
  description: "",
  category: "Lost",
  location: "",
  date: new Date().toISOString().split("T")[0],
  status: "Open",
};

function LostFound() {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/auth/get-user");
      setCurrentUser(
        response.data.user || response.data.currentUser || response.data
      );
    } catch (err) {
      setCurrentUser(null);
      setError(
        err.response?.data?.message || "Unable to fetch user."
      );
    }
  };

  const fetchItems = async () => {
    try {
      setError("");

      const response = await api.get("/api/lostFound/get-lost");

      setItems(
        Array.isArray(response.data.items) ? response.data.items : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load items."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchItems();
  }, []);

  const getUserId = (user) => {
    return user?._id || user?.id;
  };

  const canManageItem = (item) => {
    if (!currentUser) return false;

    if (currentUser.role === "Admin") return true;

    const currentUserId = getUserId(currentUser);
    const reporterId = getUserId(item.reportedBy);

    return (
      currentUserId &&
      reporterId &&
      String(currentUserId) === String(reporterId)
    );
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing = Boolean(editingId);

      const response = isEditing
        ? await api.put(
            `/api/lostFound/update-lost/${editingId}`,
            form
          )
        : await api.post("/api/lostFound/create-lost", form);

      setMessage(response.data.message || "Item saved successfully.");

      resetForm();
      await fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    if (!canManageItem(item)) return;

    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "Lost",
      location: item.location || "",
      date: item.date
        ? String(item.date).split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: item.status || "Open",
    });

    setEditingId(item._id);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (item) => {
    if (!canManageItem(item)) return;

    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await api.delete(
        `/api/lostFound/delete-lost/${item._id}`
      );

      setMessage(response.data.message || "Item deleted successfully.");

      if (editingId === item._id) {
        resetForm();
      }

      await fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete item."
      );
    }
  };

  const filteredItems =
    filter === "All"
      ? items
      : items.filter(
          (item) =>
            item.category?.toLowerCase() === filter.toLowerCase()
        );

  return (
    <div className="page-content lost-found-page">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS COMMUNITY</span>
          <h1>Lost &amp; Found</h1>
          <p>Report lost belongings or help someone find their items.</p>
        </div>
      </div>

      <section className="lost-form-card">
        <h2>{editingId ? "Edit Item" : "Report an Item"}</h2>

        <form onSubmit={handleSubmit} className="lost-found-form">
          <div className="lost-form-grid">
            <div className="form-group">
              <label htmlFor="title">Item Title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Student ID Card"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Where was it lost or found?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item..."
                rows="4"
                required
              />
            </div>

            {editingId && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Open">Open</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            )}
          </div>

          <div className="lost-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Item"
                  : "Report Item"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <section className="lost-items-section">
        <div className="lost-items-heading">
          <div>
            <span className="section-kicker">CAMPUS REPORTS</span>
            <h2>Reported Items</h2>
          </div>

          <select
            className="lost-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter items"
          >
            <option value="All">All Items</option>
            <option value="Lost">Lost Items</option>
            <option value="Found">Found Items</option>
          </select>
        </div>

        {loading && <p>Loading items...</p>}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="empty-state">
            {items.length === 0
              ? "No Lost & Found items available yet."
              : "No items found for this filter."}
          </div>
        )}

        <div className="lost-items-grid">
          {!loading &&
            filteredItems.map((item) => (
              <article className="lost-item-card" key={item._id}>
                <div className="lost-item-top">
                  <span
                    className={`lost-category ${
                      item.category?.toLowerCase() === "found"
                        ? "found"
                        : "lost"
                    }`}
                  >
                    {item.category}
                  </span>

                  <span className="lost-status">
                    {item.status || "Open"}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <p className="lost-description">{item.description}</p>

                <div className="lost-item-details">
                  <p>
                    <strong>Location:</strong> {item.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Reported by:</strong>{" "}
                    {item.reportedBy?.userName || "Unknown"}
                  </p>
                </div>

                {canManageItem(item) && (
                  <div className="lost-item-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

export default LostFound;
