import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Coffee, Sun, Moon, Users, PlusCircle, Pencil, Utensils, BarChart3, Trash2 } from 'lucide-react'
import API from '@/api/axios'
import Navbar from '@/components/Navbar'

const today = () => new Date().toISOString().split('T')[0]

const ManagerDashboard = () => {
  const [date, setDate] = useState(today())
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0, totalUsers: 0 })
  const [menus, setMenus] = useState([])
  const [editingMenu, setEditingMenu] = useState(null)
  const [form, setForm] = useState({ date: today(), breakfast: '', lunch: '', dinner: '', isPublished: false })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [report, setReport] = useState([])
  const [reportRange, setReportRange] = useState({ startDate: today(), endDate: today() })
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => { fetchCounts(); fetchMenus() }, [date])

  const fetchCounts = async () => {
    try {
      const res = await API.get(`/meals/count?date=${date}`)
      setCounts(res.data.data)
    } catch { }
  }

  const fetchMenus = async () => {
    try {
      const res = await API.get('/menu/all')
      setMenus(res.data.data)
    } catch { }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.breakfast || !form.lunch || !form.dinner) return toast.error('All meal fields required')
    try {
      setSaving(true)
      if (editingMenu) {
        await API.put(`/menu/${editingMenu._id}`, form)
        toast.success('Menu updated!')
      } else {
        await API.post('/menu', form)
        toast.success('Menu created!')
      }
      setForm({ date: today(), breakfast: '', lunch: '', dinner: '', isPublished: false })
      setEditingMenu(null)
      setShowForm(false)
      fetchMenus()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save menu')
    } finally { setSaving(false) }
  }

  const startEdit = (menu) => {
    setEditingMenu(menu)
    setForm({
      date: menu.date?.split('T')[0],
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      dinner: menu.dinner,
      isPublished: menu.isPublished,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu? This cannot be undone.')) return
    try {
      await API.delete(`/menu/${id}`)
      toast.success('Menu deleted')
      fetchMenus()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete menu')
    }
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

  const statCards = [
    { label: 'Breakfast', value: counts.breakfast, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Lunch',     value: counts.lunch,     icon: Sun,    color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Dinner',    value: counts.dinner,    icon: Moon,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total',     value: counts.totalUsers,icon: Users,  color: 'text-green-600',  bg: 'bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage menus and view meal counts</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingMenu(null); setForm({ date: today(), breakfast: '', lunch: '', dinner: '', isPublished: false }) }}
            className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'New Menu'}
          </Button>
        </div>

        {/* Meal Count Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" /> Real-time Meal Counts
            </CardTitle>
            <CardDescription>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="mt-1 h-8 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Form */}
        {showForm && (
          <Card className="ring-2 ring-green-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-green-600" />
                {editingMenu ? 'Edit Menu' : 'Create Menu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" name="date" value={form.date} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Breakfast</Label>
                    <Input name="breakfast" placeholder="e.g. Poha, Tea" value={form.breakfast} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lunch</Label>
                    <Input name="lunch" placeholder="e.g. Dal, Rice, Sabzi" value={form.lunch} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Dinner</Label>
                    <Input name="dinner" placeholder="e.g. Roti, Paneer, Salad" value={form.dinner} onChange={handleFormChange} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleFormChange} className="w-4 h-4 accent-green-600" />
                  Publish immediately
                </label>
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Menu List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Menus</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No menus created yet</p>
            ) : (
              <div className="space-y-3">
                {menus.map(menu => (
                  <div key={menu._id} className="flex items-start justify-between p-4 rounded-xl border bg-white hover:bg-green-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{new Date(menu.date).toDateString()}</p>
                        <Badge variant={menu.isPublished ? 'default' : 'secondary'} className={menu.isPublished ? 'bg-green-600 text-xs' : 'text-xs'}>
                          {menu.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        🌅 {menu.breakfast} &nbsp;|&nbsp; ☀️ {menu.lunch} &nbsp;|&nbsp; 🌙 {menu.dinner}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(menu)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(menu._id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date-Range Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" /> Meal Count Report
            </CardTitle>
            <CardDescription>View opted-in counts over a date range (max 31 days)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <input type="date" value={reportRange.startDate}
                  onChange={e => setReportRange(p => ({ ...p, startDate: e.target.value }))}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <input type="date" value={reportRange.endDate}
                  onChange={e => setReportRange(p => ({ ...p, endDate: e.target.value }))}
                  className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button onClick={fetchReport} disabled={reportLoading} className="bg-green-600 hover:bg-green-700">
                {reportLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>

            {report.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase">
                      <th className="text-left py-2 pr-4">Date</th>
                      <th className="text-center py-2 px-3">Breakfast</th>
                      <th className="text-center py-2 px-3">Lunch</th>
                      <th className="text-center py-2 px-3">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map(row => (
                      <tr key={row.date} className="border-b last:border-0 hover:bg-green-50">
                        <td className="py-2 pr-4 text-gray-700">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="text-center py-2 px-3 font-medium">{row.breakfast}</td>
                        <td className="text-center py-2 px-3 font-medium">{row.lunch}</td>
                        <td className="text-center py-2 px-3 font-medium">{row.dinner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default ManagerDashboard
