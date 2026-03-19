import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  phone:          { type: String, required: true },
  source:         { type: String, enum: ['Instagram', 'Referral', 'Ads'], required: true },
  status:         { type: String, enum: ['NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'LOST'], default: 'NEW' },
  tags:           [String],
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nextFollowUpAt: { type: Date }
}, { timestamps: true })

leadSchema.index({ status: 1 })
leadSchema.index({ assignedTo: 1 })
leadSchema.index({ nextFollowUpAt: 1 })
leadSchema.index({ name: 'text', phone: 'text' })

const Lead = mongoose.model('Lead', leadSchema)
export default Lead