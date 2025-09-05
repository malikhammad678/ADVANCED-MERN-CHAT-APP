import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';

export const auth = async (req,res,next) => {
    const token = req.headers.token;
    try {
        if(!token){
            return res.status(500).json({ success:false, message:"Un-Authorized!" })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        if(!decoded){
            return res.status(500).json({ success:false, message:"Un-Authorized!" })
        }
        const user = await User.findById(decoded.userId).select('-password')
        if(!user){
            return res.status(500).json({ success:false, message:"User not found!" })
        }
        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:true, message:error.message ||"Internal Server Error" })
    }
}