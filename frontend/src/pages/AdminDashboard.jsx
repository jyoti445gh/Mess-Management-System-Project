import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Users, Trash2, ShieldCheck, GraduationCap, ChefHat,
  BarChart3, Coffee, Sun, Moon, RefreshCw, Search
} from 'lucide-react'
import API from '@/api/axios'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

const ROLES = ['student', 'mess_manager', 'admin']

const today = () => new Date().toISOString().split('T')[0]

const sevenDaysAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().split('T')[0]
}

const roleBadgeClass = (role) => {
  if (role === 'admin') return 'bg-purple-100 text-purple-700 border border-purple-200'
  if (role === 'mess_manager') return 'bg-orange-100 text-orange-700 border border-orange-200'
  return 'bg-green-100 text-green-700 border border-green-200'
}

const RoleIcon = ({ role }) => {
  if (role === 'admin') return <ShieldCheck className="w-3 h-3" />
  if (role === 'mess_manager') return <ChefHat className="w-3 h-3" />
  return <GraduationCap className="w-3 h-3" />
}

const AdminDashboard = () => {
  const { user: me } = useAuth()

  // users
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')

  // meal counts (today)
  const [todayCounts, setTodayCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0, totalUsers: 0 })

  // date-range report
  const [report, setReport] = useState([])
  const [reportRange, setReportRange] = useState({ startDate: sevenDaysAgo(), endDate: today() })
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchTodayCounts()
  }, [])

  // fetchers 
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await API.get('/users')
      setUsers(res.data.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const fetchTodayCounts = async () => {
    try {
      const res = await API.get(`/meals/count?date=${today()}`)
      setTodayCounts(res.data.data)
    } catch { }
  }

  const fetchReport = async () => {
    if (!reportRange.startDate || !reportRange.endDate) return toast.error('Select both dates')
    try {
      setReportLoading(true)
      const res = await API.get(`/meals/report?startDate=${reportRange.startDate}&endDate=${reportRange.endDate}`)
      setReport(res.data.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch report')
    } finally { setReportLoading(false) }
  }

  // actions 
  const handleRoleChange = async (id, role) => {
    try {
      setUpdatingId(id)
      await API.put(`/users/role/${id}`, { role })
      toast.success('Role updated')
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role')
    } finally { setUpdatingId(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      await API.delete(`/users/${id}`)
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u._id !== id))
    } catch { toast.error('Failed to delete user') }
  }

  // derived 
  const stats = {
    total:    users.length,
    students: users.filter(u => u.role === 'student').length,
    managers: users.filter(u => u.role === 'mess_manager').length,
    admins:   users.filter(u => u.role === 'admin').length,
    verified: users.filter(u => u.isVerified).length,
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">System overview and user management</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchUsers(); fetchTodayCounts() }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Users',  value: stats.total,    color: 'text-gray-800',   bg: 'bg-white' },
            { label: 'Students',     value: stats.students, color: 'text-green-700',  bg: 'bg-green-50' },
            { label: 'Managers',     value: stats.managers, color: 'text-orange-700', bg: 'bg-orange-50' },
            { label: 'Admins',       value: stats.admins,   color: 'text-purple-700', bg: 'bg-purple-50' },
            { label: 'Verified',     value: stats.verified, color: 'text-blue-700',   bg: 'bg-blue-50' },
          ].map(({ label, value, color, bg }) => (
            <Card key={label} className={`${bg} border shadow-sm`}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Today's Meal Counts ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" /> Today's Meal Counts
            </CardTitle>
            <CardDescription>{new Date().toDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Breakfast', value: todayCounts.breakfast, icon: Coffee, color: 'text-amber-600',  bg: 'bg-amber-50' },
                { label: 'Lunch',     value: todayCounts.lunch,     icon: Sun,    color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Dinner',    value: todayCounts.dinner,    icon: Moon,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Total',     value: todayCounts.totalUsers,icon: Users,  color: 'text-green-600',  bg: 'bg-green-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Date-Range Meal Report ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" /> Meal Count Report
            </CardTitle>
            <CardDescription>View opted-in counts over a date range (max 31 days)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <input
                  type="date"
                  value={reportRange.startDate}
                  onChange={e => setReportRange(p => ({ ...p, startDate: e.target.value }))}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <input
                  type="date"
                  value={reportRange.endDate}
                  onChange={e => setReportRange(p => ({ ...p, endDate: e.target.value }))}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button onClick={fetchReport} disabled={reportLoading} className="bg-green-600 hover:bg-green-700">
                {reportLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>

            {report.length > 0 && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b text-muted-foreground text-xs uppercase">
                      <th className="text-left py-2.5 px-4">Date</th>
                      <th className="text-center py-2.5 px-4">Breakfast</th>
                      <th className="text-center py-2.5 px-4">Lunch</th>
                      <th className="text-center py-2.5 px-4">Dinner</th>
                      <th className="text-center py-2.5 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map(row => (
                      <tr key={row.date} className="border-b last:border-0 hover:bg-green-50 transition-colors">
                        <td className="py-2.5 px-4 text-gray-700 font-medium">
                          {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td className="text-center py-2.5 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-amber-50 text-amber-700 font-semibold text-xs">{row.breakfast}</span>
                        </td>
                        <td className="text-center py-2.5 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-orange-50 text-orange-700 font-semibold text-xs">{row.lunch}</span>
                        </td>
                        <td className="text-center py-2.5 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs">{row.dinner}</span>
                        </td>
                        <td className="text-center py-2.5 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-green-50 text-green-700 font-semibold text-xs">
                            {row.breakfast + row.lunch + row.dinner}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals row */}
                  <tfoot className="bg-gray-50 border-t-2">
                    <tr>
                      <td className="py-2.5 px-4 text-xs font-semibold text-gray-600 uppercase">Total</td>
                      {['breakfast', 'lunch', 'dinner'].map(k => (
                        <td key={k} className="text-center py-2.5 px-4 font-bold text-gray-800">
                          {report.reduce((s, r) => s + r[k], 0)}
                        </td>
                      ))}
                      <td className="text-center py-2.5 px-4 font-bold text-green-700">
                        {report.reduce((s, r) => s + r.breakfast + r.lunch + r.dinner, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── User Management ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" /> User Management
                </CardTitle>
                <CardDescription>Assign roles or remove users</CardDescription>
              </div>
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-10">Loading users...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No users found</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(u => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-gray-50 transition-colors gap-3"
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 font-semibold text-green-700 text-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          {u._id === me?._id && (
                            <span className="text-xs text-muted-foreground">(you)</span>
                          )}
                          {!u.isVerified && (
                            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">unverified</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Role + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${roleBadgeClass(u.role)}`}>
                        <RoleIcon role={u.role} />
                        {u.role.replace('_', ' ')}
                      </span>

                      {u._id !== me?._id ? (
                        <>
                          <select
                            value={u.role}
                            disabled={updatingId === u._id}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className="text-xs h-7 rounded-lg border border-input bg-transparent px-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                          </select>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(u._id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default AdminDashboard
