import express from 'express'
import protect from '../middleware/auth.js'
import { getTimeline } from '../controllers/activity.js'

const router = express.Router({ mergeParams: true })

router.get('/timeline', protect, getTimeline)

export default router