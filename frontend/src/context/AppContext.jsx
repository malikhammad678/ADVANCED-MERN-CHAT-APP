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
    const [messages,setMessages] = useState([])
    const [users,setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

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

    const updateProfile = async (body) => {
      try {
        const { data } = await axios.put('/api/auth/update-profile', body)
        if(data.success){
            setAuthUser(data.user)
            toast.success(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/message/users')
            if(data.success){
             setUsers(data.users)
             setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
        toast.error(error.message)
        }
    }

    const getMessages = async (id) => {
        try {
            const { data } = await axios.get(`/api/message/${id}`)
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
        toast.error(error.message)
        }
    }

    const sendMessages = async (messageData) => {
      try {
         const { data } = await axios.post(`/api/message/send/${selectedUser._id}`, messageData)
         if(data.success){
             setMessages((prevMessages) => [...prevMessages, data.newMessage])
         }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const subscribeToMessages = async () => {
        try {
            if(!socket) return
            socket.on("newMessage", (newMessage) => {
                if(selectedUser && newMessage.senderId === selectedUser._id){
                    newMessage.seen = true
                    setMessages((prevMessages) => [...prevMessages, newMessage])
                    axios.put(`/api/message/mark/${newMessage._id}`)
                } else {
                    setUnseenMessages((prevUnseenMessages) => ({
                      ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                    }))
                }
            })
        } catch (error) {
        toast.error(error.message)
        }
    }

    const unSubscribeToMessages = async () => {
            if(socket) socket.off("newMessage");
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
        updateProfile,
        users,
        messages,
        selectedUser,
        getUsers,setMessages,
        sendMessages,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages
    }

    useEffect(() => {
        if(token){
            axios.defaults.headers.common['token'] = `${token}`
        }
      fetchUser()
    },[])

    useEffect(() => {
      subscribeToMessages()
      return () => unSubscribeToMessages()
    },[socket, selectedUser])

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext)
}