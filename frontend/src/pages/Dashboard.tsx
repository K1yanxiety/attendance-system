import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface AttendanceData {
  id: number
  time_in: string
  time_out: string | null
  hours_worked: number | null
  is_completed: boolean
  date: string
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [history, setHistory] = useState<AttendanceData[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today')
      setAttendance(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch attendance')
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const response = await api.get('/attendance/history')
      setHistory(response.data.data)
    } catch (err: any) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTodayAttendance()
    fetchAttendanceHistory()
  }, [])

  const handleTimeIn = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/attendance/time-in')
      setSuccess('✅ Time in recorded successfully!')
      fetchTodayAttendance()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record time in')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeOut = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/attendance/time-out')
      setSuccess('✅ Time out recorded successfully!')
      fetchTodayAttendance()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record time out')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isTimedIn = attendance?.time_in && !attendance?.time_out
  const hoursWorked = attendance?.hours_worked || 0
  const isCompleted = attendance?.is_completed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Today's Attendance</h2>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Time In */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TIME IN</p>
              <p className="text-2xl font-bold text-blue-600">
                {attendance?.time_in
                  ? new Date(attendance.time_in).toLocaleTimeString()
                  : '--:--:--'}
              </p>
            </div>

            {/* Time Out */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TIME OUT</p>
              <p className="text-2xl font-bold text-purple-600">
                {attendance?.time_out
                  ? new Date(attendance.time_out).toLocaleTimeString()
                  : '--:--:--'}
              </p>
            </div>

            {/* Hours Worked */}
            <div className={`bg-gradient-to-br ${
              isCompleted
                ? 'from-green-50 to-green-100'
                : 'from-yellow-50 to-yellow-100'
            } rounded-lg p-6`}>
              <p className="text-gray-600 text-sm font-semibold mb-2">HOURS WORKED</p>
              <p className={`text-2xl font-bold ${
                isCompleted ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {hoursWorked.toFixed(2)}
              </p>
              {isCompleted && (
                <p className="text-green-600 text-sm font-semibold mt-2">✅ 8 Hours Completed</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleTimeIn}
              disabled={loading || isTimedIn}
              className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition ${
                isTimedIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? 'Processing...' : '🔓 Time In'}
            </button>
            <button
              onClick={handleTimeOut}
              disabled={loading || !isTimedIn}
              className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition ${
                !isTimedIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? 'Processing...' : '🔒 Time Out'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Attendance History</h2>
          {history.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No attendance records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time In</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time Out</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.time_in).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.time_out
                          ? new Date(record.time_out).toLocaleTimeString()
                          : '---'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.hours_worked?.toFixed(2) || '---'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.is_completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.is_completed ? '✅ Completed' : '⏳ Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
