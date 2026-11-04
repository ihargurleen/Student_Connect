import { useEffect, useState } from "react";
import api from "../ApiClient/api";

const initialFormData = {
  title: "",
  category: "",
  location: "",
  description: "",
  status: "Open",
};

function ReportIssue() {
  const [formData, setFormData] = useState(initialFormData);
  const [issues, setIssues] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchIssues = async () => {
    try {
      setFetching(true);

      const response = await api.get("/api/issues/get-issue");

      setIssues(
        Array.isArray(response.data.issues)
          ? response.data.issues
          : []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to fetch issues."
      );
      setIsError(true);
    } finally {
      setFetching(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/get-user");
      setCurrentUser(response.data.user || response.data);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchCurrentUser();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const isEditing = Boolean(editingId);

      const response = isEditing
        ? await api.put(
            `/api/issues/update-issue/${editingId}`,
            formData
          )
        : await api.post("/api/issues/create-issue", formData);

      setMessage(
        response.data.message ||
          (isEditing
            ? "Issue updated successfully!"
            : "Issue reported successfully!")
      );

      setFormData(initialFormData);
      setEditingId(null);
      await fetchIssues();
    } catch (error) {
      setMessage(error.response?.data?.message || "Request failed.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (issue) => {
    setEditingId(issue._id);

    setFormData({
      title: issue.title || "",
      category: issue.category || "",
      location: issue.location || "",
      description: issue.description || "",
      status: issue.status || "Open",
    });

    setMessage("");
    setIsError(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setMessage("");
    setIsError(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setIsError(false);

      const response = await api.delete(
        `/api/issues/delete-issue/${id}`
      );

      if (editingId === id) {
        cancelEdit();
      }

      setMessage(response.data.message || "Issue deleted successfully!");
      await fetchIssues();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete issue."
      );
      setIsError(true);
    }
  };

  const isAdmin = currentUser?.role === "Admin";

  const getStatusClass = (status) => {
    if (status === "Resolved") return "resolved";
    if (status === "In Progress") return "in-progress";
    return "open";
  };

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS SUPPORT</span>
          <h1>{editingId ? "Update Issue" : "Report an Issue"}</h1>
          <p>Report campus problems and help improve your college.</p>
        </div>
      </div>

      <section className="issue-form-section">
        <div className="section-heading">
          <div>
            <h2>{editingId ? "Edit Report" : "Submit a New Report"}</h2>
            <p>Provide details about the problem you are facing.</p>
          </div>
        </div>

        <form className="issue-form" onSubmit={handleSubmit}>
          <div className="issue-form-grid">
            <div className="issue-form-group">
              <label htmlFor="title">Issue Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Classroom light not working"
                required
              />
            </div>

            <div className="issue-form-group">
              <label htmlFor="category">Issue Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Classroom">Classroom</option>
                <option value="Library">Library</option>
                <option value="Hostel">Hostel</option>
                <option value="WiFi">WiFi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="issue-form-group issue-full-width">
              <label htmlFor="location">Campus Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Building name and room number"
                required
              />
            </div>

            <div className="issue-form-group issue-full-width">
              <label htmlFor="description">Issue Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the problem in detail..."
                rows={4}
                required
              />
            </div>

            {editingId && (
              <div className="issue-form-group issue-full-width">
                <label htmlFor="status">Issue Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}
          </div>

          <div className="issue-form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : editingId
                  ? "Update Issue"
                  : "Submit Issue"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {message && (
        <p
          className={isError ? "error-message" : "success-message"}
          role="status"
        >
          {message}
        </p>
      )}

      <section className="issue-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">CAMPUS REPORTS</span>
            <h2>Reported Issues</h2>
          </div>
          <span>{issues.length} Reports</span>
        </div>

        {fetching && <p>Loading reported issues...</p>}

        {!fetching && issues.length === 0 && (
          <div className="empty-state">
            No issues reported yet.
          </div>
        )}

        {!fetching && issues.length > 0 && (
          <div className="issue-grid">
            {issues.map((issue) => (
              <article className="issue-card" key={issue._id}>
                <div className="issue-card-top">
                  <span className="issue-category">
                    {issue.category}
                  </span>

                  <span
                    className={`issue-status ${getStatusClass(issue.status)}`}
                  >
                    {issue.status || "Open"}
                  </span>
                </div>

                <h3>{issue.title}</h3>

                <div className="issue-details">
                  <p>
                    <strong>Location:</strong> {issue.location}
                  </p>
                  <p>
                    <strong>Description:</strong> {issue.description}
                  </p>
                  <p>
                    <strong>Reported by:</strong>{" "}
                    {issue.reportedBy?.userName || "Unknown"}
                  </p>
                </div>

                {isAdmin && (
                  <div className="issue-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(issue)}
                    >
                      Edit / Update
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(issue._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ReportIssue;
