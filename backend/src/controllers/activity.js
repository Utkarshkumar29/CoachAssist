import Activity from '../models/Activity.js'

export const logActivity = async (leadId, type, meta, userId) => {
  return await Activity.create({
    lead: leadId,
    type,
    meta,
    createdBy: userId
  })
}

export const getTimeline = async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query
    const { id } = req.params

    const query = { lead: id }

    if (cursor) query.createdAt = { $lt: new Date(cursor) }
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1)

    const hasMore = activities.length > Number(limit)
    if (hasMore) activities.pop()

    const nextCursor = hasMore ? activities.at(-1).createdAt.toISOString() : null

    res.status(200).json({ activities, nextCursor })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
