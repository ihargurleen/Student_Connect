import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/resource";
const SERVER = "http://localhost:5000";

const initialForm = {
  title: "",
  description: "",
  subject: "",
  semester: "1",
  resourceType: "Notes",
  resourceUrl: "",
};

const allowedExtensions = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx",
  ".jpg", ".jpeg", ".png", ".webp",
];

function StudyResources() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [resources, setResources] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [resourceFile, setResourceFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canManage = ["Admin", "Faculty"].includes(user?.role);

  const fetchUser = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/get-user",
        { credentials: "include" }
      );

      if (!response.ok) return;

      const data = await response.json();
      setUser(data.user || data);
    } catch {
      setUser(null);
    }
  };

  const fetchResources = async () => {
    try {
      setError("");

      const response = await fetch(`${API}/get-resource`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch resources.");
      }

      setResources(Array.isArray(data.resources) ? data.resources : []);
    } catch (err) {
      setError(err.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchResources();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "resourceType" ? { resourceUrl: "" } : {}),
    }));

    if (name === "resourceType") {
      setResourceFile(null);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setResourceFile(null);
      return;
    }

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please select a supported file type.");
      event.target.value = "";
      setResourceFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      event.target.value = "";
      setResourceFile(null);
      return;
    }

    setError("");
    setResourceFile(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setResourceFile(null);
    setEditingId(null);

    const fileInput = document.getElementById("resourceFile");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const isEditing = Boolean(editingId);

      if (form.resourceType === "Link" && !form.resourceUrl.trim()) {
        throw new Error("Please enter the resource URL.");
      }

      if (
        form.resourceType !== "Link" &&
        !resourceFile &&
        !isEditing
      ) {
        throw new Error("Please select a resource file.");
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(
          key,
          key === "resourceUrl" && form.resourceType !== "Link" ? "" : value
        );
      });

      if (resourceFile) {
        formData.append("resourceFile", resourceFile);
      }

      const response = await fetch(
        isEditing
          ? `${API}/update-resource/${editingId}`
          : `${API}/create-resource`,
        {
          method: isEditing ? "PUT" : "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save resource.");
      }

      setMessage(data.message || "Resource saved successfully.");
      resetForm();
      await fetchResources();
    } catch (err) {
      setError(err.message || "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => {
    setForm({
      title: resource.title || "",
      description: resource.description || "",
      subject: resource.subject || "",
      semester: String(resource.semester || 1),
      resourceType: resource.resourceType || "Notes",
      resourceUrl:
        resource.resourceType === "Link"
          ? resource.resourceUrl || ""
          : "",
    });

    setResourceFile(null);
    setEditingId(resource._id);
    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/delete-resource/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete resource.");
      }

      if (editingId === id) resetForm();

      setMessage(data.message || "Resource deleted successfully.");
      await fetchResources();
    } catch (err) {
      setError(err.message || "Unable to delete resource.");
    }
  };

  const getResourceUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${SERVER}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const filteredResources = resources.filter((resource) => {
    const text = `
      ${resource.title || ""}
      ${resource.subject || ""}
      ${resource.description || ""}
    `.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (category === "All" || resource.resourceType === category)
    );
  });

  const resourceTypes = [
    ...new Set(
      resources.map((resource) => resource.resourceType).filter(Boolean)
    ),
  ];

  return (
    <div className="page-content resources-page">
      <div className="resources-header">
        <div>
          <span className="section-kicker">LEARNING CENTER</span>
          <h1>Study Resources</h1>
          <p>Explore learning materials to support your studies.</p>
        </div>
        <div className="resources-total">
          <span>Total Resources</span>
          <strong>{resources.length}</strong>
        </div>
      </div>

      {canManage && (
        <section className="resource-form-card">
          <div className="resource-section-heading">
            <div>
              <span className="section-kicker">RESOURCE MANAGEMENT</span>
              <h2>{editingId ? "Edit Resource" : "Add Study Resource"}</h2>
            </div>
          </div>

          <form className="resource-form" onSubmit={handleSubmit}>
            <div className="resource-form-group">
              <label htmlFor="title">Resource Title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter resource title"
                required
              />
            </div>

            <div className="resource-form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enter subject name"
                required
              />
            </div>

            <div className="resource-form-group resource-full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a short description"
                required
              />
            </div>

            <div className="resource-form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

            <div className="resource-form-group">
              <label htmlFor="resourceType">Resource Type</label>
              <select
                id="resourceType"
                name="resourceType"
                value={form.resourceType}
                onChange={handleChange}
                required
              >
                <option value="Notes">Notes</option>
                <option value="PDF">PDF</option>
                <option value="Link">Link</option>
                <option value="Assignment">Assignment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {form.resourceType === "Link" ? (
              <div className="resource-form-group resource-full-width">
                <label htmlFor="resourceUrl">Resource URL</label>
                <input
                  id="resourceUrl"
                  type="url"
                  name="resourceUrl"
                  value={form.resourceUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
            ) : (
              <div className="resource-form-group resource-full-width">
                <label htmlFor="resourceFile">Upload Resource File</label>
                <input
                  id="resourceFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  required={!editingId}
                />
                <p className="resource-help-text">
                  PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, WEBP · Maximum 10 MB
                </p>

                {resourceFile && (
                  <p className="resource-selected-file">
                    Selected: {resourceFile.name}
                  </p>
                )}

                {editingId && !resourceFile && (
                  <p className="resource-help-text">
                    Current file will be kept if you don't select a new one.
                  </p>
                )}
              </div>
            )}

            <div className="resource-form-actions resource-full-width">
              <button
                className="resource-submit-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Resource"
                    : "Add Resource"}
              </button>

              {editingId && (
                <button
                  className="resource-cancel-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {message && (
        <p className="resource-success" role="status">{message}</p>
      )}

      {error && (
        <p className="resource-error" role="alert">{error}</p>
      )}

      <section className="available-resources">
        <div className="resource-list-heading">
          <div>
            <span className="section-kicker">YOUR LEARNING MATERIAL</span>
            <h2>Available Resources</h2>
          </div>
          <span className="resource-count">
            {filteredResources.length} Resources
          </span>
        </div>

        <div className="resource-filters">
          <div className="resource-filter-group">
            <label htmlFor="resource-search">Search resources</label>
            <input
              id="resource-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject or description"
            />
          </div>

          <div className="resource-filter-group">
            <label htmlFor="resource-category">Resource Type</label>
            <select
              id="resource-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All Resources</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="resource-empty">Loading study resources...</p>
        )}

        {!loading && filteredResources.length === 0 && (
          <p className="resource-empty">
            {resources.length === 0
              ? "No study resources available yet."
              : "No matching resources found."}
          </p>
        )}

        <div className="resource-grid">
          {!loading && filteredResources.map((resource) => (
            <article className="resource-card" key={resource._id}>
              <div className="resource-card-top">
                <span className="resource-type-badge">
                  {resource.resourceType}
                </span>
                <span className="resource-semester-badge">
                  Semester {resource.semester}
                </span>
              </div>

              <h3 className="resource-card-title">{resource.title}</h3>

              <p className="resource-card-description">
                {resource.description}
              </p>

              <div className="resource-card-details">
                <p><strong>Subject:</strong> {resource.subject}</p>
                <p>
                  <strong>Uploaded by:</strong>{" "}
                  {resource.uploadedBy?.userName || "Unknown"}
                </p>
              </div>

              <div className="resource-card-footer">
                {resource.resourceUrl && (
                  <a
                    className="resource-open-button"
                    href={getResourceUrl(resource.resourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.resourceType === "Link"
                      ? "Open Resource"
                      : "View / Download"}
                  </a>
                )}

                {canManage && (
                  <div className="resource-card-actions">
                    <button
                      className="resource-edit-button"
                      type="button"
                      onClick={() => handleEdit(resource)}
                    >
                      Edit
                    </button>
                    <button
                      className="resource-delete-button"
                      type="button"
                      onClick={() => handleDelete(resource._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudyResources;
