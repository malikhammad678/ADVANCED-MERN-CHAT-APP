import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Chatcontainer from '../components/Chatcontainer'
import Rightsidebar from '../components/Rightsidebar'

const Home = () => {

    const [selectedUser,setSelectedUser] = useState(false)

  return (
    <div className='h-screen border w-full sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar/>
        <Chatcontainer />
        <Rightsidebar  />
      </div>
    </div>
  )
}

export default Home
