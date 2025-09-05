import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const response = await mongoose.connect(process.env.DB_URL)
        console.log(`Database connected: ${response.connection.host}`)
    } catch (error) {
        console.log(`Error in connecting Database ${error.message}`)
    }
}