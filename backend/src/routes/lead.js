import express from 'express'
import protect from '../middleware/auth.js'
import { createLead, getLeads, getLead, updateLead, deleteLead } from '../controllers/lead.js'
import { aiRateLimiter } from '../middleware/rateLimiter.js'
import { aiFollowup } from '../controllers/aiFollowup.js'

const router = express.Router()

router.get('/',protect, getLeads)
router.post('/',protect, createLead)
router.get('/:id',protect, getLead)
router.patch('/:id',protect, updateLead)
router.delete('/:id',protect, deleteLead)
router.post('/:id/ai-followup', protect, aiRateLimiter, aiFollowup)
export default router