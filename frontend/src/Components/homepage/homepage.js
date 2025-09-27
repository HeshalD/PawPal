import React from 'react'
import Sidepanal from '../sidepanal/sidepanal'

function Homepage() {
  return (
    <div className="flex">
      <Sidepanal />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">homepage</h1>
      </main>
    </div>
  )
}

export default Homepage
