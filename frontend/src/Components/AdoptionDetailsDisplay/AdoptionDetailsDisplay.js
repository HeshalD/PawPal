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
                    <div key={index}>
                        <p>Name: {item.name}</p>
                        <p>Gmail: {item.gmail}</p>
                        <p>Age: {item.age}</p>
                        <hr />
                    </div>
                ))
            )}
        </div>
    )
}

export default AdoptionDetailsDisplay
