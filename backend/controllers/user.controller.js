import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'

export const signup = async (req,res) => {
    try {
        const { fullName, email, password, bio } = req.body;
        if(!fullName || !email || !password || !bio){
            return res.status(400).json( { success:false, message:"Please fill in all the fields!" })
        }
        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(400).json( { success:false, message:"User Already Exist!" })
        }
        if(password.length < 6) {
            return res.status(400).json({ success:false, message:"Password should be 6 character long!" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const user = await User.create({
            fullName,
            email,
            password:hashedPassword,
            bio
        })
        const token = await generateToken(user._id)

        res.status(200).json({
            success:true,
            message:"User Registered Successfully!",
            userData:user,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const login = async (req,res) => {
    try {
        const { email,password } = req.body;
        if(!email || !password){
            return res.status(400).json( { success:false, message:"Please fill in all the fields!" }) 
        }
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid Credentials"
            })
        }
       
            const checkedPassword = await bcrypt.compare(password, user.password)
            if(!checkedPassword){
                return res.status(404).json({ success:false, message:"Invalid Credentials!" })
            }

         const token = await generateToken(user._id)

         res.status(200).json({
            success:true,
            message:"User logged in successfuly!",
            userData:user,
            token
         })

    } catch (error) {
         console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const checkAuth = async (req,res) => {
    try {
        res.status(200).json({
            success:true,
            user:req.user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}

export const updateProfile = async (req,res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id; 
        let updatedUser;
        if(!profilePic){
            await User.findByIdAndUpdate(userId, { fullName, bio }, { new:true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic:upload.secure_url, bio, fullName }, { new:true })
        }
        res.status(200).json({
            success:true,
            user:updatedUser
        })
    } catch (error) {
         console.log(error)
        res.status(500).json({ success:false, message:error.message })
    }
}