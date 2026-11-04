
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

function CampusLocations() {
  const { currentUser } = useOutletContext();
  const isAdmin = currentUser?.role === "Admin";

  const API = "http://localhost:5000/api/locations";

  const emptyForm = {
    name: "",
    building: "",
    floor: "",
    room: "",
    category: "",
    description: ""
  };

  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/get`, {
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch locations");
      }

      setLocations(Array.isArray(data.locations) ? data.locations : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const url = editingId
        ? `${API}/update/${editingId}`
        : `${API}/create`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(data.message || "Location saved successfully");
      resetForm();
      await fetchLocations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location._id);

    setForm({
      name: location.name || "",
      building: location.building || "",
      floor: location.floor || "",
      room: location.room || "",
      category: location.category || "",
      description: location.description || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete location");
      }

      setMessage(data.message || "Location deleted successfully");
      await fetchLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredLocations = locations.filter((location) =>
    `${location.name || ""} ${location.building || ""} ${location.room || ""} ${location.floor || ""} ${location.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS DIRECTORY</span>
          <h1>Campus Locations</h1>
          <p>Find important places and facilities around your college.</p>
        </div>
      </div>

      {isAdmin && (
        <section className="location-form-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">ADMINISTRATION</span>
              <h2>{editingId ? "Update Location" : "Add New Location"}</h2>
              <p>Manage important campus places and facilities.</p>
            </div>
          </div>

          <form className="location-form" onSubmit={handleSubmit}>
            <div className="location-form-grid">
              <div className="location-form-group">
                <label>Location Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Placement Cell"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="location-form-group">
                <label>Building Name</label>
                <input
                  type="text"
                  name="building"
                  placeholder="e.g. Building B"
                  value={form.building}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="location-form-group">
                <label>Floor</label>
                <input
                  type="text"
                  name="floor"
                  placeholder="e.g. First Floor"
                  value={form.floor}
                  onChange={handleChange}
                />
              </div>

              <div className="location-form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="room"
                  placeholder="e.g. Room 105"
                  value={form.room}
                  onChange={handleChange}
                />
              </div>

              <div className="location-form-group location-full-width">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Department">Department</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Library">Library</option>
                  <option value="Canteen">Canteen</option>
                  <option value="Office">Office</option>
                  <option value="Medical">Medical</option>
                  <option value="Parking">Parking</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="location-form-group location-full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe this campus location..."
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="location-form-actions">
              <button type="submit" disabled={submitting}>
                {submitting
                  ? "Please wait..."
                  : editingId
                    ? "Update Location"
                    : "Create Location"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {message && <p className="success-message" role="status">{message}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}

      <section className="location-search-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">EXPLORE YOUR CAMPUS</span>
            <h2>Find a Location</h2>
          </div>
          <span>{filteredLocations.length} Locations</span>
        </div>

        <input
          className="location-search-input"
          type="text"
          placeholder="Search by place, building, floor or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {loading && <p>Loading campus locations...</p>}

      {!loading && filteredLocations.length === 0 && (
        <div className="empty-state">
          {locations.length === 0
            ? "No campus locations available yet."
            : "No matching locations found."}
        </div>
      )}

      {!loading && filteredLocations.length > 0 && (
        <section className="location-grid">
          {filteredLocations.map((location) => (
            <article className="location-card" key={location._id}>
              <div className="location-card-top">
                <span className="location-category">
                  {location.category}
                </span>

                <span className="location-pin">⌖</span>
              </div>

              <h2>{location.name}</h2>

              <div className="location-details">
                <p>Building: {location.building}</p>
                {location.floor && <p>Floor: {location.floor}</p>}
                {location.room && <p>Room: {location.room}</p>}
              </div>

              {location.description && (
                <p className="location-description">
                  {location.description}
                </p>
              )}

              {isAdmin && (
                <div className="location-card-actions">
                  <button onClick={() => handleEdit(location)}>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(location._id, location.name)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default CampusLocations;
