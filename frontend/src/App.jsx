
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
const App = () => {

  const { authUser } = useAppContext()

  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain ">
      <Routes>
        <Route path='/' element={ authUser ? <Home /> : <Navigate to={"/login"} /> } />
        <Route path='/login' element={ !authUser ? <Login /> : <Navigate to={"/"} /> } />
        <Route path='/profile' element={ authUser ? <Profile /> : <Navigate to={"/login"} /> } />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
