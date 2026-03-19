import Activity from '../models/Activity.js'
import Lead from '../models/Lead.js'
import { generateFollowUp } from '../services/gemini.js'
import { logActivity } from './activity.js'

export const aiFollowup = async (req, res) => {
  try {
    const { id } = req.params

    // 1. Get lead
    const lead = await Lead.findById(id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    // 2. Get last 3 activities
    const recentActivities = await Activity.find({ lead: id })
      .sort({ createdAt: -1 })
      .limit(3)

    // 3. Call Gemini
    const output = await generateFollowUp(lead, recentActivities)

    // 4. Log AI_MESSAGE_GENERATED activity with output saved in meta
    await logActivity(id, 'AI_MESSAGE_GENERATED', { output }, req.user.id)

    // 5. Return result
    res.status(200).json(output)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}