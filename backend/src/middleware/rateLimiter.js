import redis from '../services/redis.js'

export const aiRateLimiter = async (req, res, next) => {
  try {
    const key = `ai_limit:${req.user.id}`
    
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    
    if (count > 5) {
      return res.status(429).json({ message: 'AI limit reached. Max 5 requests per hour.' })
    }
    
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}