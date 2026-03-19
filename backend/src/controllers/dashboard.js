import Lead from '../models/Lead.js'
import Activity from '../models/Activity.js'
import mongoose from 'mongoose'
import redis from '../services/redis.js'

export const getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    // Check cache first
    const cacheKey = `dashboard:${req.user.id}:${new Date().toISOString().slice(0,10)}`
    const cached = await redis.get(cacheKey)
    if (cached) return res.status(200).json(JSON.parse(cached))

    const [funnel, overdueCount, topSources, activityGraph] = await Promise.all([
      Lead.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.countDocuments({
        assignedTo: userId,
        nextFollowUpAt: { $lt: new Date() },
        status: { $nin: ['LOST', 'CONVERTED'] }
      }),
      Lead.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Activity.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ])

    const total = funnel.reduce((sum, item) => sum + item.count, 0)
    const converted = funnel.find(item => item._id === 'CONVERTED')?.count || 0
    const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0

    const result = { funnel, conversionRate, overdueCount, topSources, activityGraph }

    // Save to cache for 120 seconds
    await redis.setEx(cacheKey, 120, JSON.stringify(result))

    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}