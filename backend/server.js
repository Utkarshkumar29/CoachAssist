import { setDefaultResultOrder } from 'dns'
setDefaultResultOrder('ipv4first')
import './src/config.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from "./src/routes/auth.js"
import leadRoutes from "./src/routes/lead.js"
import dashboardRoutes from './src/routes/dashboard.js'
import activityRoutes from './src/routes/activity.js'
import './src/services/redis.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/leads',leadRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/leads/:id', activityRoutes)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("User DB connected"))
  .catch((err) => console.error("DB error:", err));

app.get('/',(req,res)=>{
    res.send("Hellow World")
})

app.listen(5000,()=>{
    console.log("Server running at port 5000")
})