import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Users, Trash2, ShieldCheck, GraduationCap, ChefHat,
  BarChart3, Coffee, Sun, Moon, RefreshCw, Search, PlaneTakeoff, Check, X, Receipt, IndianRupee
} from 'lucide-react'
import API from '@/api/axios'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  { value: 'student',         label: 'Student' },
  { value: 'mess_committee',  label: 'Mess Committee Member' },
]

const ROLE_LABELS = {
  student:        'Student',
  mess_committee: 'Mess Committee Member',
  mess_manager:   'Mess Manager',
  admin:          'Admin',
}

const roleBadgeClass = (role) => {
  if (role === 'admin')          return 'bg-purple-100 text-purple-700 border border-purple-200'
  if (role === 'mess_manager')   return 'bg-orange-100 text-orange-700 border border-orange-200'
  if (role === 'mess_committee') return 'bg-blue-100 text-blue-700 border border-blue-200'
  return 'bg-green-100 text-green-700 border border-green-200'
}

const RoleIcon = ({ role }) => {
  if (role === 'admin')          return <ShieldCheck className="w-3 h-3" />
  if (role === 'mess_manager')   return <ChefHat className="w-3 h-3" />
  if (role === 'mess_committee') return <Users className="w-3 h-3" />
  return <GraduationCap className="w-3 h-3" />
}

const today = () => new Date().toISOString().split('T')[0]

const sevenDaysAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().split('T')[0]
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

  // leave requests
  const [leaves, setLeaves] = useState([])
  const [leavesLoading, setLeavesLoading] = useState(false)
  const [actioningId, setActioningId] = useState(null)

  // billing
  const [billMonth, setBillMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [bills, setBills] = useState([])
  const [billSummary, setBillSummary] = useState(null)
  const [billsLoading, setBillsLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [togglingBillId, setTogglingBillId] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchTodayCounts()
    fetchLeaves()
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

  const fetchLeaves = async () => {
    try {
      setLeavesLoading(true)
      const res = await API.get('/leave/all')
      setLeaves(res.data.data)
    } catch { toast.error('Failed to load leave requests') }
    finally { setLeavesLoading(false) }
  }

  const handleLeaveAction = async (id, action) => {
    try {
      setActioningId(id)
      await API.patch(`/leave/${id}/${action}`)
      toast.success(`Leave ${action}d successfully`)
      fetchLeaves()
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to ${action} leave`)
    } finally { setActioningId(null) }
  }

  const fetchBills = async () => {
    const [y, m] = billMonth.split('-')
    try {
      setBillsLoading(true)
      const [billsRes, summaryRes] = await Promise.all([
        API.get(`/bills/all?month=${m}&year=${y}`),
        API.get(`/bills/summary?month=${m}&year=${y}`),
      ])
      setBills(billsRes.data.data)
      setBillSummary(summaryRes.data.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch bills')
    } finally { setBillsLoading(false) }
  }

  const handleGenerateBills = async () => {
    const [y, m] = billMonth.split('-')
    try {
      setGenerating(true)
      await API.post('/bills/generate', { month: Number(m), year: Number(y) })
      toast.success('Bills generated successfully')
      fetchBills()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate bills')
    } finally { setGenerating(false) }
  }

  const handleTogglePaid = async (bill) => {
    const action = bill.isPaid ? 'mark-unpaid' : 'mark-paid'
    try {
      setTogglingBillId(bill._id)
      await API.patch(`/bills/${bill._id}/${action}`)
      toast.success(`Marked as ${bill.isPaid ? 'unpaid' : 'paid'}`)
      fetchBills()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update bill')
    } finally { setTogglingBillId(null) }
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
    total:          users.length,
    students:       users.filter(u => u.role === 'student').length,
    committee:      users.filter(u => u.role === 'mess_committee').length,
    managers:       users.filter(u => u.role === 'mess_manager').length,
    admins:         users.filter(u => u.role === 'admin').length,
    verified:       users.filter(u => u.isVerified).length,
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
          <Button variant="outline" size="sm" onClick={() => { fetchUsers(); fetchTodayCounts(); fetchLeaves() }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Users',        value: stats.total,     color: 'text-gray-800',   bg: 'bg-white' },
            { label: 'Students',           value: stats.students,  color: 'text-green-700',  bg: 'bg-green-50' },
            { label: 'Committee Members',  value: stats.committee, color: 'text-blue-700',   bg: 'bg-blue-50' },
            { label: 'Mess Manager',       value: stats.managers,  color: 'text-orange-700', bg: 'bg-orange-50' },
            { label: 'Admins',             value: stats.admins,    color: 'text-purple-700', bg: 'bg-purple-50' },
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

        {/* ── Leave Requests ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <PlaneTakeoff className="w-4 h-4 text-blue-600" /> Leave Requests
                </CardTitle>
                <CardDescription>Approve or reject student leave requests</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchLeaves}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leavesLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No leave requests</p>
            ) : (
              <div className="space-y-2">
                {leaves.map(l => (
                  <div key={l._id} className="flex items-center justify-between p-3 rounded-xl border bg-white gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-800">{l.studentId?.name}</p>
                        <span className="text-xs text-muted-foreground">{l.studentId?.email}</span>
                        {l.studentId?.EnrollmentId && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{l.studentId.EnrollmentId}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                        {' '}
                        <span className="text-muted-foreground">
                          ({Math.round((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1} days)
                        </span>
                      </p>
                      {l.reason && <p className="text-xs text-muted-foreground mt-0.5 italic">"{l.reason}"</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                        l.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        l.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </span>
                      {l.status === 'pending' && (
                        <>
                          <Button size="sm" disabled={actioningId === l._id}
                            onClick={() => handleLeaveAction(l._id, 'approve')}
                            className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-xs gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" disabled={actioningId === l._id}
                            onClick={() => handleLeaveAction(l._id, 'reject')}
                            className="h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50 text-xs gap-1">
                            <X className="w-3 h-3" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Billing ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-600" /> Billing
                </CardTitle>
                <CardDescription>Generate and manage monthly mess bills</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="month" value={billMonth}
                  onChange={e => setBillMonth(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button size="sm" variant="outline" onClick={fetchBills} disabled={billsLoading}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Load
                </Button>
                <Button size="sm" onClick={handleGenerateBills} disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 text-white">
                  {generating ? 'Generating...' : 'Generate Bills'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Summary strip */}
            {billSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Total Students', value: billSummary.totalStudents, color: 'text-gray-800',   bg: 'bg-gray-50' },
                  { label: 'Total Amount',   value: `₹${billSummary.totalAmount}`, color: 'text-purple-700', bg: 'bg-purple-50' },
                  { label: 'Collected',      value: `₹${billSummary.collectedAmount}`, color: 'text-green-700',  bg: 'bg-green-50' },
                  { label: 'Pending',        value: `₹${billSummary.pendingAmount}`,   color: 'text-red-700',    bg: 'bg-red-50' },
                  { label: 'Paid',           value: billSummary.paidCount,   color: 'text-green-700',  bg: 'bg-green-50' },
                  { label: 'Unpaid',         value: billSummary.unpaidCount, color: 'text-red-700',    bg: 'bg-red-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center border`}>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bills table */}
            {billsLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
            ) : bills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No bills found. Select a month and click "Generate Bills" first.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b text-muted-foreground text-xs uppercase">
                      <th className="text-left py-2.5 px-4">Student</th>
                      <th className="text-center py-2.5 px-3">Breakfast</th>
                      <th className="text-center py-2.5 px-3">Lunch</th>
                      <th className="text-center py-2.5 px-3">Dinner</th>
                      <th className="text-center py-2.5 px-3">Total</th>
                      <th className="text-center py-2.5 px-3">Status</th>
                      <th className="text-center py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(b => (
                      <tr key={b._id} className="border-b last:border-0 hover:bg-purple-50 transition-colors">
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-gray-800">{b.studentId?.name}</p>
                          <p className="text-xs text-muted-foreground">{b.studentId?.email}</p>
                        </td>
                        <td className="text-center py-2.5 px-3 text-xs">
                          <span className="text-amber-700 font-medium">{b.breakfastCount}</span>
                          <span className="text-muted-foreground"> (₹{b.breakfastCost})</span>
                        </td>
                        <td className="text-center py-2.5 px-3 text-xs">
                          <span className="text-orange-700 font-medium">{b.lunchCount}</span>
                          <span className="text-muted-foreground"> (₹{b.lunchCost})</span>
                        </td>
                        <td className="text-center py-2.5 px-3 text-xs">
                          <span className="text-indigo-700 font-medium">{b.dinnerCount}</span>
                          <span className="text-muted-foreground"> (₹{b.dinnerCost})</span>
                        </td>
                        <td className="text-center py-2.5 px-3 font-bold text-purple-700">₹{b.totalAmount}</td>
                        <td className="text-center py-2.5 px-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                            b.isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {b.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-3">
                          <Button size="sm" variant="outline" disabled={togglingBillId === b._id}
                            onClick={() => handleTogglePaid(b)}
                            className={`h-7 px-2.5 text-xs ${b.isPaid ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                            {b.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
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
                <CardDescription>Students: change role or delete. Mess Managers: delete only. Admins: no actions.</CardDescription>
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
                        {ROLE_LABELS[u.role] || u.role}
                      </span>

                      {u._id !== me?._id && u.role !== 'admin' ? (
                        <>
                          {/* Students and committee members can have role swapped */}
                          {(u.role === 'student' || u.role === 'mess_committee') && (
                            <select
                              value={u.role}
                              disabled={updatingId === u._id}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              className="text-xs h-7 rounded-lg border border-input bg-transparent px-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                            >
                              {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          )}

                          {/* Mess manager — show fixed label, no role change */}
                          {u.role === 'mess_manager' && (
                            <span className="text-xs text-muted-foreground px-1">Delete only</span>
                          )}

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
