const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }
  
  return res.json()
}