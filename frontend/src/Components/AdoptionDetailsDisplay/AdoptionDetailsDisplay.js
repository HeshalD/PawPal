import React, { useEffect, useState } from 'react'
import axios from "axios";

const URL = "http://localhost:5001/adoptions";

const fetchHandler = async () => {
    return await axios.get(URL).then((res) => res.data);
}

function AdoptionDetailsDisplay() {
    const [adoption, setAdoption] = useState([]);

    useEffect(() => {
    fetchHandler().then((data) => {
        console.log(data); // Check what is logged here
        setAdoption(data.adoptions); // <-- use 'adoptions' not 'adoption'
    });
}, []);
    return (
        <div>
            <h1>Adoption Details Display Page</h1>
            {!adoption || adoption.length === 0 ? (
                <p>Loading...</p>
            ) : (
                adoption.map((item, index) => (
                    <div key={index} style={{ 
                        border: '1px solid #ccc', 
                        padding: '20px', 
                        margin: '10px 0', 
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <h3>Adoption Request #{index + 1}</h3>
                        <p><strong>Full Name:</strong> {item.fullName}</p>
                        <p><strong>Email:</strong> {item.email}</p>
                        <p><strong>Age:</strong> {item.age}</p>
                        <p><strong>Phone:</strong> {item.phone}</p>
                        <p><strong>Address:</strong> {item.address}</p>
                        <p><strong>Monthly Salary:</strong> ${item.salary?.toLocaleString()}</p>
                        <div>
                            <strong>Selected Pets:</strong>
                            <ul>
                                {item.selectedPets && item.selectedPets.length > 0 ? (
                                    item.selectedPets.map((pet, petIndex) => (
                                        <li key={petIndex}>{pet}</li>
                                    ))
                                ) : (
                                    <li>No pets selected</li>
                                )}
                            </ul>
                        </div>
                        <hr style={{ margin: '15px 0' }} />
                    </div>
                ))
            )}
        </div>
    )
}

export default AdoptionDetailsDisplay
