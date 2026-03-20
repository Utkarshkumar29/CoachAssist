import express from 'express'
import protect from '../middleware/auth.js'
import { addActivity, getTimeline } from '../controllers/activity.js'

const router = express.Router({ mergeParams: true })

router.get('/timeline', protect, getTimeline)
router.post('/activity', protect, addActivity)

export default router