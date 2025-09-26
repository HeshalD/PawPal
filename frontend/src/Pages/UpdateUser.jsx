import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UpdateUser({ collapsed }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    confirmpassword: "",
    age: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/${id}`);
        setInputs(res.data.users); // res.data.users contains the user object
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/users/${id}`, {
        ...inputs,
        age: Number(inputs.age),
      });
      navigate("/displayUser"); // redirect back to user list
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="p-6" style={{ marginLeft: collapsed ? "5rem" : "16rem" }}>
      <h1 className="text-3xl font-bold mb-4">Update User</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input type="text" name="Fname" value={inputs.Fname} onChange={handleChange} placeholder="First Name" required className="p-2 border rounded" />
        <input type="text" name="Lname" value={inputs.Lname} onChange={handleChange} placeholder="Last Name" required className="p-2 border rounded" />
        <input type="email" name="email" value={inputs.email} onChange={handleChange} placeholder="Email" required className="p-2 border rounded" />
        <input type="password" name="password" value={inputs.password} onChange={handleChange} placeholder="Password" required className="p-2 border rounded" />
        <input type="password" name="confirmpassword" value={inputs.confirmpassword} onChange={handleChange} placeholder="Confirm Password" required className="p-2 border rounded" />
        <input type="number" name="age" value={inputs.age} onChange={handleChange} placeholder="Age" required className="p-2 border rounded" />
        <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Update User</button>
      </form>
    </div>
  );
}

export default UpdateUser;
