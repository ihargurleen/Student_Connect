import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  UserPlus,
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";
import api from "../ApiClient/api";

function AddUser() {
  const { currentUser } = useOutletContext();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "Faculty",
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchUsers = async () => {
    setUsersLoading(true);

    try {
      setError("");

      const response = await api.get("/api/admin/users");

      const data = response.data;

      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/api/admin/create-user",
        formData
      );

      setMessage(
        response.data.message || "Account created successfully."
      );

      setFormData({
        userName: "",
        email: "",
        password: "",
        role: "Faculty",
      });

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setError("");
    setMessage("");
    setUpdatingId(userId);

    try {
      const response = await api.put(
        `/api/admin/users/${userId}/role`,
        { role }
      );

      setMessage(
        response.data.message || "User role updated successfully."
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update role."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (userId, userName, email) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName} (${email})?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(userId);

    try {
      const response = await api.delete(
        `/api/admin/users/${userId}`
      );

      setMessage(
        response.data.message || "User deleted successfully."
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete user."
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.userName} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page-content manage-users-page">
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            ADMINISTRATION
          </div>

          <h1>
            Manage Users
            <br />
            <span>Create campus accounts.</span>
          </h1>

          <p className="welcome-description">
            Add and manage members of your campus community.
          </p>
        </div>

        <div className="date-card">
          <div className="date-icon">
            <Users size={20} />
          </div>

          <div>
            <span>USER MANAGEMENT</span>
            <strong>{users.length} Total Users</strong>
          </div>
        </div>
      </section>

      {message && (
        <p className="user-success-message">{message}</p>
      )}

      {error && (
        <p className="user-error-message">{error}</p>
      )}

      <section className="user-form-section">
        <div className="user-form-heading">
          <div className="overview-icon">
            <UserPlus size={23} />
          </div>

          <div>
            <h2>Create New Account</h2>
            <p>Register a new campus member.</p>
          </div>
        </div>

        <form className="user-create-form" onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="user-form-group">
              <label htmlFor="userName">Full Name</label>
              <input
                id="userName"
                name="userName"
                type="text"
                placeholder="Enter full name"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="hero-button user-submit-button"
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </section>

      <section className="user-form-section">
        <div className="user-form-heading">
          <div className="overview-icon">
            <Users size={23} />
          </div>

          <div>
            <h2>All Campus Users</h2>
            <p>Search, update roles and delete accounts.</p>
          </div>
        </div>

        <div className="user-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            onClick={fetchUsers}
            disabled={usersLoading}
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {usersLoading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="user-table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Update Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const userId = user._id || user.id;

                  const isCurrentUser =
                    String(userId) === String(currentUserId);

                  return (
                    <tr key={userId}>
                      <td>
                        {user.userName}
                        {isCurrentUser && " (You)"}
                      </td>

                      <td>{user.email}</td>

                      <td>{user.role}</td>

                      <td>
                        <select
                          value={user.role}
                          disabled={
                            isCurrentUser || updatingId === userId
                          }
                          onChange={(e) =>
                            handleRoleChange(userId, e.target.value)
                          }
                        >
                          <option value="Student">Student</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                        </select>

                        {updatingId === userId && (
                          <span> Updating...</span>
                        )}

                        {isCurrentUser && (
                          <span> Your account</span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              userId,
                              user.userName,
                              user.email
                            )
                          }
                          disabled={
                            isCurrentUser || deletingId === userId
                          }
                        >
                          <Trash2 size={16} />

                          {deletingId === userId
                            ? "Deleting..."
                            : isCurrentUser
                              ? "Your Account"
                              : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="support-panel user-info-panel">
        <div className="support-icon">
          <ShieldCheck size={23} />
        </div>

        <span className="section-kicker">
          SECURE USER MANAGEMENT
        </span>

        <h2>Admin-controlled access.</h2>

        <p>
          Only authorized administrators can manage campus accounts.
        </p>
      </section>
    </div>
  );
}

export default AddUser;
