import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";

export const getAllUsers = async (req,res) => {
    try {
        const userId = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: userId } }).select('-password');

        const unseenMessages = {}

         const promises = filteredUser.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen:false })
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length
            }
         })
         await Promise.all(promises)
        res.status(200).json({ 
            success:true,
            users:filteredUser,
            unseenMessages
         })

    } catch (error) {
         console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const getMessages = async (req,res) => {
    try {
         const { id:selectedUserId } = req.params;
         const LoggedinUserId = req.user._id;
         const messages = await Message.find({
            $or:[
                { senderId:LoggedinUserId, receiverId:selectedUserId },
                { senderId:selectedUserId, receiverId:LoggedinUserId }
            ]
         })
         await Message.updateMany({  senderId:selectedUserId, receiverId:LoggedinUserId  }, { seen:true })
         res.status(200).json({ success:true, messages })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const markMessageSeen = async (req,res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen:true })
        res.json({ success:true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const sendMessage = async (req,res) => {
    try {
        const { text,image } = req.body;
        const receiverId = req.params.id
        const senderId = req.user._id

          let imageUrl;

          if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
          }

          const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
          })
      
          const receiverSocketId = userSocketMap[receiverId]
          if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
          }

          res.json({ success:true, newMessage })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}