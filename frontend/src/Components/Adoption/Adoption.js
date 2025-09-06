import React from 'react'

function Adoption(props) {
    const {name,gmial,age} = props.Adoption;
  return (
    <div>
      <h1>Adoption Details</h1>
      <br></br>
      <h1>Name:{name}</h1>
        <h1>Gmail:{gmial}</h1>
      <h1>Age:{age}</h1>
      <button>Update</button>
      <button>Delete</button>


    </div>
  )
}

export default Adoption
