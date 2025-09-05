import jwt from 'jsonwebtoken'

export const generateToken = async (userId) => {
    const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
        expiresIn:'7h'
    })
    return token
}