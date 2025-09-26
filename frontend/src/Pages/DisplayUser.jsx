import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from '../Components/Nav/Nav';
import { Link, useNavigate } from "react-router-dom";

function DisplayUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete user
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);
        // Remove deleted user from state
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading) return <h1>Loading users...</h1>;
  if (!users || users.length === 0) return <h1>No user data</h1>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="p-6 flex-1">
        <h1 className="text-3xl font-bold mb-4">User Details</h1>
        {users.map((user) => (
          <div
            key={user._id}
            className="border p-4 rounded-md mb-4 shadow-md bg-gray-100"
          >
            <p><strong>ID:</strong> {user._id}</p>
            <p><strong>First Name:</strong> {user.Fname}</p>
            <p><strong>Last Name:</strong> {user.Lname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age}</p>

            {/* Update button */}
            <Link to={`/displayUser/${user._id}`}>
              <button className="bg-green-600 text-white px-3 py-1 rounded mr-2">
                Update
              </button>
            </Link>

            {/* Delete button */}
            <button
              onClick={() => deleteHandler(user._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayUser;
