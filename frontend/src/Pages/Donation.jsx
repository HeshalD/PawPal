
import React,{useState} from "react";
import Nav from '../Components/Nav/Nav'

function Donation() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="p-6">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      <h1>Donation UI</h1>
    </div>
  )
}

export default Donation
