import { useEffect, useState } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    eventDate: "",
    targetAudience: "All",
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/events/get-event",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events.");
      }

      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/get-user",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user.");
      }

      setCurrentUser(data.user || data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCurrentUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createEvent = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setCreating(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/events/create-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Event creation failed.");
      }

      setMessage(
        data.message || "Event created successfully!"
      );

      setForm({
        title: "",
        description: "",
        venue: "",
        eventDate: "",
        targetAudience: "All",
      });

      await fetchEvents();
    } catch (err) {
      setError(err.message || "Unable to create event.");
    } finally {
      setCreating(false);
    }
  };

  const canCreate = ["Admin", "Faculty"].includes(currentUser?.role);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = [...events]
    .filter((event) => {
      if (!event.eventDate) return false;

      const eventDate = new Date(event.eventDate);

      return (
        !Number.isNaN(eventDate.getTime()) &&
        eventDate >= today
      );
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate) - new Date(b.eventDate)
    );

  const pastEvents = [...events]
    .filter((event) => {
      if (!event.eventDate) return false;

      const eventDate = new Date(event.eventDate);

      return (
        !Number.isNaN(eventDate.getTime()) &&
        eventDate < today
      );
    })
    .sort(
      (a, b) =>
        new Date(b.eventDate) - new Date(a.eventDate)
    );

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEvent = (event) => (
    <article className="event-card" key={event._id}>
      <h2>{event.title}</h2>

      <p>{event.description}</p>

      <p>
        <strong>Venue:</strong> {event.venue}
      </p>

      <p>
        <strong>Date:</strong> {formatDate(event.eventDate)}
      </p>

      <p>
        <strong>Audience:</strong> {event.targetAudience || "All"}
      </p>

      <p>
        <strong>Organised by:</strong>{" "}
        {event.createdBy?.userName || "Campus Team"}
      </p>
    </article>
  );

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS ACTIVITIES</span>
          <h2>Campus Events</h2>
          <p>
            Discover upcoming activities and events on your campus.
          </p>
        </div>
      </div>

      {canCreate && (
        <section className="event-create-form">
          <h2>Create New Event</h2>

          <form onSubmit={createEvent}>
            <div className="event-form-group">
              <label htmlFor="event-title">Event Title</label>
              <input
                id="event-title"
                type="text"
                name="title"
                placeholder="Enter event title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="event-description">
                Event Description
              </label>
              <textarea
                id="event-description"
                name="description"
                placeholder="Enter event description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="event-venue">Event Venue</label>
              <input
                id="event-venue"
                type="text"
                name="venue"
                placeholder="Enter event venue"
                value={form.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="event-date">Event Date and Time</label>
              <input
                id="event-date"
                type="datetime-local"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="event-audience">Target Audience</label>
              <select
                id="event-audience"
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
              {creating ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </section>
      )}

      {message && (
        <p className="notification-success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="notification-error" role="alert">
          {error}
        </p>
      )}

      <div className="section-heading">
        <div>
          <span className="section-kicker">UPCOMING ACTIVITIES</span>
          <h2>Upcoming Events</h2>
          <p>Explore what's happening next on your campus.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : upcomingEvents.length === 0 ? (
        <p>No upcoming events available yet.</p>
      ) : (
        <div className="event-list">
          {upcomingEvents.map(renderEvent)}
        </div>
      )}

      {pastEvents.length > 0 && (
        <>
          <div className="section-heading">
            <div>
              <span className="section-kicker">PREVIOUS ACTIVITIES</span>
              <h2>Past Events</h2>
              <p>Take a look at previously organised campus events.</p>
            </div>
          </div>

          <div className="event-list">
            {pastEvents.map(renderEvent)}
          </div>
        </>
      )}
    </div>
  );
}
