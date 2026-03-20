'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    const data = await apiFetch('/dashboard')
    setData(data)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/leads')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              Manage Leads
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); router.push('/login') }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {data?.funnel?.map(item => (
            <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{item._id}</p>
              <p className="text-2xl font-bold text-white">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-green-400">{data?.conversionRate}%</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Overdue Follow-ups</p>
            <p className="text-3xl font-bold text-red-400">{data?.overdueCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Top Source</p>
            <p className="text-3xl font-bold text-blue-400">{data?.topSources?.[0]?._id || 'N/A'}</p>
          </div>
        </div>

        {/* Activity Graph */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-white font-medium mb-4">7-Day Activity</p>
          <div className="flex items-end gap-2 h-32">
            {data?.activityGraph?.map(day => (
              <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-600 rounded-t"
                  style={{ height: `${Math.min(day.count * 20, 100)}%` }}
                />
                <p className="text-gray-500 text-xs">{day._id.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}