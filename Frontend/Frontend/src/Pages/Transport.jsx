import { useEffect, useState } from "react";
import api from "../ApiClient/api";

const initialForm = {
  routeName: "",
  busNumber: "",
  startLocation: "",
  endLocation: "",
  stops: "",
  departureTime: "",
  arrivalTime: "",
  availableSeats: "",
  status: "Active",
};

function Transport() {
  const [search, setSearch] = useState("");
  const [transports, setTransports] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === "Admin";

  const fetchCurrentUser = async () => {
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

  const fetchTransports = async () => {
    try {
      setError("");

      const response = await api.get("/api/transport/get-transport");

      setTransports(
        Array.isArray(response.data.transports)
          ? response.data.transports
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch transports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchTransports();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...form,
        stops: form.stops
          .split(",")
          .map((stop) => stop.trim())
          .filter(Boolean),
        availableSeats: Number(form.availableSeats),
      };

      const response = editingId
        ? await api.put(
            `/api/transport/update-transport/${editingId}`,
            payload
          )
        : await api.post(
            "/api/transport/create-transport",
            payload
          );

      setMessage(
        response.data.message || "Transport saved successfully."
      );

      resetForm();
      await fetchTransports();
    } catch (err) {
      setError(
        err.response?.data?.message || "Transport operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transport) => {
    if (!isAdmin) return;

    setEditingId(transport._id);

    setForm({
      routeName: transport.routeName || "",
      busNumber: transport.busNumber || "",
      startLocation: transport.startLocation || "",
      endLocation: transport.endLocation || "",
      stops: Array.isArray(transport.stops)
        ? transport.stops.join(", ")
        : "",
      departureTime: transport.departureTime || "",
      arrivalTime: transport.arrivalTime || "",
      availableSeats: String(transport.availableSeats ?? ""),
      status: transport.status || "Active",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this transport route?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/api/transport/delete-transport/${id}`
      );

      if (editingId === id) resetForm();

      setMessage(
        response.data.message || "Transport deleted successfully."
      );

      await fetchTransports();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete transport."
      );
    }
  };

  const filteredTransports = transports.filter((transport) => {
    const searchableText = [
      transport.routeName,
      transport.busNumber,
      transport.startLocation,
      transport.endLocation,
      ...(transport.stops || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  return (
    <div className="page-content transport-page">
      <div className="transport-header">
        <div>
          <span className="section-kicker">CAMPUS SERVICES</span>
          <h1>Campus Transport</h1>
          <p>Explore campus transport routes and available seats.</p>
        </div>
      </div>

      {isAdmin && (
        <section className="transport-form-card">
          <h2>{editingId ? "Update Transport" : "Add New Transport"}</h2>

          <form className="transport-form" onSubmit={handleSubmit}>
            <div className="transport-form-grid">
              <div className="form-group">
                <label>Route Name</label>
                <input
                  name="routeName"
                  value={form.routeName}
                  onChange={handleChange}
                  placeholder="Enter route name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bus Number</label>
                <input
                  name="busNumber"
                  value={form.busNumber}
                  onChange={handleChange}
                  placeholder="Enter bus number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Location</label>
                <input
                  name="startLocation"
                  value={form.startLocation}
                  onChange={handleChange}
                  placeholder="Enter starting location"
                  required
                />
              </div>

              <div className="form-group">
                <label>End Location</label>
                <input
                  name="endLocation"
                  value={form.endLocation}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Stops</label>
                <input
                  name="stops"
                  value={form.stops}
                  onChange={handleChange}
                  placeholder="Enter stops separated by commas"
                />
              </div>

              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  name="departureTime"
                  value={form.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={form.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Available Seats</label>
                <input
                  type="number"
                  name="availableSeats"
                  value={form.availableSeats}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter available seats"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="transport-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transport"
                    : "Create Transport"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="transport-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {error && (
        <p className="transport-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="transport-success" role="status">
          {message}
        </p>
      )}

      <section className="available-transport">
        <div className="transport-list-heading">
          <div>
            <h2>Available Transport Routes</h2>
            <p>Find your route and check its availability.</p>
          </div>

          <span className="transport-count">
            {filteredTransports.length} Routes
          </span>
        </div>

        <input
          className="transport-search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by route, bus or pickup point..."
        />

        {loading && <p>Loading transport routes...</p>}

        {!loading && filteredTransports.length === 0 && (
          <div className="transport-empty">
            <h3>No transport routes found</h3>
            <p>Try another search or add a new route.</p>
          </div>
        )}

        <div className="transport-grid">
          {!loading &&
            filteredTransports.map((transport) => (
              <article className="transport-card" key={transport._id}>
                <div className="transport-card-header">
                  <div>
                    <span className="transport-bus-label">
                      BUS {transport.busNumber}
                    </span>
                    <h3>{transport.routeName}</h3>
                  </div>

                  <span
                    className={`transport-status ${
                      transport.status === "Active" ? "active" : "inactive"
                    }`}
                  >
                    {transport.status}
                  </span>
                </div>

                <div className="transport-route">
                  <div>
                    <span>FROM</span>
                    <strong>{transport.startLocation}</strong>
                  </div>

                  <span className="transport-arrow">→</span>

                  <div>
                    <span>TO</span>
                    <strong>{transport.endLocation}</strong>
                  </div>
                </div>

                <div className="transport-details">
                  <p>
                    <span>Stops</span>
                    <strong>
                      {transport.stops?.join(", ") || "No stops added"}
                    </strong>
                  </p>

                  <p>
                    <span>Departure</span>
                    <strong>{transport.departureTime}</strong>
                  </p>

                  <p>
                    <span>Arrival</span>
                    <strong>{transport.arrivalTime}</strong>
                  </p>

                  <p>
                    <span>Available Seats</span>
                    <strong>{transport.availableSeats}</strong>
                  </p>
                </div>

                {isAdmin && (
                  <div className="transport-card-actions">
                    <button onClick={() => handleEdit(transport)}>
                      Edit
                    </button>

                    <button
                      className="transport-delete-button"
                      onClick={() => handleDelete(transport._id)}
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

export default Transport;
