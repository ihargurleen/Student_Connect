
import { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const [form, setForm] = useState({
    recipientRole: "",
    title: "",
    message: "",
    type: "General"
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/notification/my-notifications",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications.");
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/get-user",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user.");
      }

      setCurrentUser(data.user || data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCurrentUser();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const createNotification = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/notification/create-notification",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create notification.");
      }

      setMessage(data.message || "Notification sent successfully!");

      setForm({
        recipientRole: "",
        title: "",
        message: "",
        type: "General"
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/notification/mark-read/${id}`,
        {
          method: "PUT",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as read.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, isRead: true }
            : item
        )
      );

      setMessage("Notification marked as read.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId("");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((item) => !item.isRead);

    if (unread.length === 0) return;

    try {
      setMarkingAll(true);
      setError("");
      setMessage("");

      for (const item of unread) {
        const response = await fetch(
          `http://localhost:5000/api/notification/mark-read/${item._id}`,
          {
            method: "PUT",
            credentials: "include"
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update notification.");
        }

        setNotifications((current) =>
          current.map((notification) =>
            notification._id === item._id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }

      setMessage("All notifications marked as read.");
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/notification/delete-notification/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification.");
      }

      setNotifications((current) =>
        current.filter((item) => item._id !== id)
      );

      setMessage("Notification deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId("");
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications = sortedNotifications.filter((item) => {
    if (filter === "Unread") return !item.isRead;
    if (filter === "Read") return item.isRead;
    return true;
  });

  const isAdmin = currentUser?.role === "Admin";

  return (
    <div className="page-content notifications-page">

      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay informed about campus updates and activities.</p>
        </div>

        <div className="unread-counter">
          <span>{unreadCount}</span>
          <small>Unread Notifications</small>
        </div>
      </div>

      {isAdmin && (
        <section className="notification-create-section">
          <h2>Create Notification</h2>

          <form onSubmit={createNotification}>
            <label htmlFor="recipientRole">Recipient</label>

            <select
              id="recipientRole"
              name="recipientRole"
              value={form.recipientRole}
              onChange={handleChange}
              required
            >
              <option value="">Select Recipient</option>
              <option value="Student">All Students</option>
              <option value="Faculty">All Faculty</option>
              <option value="Staff">All Staff</option>
              <option value="Everyone">Everyone</option>
            </select>

            <label htmlFor="title">Title</label>

            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter notification title"
              required
            />

            <label htmlFor="notification-message">Message</label>

            <textarea
              id="notification-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Enter notification message"
              required
            />

            <label htmlFor="type">Notification Type</label>

            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="General">General</option>
              <option value="Announcement">Announcement</option>
              <option value="Event">Event</option>
              <option value="Issue">Issue</option>
              <option value="LostFound">Lost & Found</option>
              <option value="Resource">Resource</option>
              <option value="Transport">Transport</option>
            </select>

            <button type="submit" disabled={creating}>
              {creating ? "Sending..." : "Send Notification"}
            </button>
          </form>
        </section>
      )}

      <div className="notifications-list-header">
        <div>
          <h2>My Notifications</h2>
          <p>{notifications.length} total notifications</p>
        </div>

        <div className="notification-actions">
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={loading || unreadCount === 0 || markingAll}
          >
            {markingAll ? "Updating..." : "Mark All as Read"}
          </button>
        </div>
      </div>

      <div className="notification-filter">
        <label htmlFor="filter">Filter:</label>

        <select
          id="filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="All">All Notifications</option>
          <option value="Unread">Unread</option>
          <option value="Read">Read</option>
        </select>
      </div>

      {error && <p role="alert" className="notification-error">{error}</p>}

      {message && <p role="status" className="notification-success">{message}</p>}

      {loading && <p>Loading notifications...</p>}

      {!loading && filteredNotifications.length === 0 && (
        <div className="empty-notifications">
          <h3>No notifications found</h3>
          <p>You're all caught up!</p>
        </div>
      )}

      {!loading && filteredNotifications.length > 0 && (
        <section className="notifications-list">
          {filteredNotifications.map((notification) => (
            <article
              key={notification._id}
              className={`notification-card ${
                notification.isRead ? "read" : "unread"
              }`}
            >
              <div className="notification-card-top">
                <div>
                  <span className="notification-type">
                    {notification.type === "LostFound"
                      ? "Lost & Found"
                      : notification.type}
                  </span>

                  <h3>{notification.title}</h3>
                </div>

                <span className={`notification-status ${
                  notification.isRead ? "read-status" : "unread-status"
                }`}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
              </div>

              <p>{notification.message}</p>

              <small>
                {new Date(notification.createdAt).toLocaleString()}
              </small>

              <div className="notification-card-actions">
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification._id)}
                    disabled={processingId === notification._id}
                  >
                    Mark as Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteNotification(notification._id)}
                  disabled={processingId === notification._id}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Notifications;
