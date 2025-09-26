import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    confirmpassword: "",
    age: ""
  });

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/users", {
        Fname: inputs.Fname,
        Lname: inputs.Lname,
        email: inputs.email,
        password: inputs.password,
        confirmpassword: inputs.confirmpassword,
        age: Number(inputs.age)
      });
      console.log("User added:", res.data);
      navigate("/displayUser"); // redirect to display user page
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user. Check backend server.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add User</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input type="text" name="Fname" value={inputs.Fname} onChange={handleChange} placeholder="First Name" required className="p-2 border rounded" />
        <input type="text" name="Lname" value={inputs.Lname} onChange={handleChange} placeholder="Last Name" required className="p-2 border rounded" />
        <input type="email" name="email" value={inputs.email} onChange={handleChange} placeholder="Email" required className="p-2 border rounded" />
        <input type="password" name="password" value={inputs.password} onChange={handleChange} placeholder="Password" required className="p-2 border rounded" />
        <input type="password" name="confirmpassword" value={inputs.confirmpassword} onChange={handleChange} placeholder="Confirm Password" required className="p-2 border rounded" />
        <input type="number" name="age" value={inputs.age} onChange={handleChange} placeholder="Age" required className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
          Add User
        </button>
      </form>
    </div>
  );
}

export default AddUser;
