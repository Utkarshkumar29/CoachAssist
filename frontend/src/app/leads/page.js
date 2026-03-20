'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', source: 'Instagram', status: 'NEW', tags: '', nextFollowUpAt: '' })

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    const data = await apiFetch(`/leads?${params}`)
    setLeads(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const createLead = async () => {
    await apiFetch('/leads', {
      method: 'POST',
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()) })
    })
    setShowForm(false)
    setForm({ name: '', phone: '', source: 'Instagram', status: 'NEW', tags: '', nextFollowUpAt: '' })
    fetchLeads()
  }

  const statusColors = {
    NEW: 'bg-blue-500/10 text-blue-400',
    CONTACTED: 'bg-yellow-500/10 text-yellow-400',
    INTERESTED: 'bg-purple-500/10 text-purple-400',
    CONVERTED: 'bg-green-500/10 text-green-400',
    LOST: 'bg-red-500/10 text-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm cursor-pointer">← Dashboard</button>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          >
            + Add Lead
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="">All Status</option>
            {['NEW','CONTACTED','INTERESTED','CONVERTED','LOST'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Add Lead Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-medium mb-4">New Lead</h2>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Name'],['phone','Phone'],['tags','Tags (comma separated)']].map(([field, label]) => (
                <input
                  key={field}
                  placeholder={label}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none"
                />
              ))}
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700">
                {['Instagram','Referral','Ads'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700">
                {['NEW','CONTACTED','INTERESTED','CONVERTED','LOST'].map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="date" value={form.nextFollowUpAt}
                onChange={e => setForm({ ...form, nextFollowUpAt: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createLead} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer">Create</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
            </div>
          </div>
        )}

        {/* Leads List */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No leads yet. Add your first lead!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map(lead => (
              <div
                key={lead._id}
                onClick={() => router.push(`/leads/${lead._id}`)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-gray-600 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{lead.name}</p>
                  <p className="text-gray-400 text-sm">{lead.phone} · {lead.source}</p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.tags?.map(tag => (
                    <span key={tag} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{tag}</span>
                  ))}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}