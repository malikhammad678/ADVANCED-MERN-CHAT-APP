import { createContext, useContext, useEffect, useState } from "react";
import  axios  from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [token,setToken] = useState(localStorage.getItem('token'))
    const [authUser,setAuthUser] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState([])
    const [socket,setSocket] = useState(null)

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            console.log(`Error in fetching User ${error.response?.data?.message}`)
            toast.error(error.response?.data?.message)
        }
    }


    // Login function to handle user authentication and socket connection

    const login = async (state,credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials )
            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common['token'] = `${data.token}`
                setToken(data.token)
                localStorage.setItem('token', data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(`Error in Login User ${error.response?.data?.message}`)
            toast.error(error.response?.data?.message)
        }
    }

    // logout user

    const logout = async () => {
        try {
            setAuthUser(null)
            setToken(null)
            localStorage.removeItem('token')
            setOnlineUsers([])
            axios.defaults.headers.common['token'] = null
            toast.success('Logged Out Successfuly!')
            socket.disconnect()
        } catch (error) {
             console.log(`Error in Logout User ${error.response?.data?.message}`)
            toast.error(error.response?.data?.message)
        }
    }

    // update user

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/update', body);
            if(data.success){
                setAuthUser(data.user)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(`Error in Updating User ${error.response?.data?.message}`)
            toast.error(error.response?.data?.message)
        }
    }

    // Connect socket function to handle socket connection and online users updates

    const connectSocket = async (userData) => {
        if(!userData || socket?.connected) return
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        })
        newSocket.connect();
        setSocket(newSocket)
        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    const value = {
        axios,
        navigate,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    useEffect(() => {
        if(token){
            axios.defaults.headers.common['token'] = `${token}`
        }
      fetchUser()
    },[])

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext)
}