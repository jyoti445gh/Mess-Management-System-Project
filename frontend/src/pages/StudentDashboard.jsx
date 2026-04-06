import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CalendarCheck, Coffee, Sun, Moon, RefreshCw, Utensils, IndianRupee, Clock, CalendarDays } from 'lucide-react'
import API from '@/api/axios'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { WEEKLY_MENU, DAYS } from '@/data/weeklyMenu'

// ─── constants ───────────────────────────────────────────────────────────────

const MEAL_META = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, time: '7:00 – 9:00 AM',  cost: 30, color: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', headColor: 'text-amber-700' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,    time: '12:00 – 2:00 PM', cost: 50, color: 'bg-orange-50 border-orange-100', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', headColor: 'text-orange-700' },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,   time: '7:00 – 9:00 PM',  cost: 40, color: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', headColor: 'text-indigo-700' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

const dayName = (dateStr) =>
  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(dateStr).getDay()]

// ─── helpers ─────────────────────────────────────────────────────────────────

// Always returns a plain object with string fields — never a Mongoose doc
const normalizeMenu = (raw) => {
  if (!raw) return null
  return {
    day:       raw.day || '',
    breakfast: raw.breakfast || {},
    lunch:     raw.lunch     || {},
    dinner:    raw.dinner    || {},
  }
}

// ─── MealDetail ──────────────────────────────────────────────────────────────

const MealDetail = ({ mealKey, data }) => {
  if (!data || typeof data !== 'object') return <p className="text-xs text-muted-foreground">—</p>

  const rows = mealKey === 'breakfast'
    ? [
        { label: 'Main',          value: String(data.indianMain     || '') },
        { label: 'Accompaniment', value: String(data.accompaniments || '') },
        { label: 'Bread',         value: String(data.bread          || '') },
        { label: 'Beverage',      value: String(data.beverage       || '') },
        { label: 'Healthy',       value: String(data.healthyOptions || '') },
      ]
    : [
        { label: 'Salad',         value: String(data.salad          || '') },
        { label: 'Vegetable',     value: String(data.vegetable      || '') },
        { label: 'Dal',           value: String(data.dal            || '') },
        { label: 'Rice',          value: String(data.rice           || '') },
        { label: 'Roti',          value: String(data.roti           || '') },
        { label: 'Accompaniment', value: String(data.accompaniments || '') },
      ]

  const filled = rows.filter(r => r.value.trim())
  if (!filled.length) return <p className="text-xs text-muted-foreground">Details not available</p>

  return (
    <div className="space-y-1">
      {filled.map(r => (
        <div key={r.label} className="flex gap-2 text-sm">
          <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">{r.label}</span>
          <span className="text-gray-800 leading-snug">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── MealCard ────────────────────────────────────────────────────────────────

const MealCard = ({ mealKey, label, icon: Icon, color, iconBg, iconColor, headColor, data }) => (
  <div className={`p-3 rounded-xl border ${color}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${headColor}`}>{label}</p>
    </div>
    <MealDetail mealKey={mealKey} data={data} />
  </div>
)

// ─── Dashboard ───────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('today')
  const [date, setDate] = useState(todayStr())
  const [opts, setOpts] = useState({ breakfast: true, lunch: true, dinner: true })
  const [cutoff, setCutoff] = useState({ breakfast: { cutoffPassed: false }, lunch: { cutoffPassed: false }, dinner: { cutoffPassed: false } })
  const [menu, setMenu] = useState(null)
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
  const [history, setHistory] = useState([])
  const [refund, setRefund] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchMeal(); fetchMenu(); fetchCutoff() }, [date])
  useEffect(() => { fetchHistory(); fetchRefund() }, [])

  const fetchCutoff = async () => {
    try { const res = await API.get('/meals/cutoff-status'); setCutoff(res.data.data) } catch { }
  }

  const fetchMeal = async () => {
    try {
      const res = await API.get('/meals/my')
      const found = res.data.data.find(m => m.date?.split('T')[0] === date)
      if (found) setOpts({ breakfast: !!found.breakfast, lunch: !!found.lunch, dinner: !!found.dinner })
      else setOpts({ breakfast: true, lunch: true, dinner: true })
    } catch { }
  }

  const fetchMenu = async () => {
    try {
      const res = await API.get(`/menu?date=${date}`)
      setMenu(normalizeMenu(res.data.data))
    } catch {
      const day = dayName(date)
      setMenu(WEEKLY_MENU[day] ? normalizeMenu({ ...WEEKLY_MENU[day], day }) : null)
    }
  }

  const fetchHistory = async () => {
    try { const res = await API.get('/meals/my'); setHistory(res.data.data.slice(0, 7)) } catch { }
  }

  const fetchRefund = async () => {
    try { const res = await API.get('/meals/refund'); setRefund(res.data.data) } catch { }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await API.post('/meals/opt', { date, ...opts })
      toast.success('Meal preference saved!')
      fetchHistory(); fetchRefund()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const toggle = (key) => {
    if (date === todayStr() && cutoff[key]?.cutoffPassed) { toast.error(`Cutoff has passed for ${key}`); return }
    setOpts(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isDisabled = (key) => date === todayStr() && cutoff[key]?.cutoffPassed

  // Weekly tab — always use local static data, normalized
  const activeDayData = WEEKLY_MENU[activeDay]
    ? normalizeMenu({ ...WEEKLY_MENU[activeDay], day: activeDay })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Refund Summary */}
        {refund && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-green-800">
                <IndianRupee className="w-4 h-4" /> Refund Summary
              </CardTitle>
              <CardDescription className="text-green-700">Based on your skipped meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-6">
                  {MEAL_META.map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-green-700">{label}</p>
                      <p className="font-semibold text-gray-800">{refund.breakdown[key].skipped} skipped</p>
                      <p className="text-xs text-green-600">₹{refund.breakdown[key].subtotal}</p>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-700">Total Refund</p>
                  <p className="text-3xl font-bold text-green-700">₹{refund.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* Meal Opt-in/out */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarCheck className="w-4 h-4 text-green-600" /> Meal Preferences
              </CardTitle>
              <CardDescription>Toggle meals for selected date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="date" value={date} min={todayStr()} onChange={e => setDate(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="space-y-2">
                {MEAL_META.map(({ key, label, icon: Icon, time, cost }) => {
                  const disabled = isDisabled(key)
                  return (
                    <div key={key} onClick={() => toggle(key)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        disabled ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                          : opts[key] ? 'bg-green-50 border-green-300 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 opacity-60 cursor-pointer'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opts[key] && !disabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${opts[key] && !disabled ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{label} <span className="text-xs text-muted-foreground">₹{cost}</span></p>
                          <p className="text-xs text-muted-foreground">{time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {disabled
                          ? <span className="flex items-center gap-1 text-xs text-amber-600"><Clock className="w-3 h-3" /> Cutoff passed</span>
                          : <Badge variant={opts[key] ? 'default' : 'secondary'} className={opts[key] ? 'bg-green-600' : ''}>{opts[key] ? 'Opted In' : 'Opted Out'}</Badge>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Menu Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Utensils className="w-4 h-4 text-green-600" /> Menu
              </CardTitle>
              <div className="flex gap-1 mt-2 bg-gray-100 rounded-lg p-1 w-fit">
                {['today', 'weekly'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t === 'today' ? <><CalendarCheck className="w-3 h-3 inline mr-1" />Today</> : <><CalendarDays className="w-3 h-3 inline mr-1" />Weekly</>}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {tab === 'today' && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">{new Date(date).toDateString()}</p>
                  {menu ? (
                    <div className="space-y-3">
                      {MEAL_META.map(({ key, label, icon, color, iconBg, iconColor, headColor }) => (
                        <MealCard key={key} mealKey={key} label={label} icon={icon} color={color} iconBg={iconBg} iconColor={iconColor} headColor={headColor} data={menu[key]} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                      <Utensils className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-muted-foreground">No menu for this date</p>
                    </div>
                  )}
                </>
              )}

              {tab === 'weekly' && (
                <>
                  <div className="flex gap-1 flex-wrap mb-4">
                    {DAYS.map(day => (
                      <button key={day} onClick={() => setActiveDay(day)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          activeDay === day ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                        }`}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {activeDayData ? (
                    <div className="space-y-3">
                      {MEAL_META.map(({ key, label, icon, color, iconBg, iconColor, headColor }) => (
                        <MealCard key={key} mealKey={key} label={label} icon={icon} color={color} iconBg={iconBg} iconColor={iconColor} headColor={headColor} data={activeDayData[key]} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                      <CalendarDays className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-muted-foreground">No menu for {activeDay}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meal History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="w-4 h-4 text-green-600" /> Recent Meal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No meal history yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase">
                      <th className="text-left py-2 pr-4">Date</th>
                      <th className="text-center py-2 px-2">Breakfast</th>
                      <th className="text-center py-2 px-2">Lunch</th>
                      <th className="text-center py-2 px-2">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(m => (
                      <tr key={m._id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-gray-700">{new Date(m.date).toLocaleDateString()}</td>
                        {['breakfast','lunch','dinner'].map(k => (
                          <td key={k} className="text-center py-2 px-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${m[k] ? 'bg-green-500' : 'bg-red-400'}`} />
                          </td>
                        ))}
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

export default StudentDashboard
