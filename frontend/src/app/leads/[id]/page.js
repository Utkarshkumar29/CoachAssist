'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function LeadDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [aiOutput, setAiOutput] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => { fetchLead(); fetchTimeline() }, [])

  const fetchLead = async () => {
    const data = await apiFetch(`/leads/${id}`)
    setLead(data.lead)
    setNewStatus(data.lead?.status)
  }

  const fetchTimeline = async () => {
    const data = await apiFetch(`/leads/${id}/timeline`)
    setTimeline(data.activities || [])
  }

  const updateStatus = async () => {
    await apiFetch(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
    fetchLead()
  }

  const generateAI = async () => {
    setAiLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/leads/${id}/ai-followup`, { method: 'POST' })
      if (data.message) { setError(data.message); return }
      setAiOutput(data)
      fetchTimeline()
    } catch {
      setError('Failed to generate')
    } finally {
      setAiLoading(false)
    }
  }

  const activityIcons = {
    CALL: '📞', WHATSAPP: '💬', NOTE: '📝',
    STATUS_CHANGE: '🔄', AI_MESSAGE_GENERATED: '🤖'
  }

  const statusColors = {
    NEW: 'text-blue-400', CONTACTED: 'text-yellow-400',
    INTERESTED: 'text-purple-400', CONVERTED: 'text-green-400', LOST: 'text-red-400'
  }

  if (!lead) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <button onClick={() => router.push('/leads')} className="text-gray-400 hover:text-white text-sm mb-6 block">← Back to Leads</button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Lead Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-1">{lead.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{lead.phone} · {lead.source}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {lead.tags?.map(tag => (
                <span key={tag} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
            {lead.nextFollowUpAt && (
              <p className="text-gray-400 text-xs">Follow up: {new Date(lead.nextFollowUpAt).toLocaleDateString()}</p>
            )}
          </div>

          {/* Status Update */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-xs mb-2">Current Status</p>
            <p className={`text-2xl font-bold mb-4 ${statusColors[lead.status]}`}>{lead.status}</p>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 flex-1"
              >
                {['NEW','CONTACTED','INTERESTED','CONVERTED','LOST'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button onClick={updateStatus} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* AI Followup */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-medium">AI Follow-up Generator</h2>
            <button
              onClick={generateAI}
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              {aiLoading ? 'Generating...' : '✨ Generate Follow-up'}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          {aiOutput && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-green-400 text-xs font-medium mb-2">💬 WhatsApp Message</p>
                <p className="text-white text-sm">{aiOutput.whatsapp}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-blue-400 text-xs font-medium mb-2">📞 Call Script</p>
                <ul className="space-y-1">
                  {aiOutput.callScript?.map((line, i) => (
                    <li key={i} className="text-white text-sm">• {line}</li>
                  ))}
                </ul>
              </div>
              {aiOutput.objectionHandler && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-yellow-400 text-xs font-medium mb-2">🛡️ Objection Handler</p>
                  <p className="text-white text-sm">{aiOutput.objectionHandler}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Activity Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-sm">No activities yet.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map(activity => (
                <div key={activity._id} className="flex gap-3 items-start">
                  <span className="text-xl">{activityIcons[activity.type]}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{activity.type.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-xs">{new Date(activity.createdAt).toLocaleString()}</p>
                    {activity.meta?.output && (
                      <p className="text-gray-300 text-xs mt-1">AI message generated</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}