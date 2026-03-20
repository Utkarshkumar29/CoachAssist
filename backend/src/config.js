import dotenv from 'dotenv'
dotenv.config()
console.log('GEMINI:', process.env.GEMINI_API_KEY?.slice(0, 10))