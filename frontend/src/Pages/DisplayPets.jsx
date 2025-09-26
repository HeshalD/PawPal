import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Components/Nav/Nav";
import { Link, useNavigate } from "react-router-dom";

function DisplayPet() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Fetch pets from backend
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pets");
        setPets(response.data.pets); // Make sure backend sends {pets: [...]}
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Delete pet
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await axios.delete(`http://localhost:5000/pets/${id}`);
        // Remove deleted pet from state
        setPets(pets.filter((pet) => pet._id !== id));
      } catch (error) {
        console.error("Error deleting pet:", error);
      }
    }
  };

  if (loading) return <h1>Loading pets...</h1>;
  if (!pets || pets.length === 0) return <h1>No pet data</h1>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="p-6 flex-1">
        <h1 className="text-3xl font-bold mb-4">Pet Details</h1>
        {pets.map((pet) => (
          <div
            key={pet._id}
            className="border p-4 rounded-md mb-4 shadow-md bg-gray-100"
          >
            <p><strong>ID:</strong> {pet._id}</p>
            <p><strong>Name:</strong> {pet.name}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>

            {/* Update button */}
            <Link to={`/displayPet/${pet._id}`}>
              <button className="bg-green-600 text-white px-3 py-1 rounded mr-2">
                Update
              </button>
            </Link>

            {/* Delete button */}
            <button
              onClick={() => deleteHandler(pet._id)}
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

export default DisplayPet;
