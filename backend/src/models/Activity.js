import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  lead:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  type:      { type: String, enum: ['CALL', 'WHATSAPP', 'NOTE', 'STATUS_CHANGE', 'AI_MESSAGE_GENERATED'], required: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

activitySchema.index({ lead: 1, createdAt: -1 })

const Activity = mongoose.model('Activity', activitySchema)
export default Activity