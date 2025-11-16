import React, { useEffect, useState } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // track loading
  const [error, setError] = useState(null);     // track fetch errors

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("API response:", data); // debug
        // handle both array or { success, users } response
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch users error:", err);
        setError("Failed to fetch users.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  if (!users.length) return <p>No users found.</p>;

  return (
    <div className="user-management">
      <h2>View All Users</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id || u.id}>
              <td>{u.fullname || u.name || "-"}</td>
              <td>{u.email || "-"}</td>
              <td>{u.username || "-"}</td>
              <td>{u.role || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
