import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coffee, Sun, Moon, ChevronLeft, ChevronRight, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import API from '@/api/axios'
import Navbar from '@/components/Navbar'
import { WEEKLY_MENU } from '@/data/weeklyMenu'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, time: '7:00 – 9:00 AM',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon_bg: 'bg-amber-100',  icon_color: 'text-amber-600' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,    time: '12:00 – 2:00 PM', bg: 'bg-orange-50', border: 'border-orange-200', icon_bg: 'bg-orange-100', icon_color: 'text-orange-600' },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,   time: '7:00 – 9:00 PM',  bg: 'bg-indigo-50', border: 'border-indigo-200', icon_bg: 'bg-indigo-100', icon_color: 'text-indigo-600' },
]

const BREAKFAST_ROWS = [
  { key: 'indianMain',     label: 'Main' },
  { key: 'accompaniments', label: 'Accompaniment' },
  { key: 'bread',          label: 'Bread' },
  { key: 'beverage',       label: 'Beverage' },
  { key: 'healthyOptions', label: 'Healthy Option' },
]
const LUNCH_DINNER_ROWS = [
  { key: 'salad',          label: 'Salad' },
  { key: 'vegetable',      label: 'Vegetable' },
  { key: 'dal',            label: 'Dal' },
  { key: 'rice',           label: 'Rice' },
  { key: 'roti',           label: 'Roti' },
  { key: 'accompaniments', label: 'Accompaniment' },
]

const fmt = (d) => d.toISOString().split('T')[0]
const dayName = (d) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]

const MealRows = ({ mealKey, data }) => {
  if (!data || typeof data !== 'object') return <p className="text-sm text-muted-foreground">Details not available</p>
  const rows = mealKey === 'breakfast' ? BREAKFAST_ROWS : LUNCH_DINNER_ROWS
  const filled = rows.filter(r => data[r.key] && String(data[r.key]).trim())
  if (!filled.length) return <p className="text-sm text-muted-foreground">Details not available</p>
  return (
    <div className="space-y-1.5">
      {filled.map(r => (
        <div key={r.key} className="flex gap-2 text-sm">
          <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{r.label}</span>
          <span className="text-gray-800">{String(data[r.key])}</span>
        </div>
      ))}
    </div>
  )
}

const MenuPage = () => {
  const [date, setDate] = useState(new Date())
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchMenu() }, [date])

  const fetchMenu = async () => {
    setLoading(true)
    setMenu(null)
    try {
      const res = await API.get(`/menu?date=${fmt(date)}`)
      const raw = res.data.data
      if (raw) setMenu({ day: raw.day || dayName(date), breakfast: raw.breakfast || {}, lunch: raw.lunch || {}, dinner: raw.dinner || {} })
    } catch {
      const day = dayName(date)
      const staticDay = WEEKLY_MENU[day]
      if (staticDay) setMenu({ day, ...staticDay })
    } finally { setLoading(false) }
  }

  const shift = (days) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Daily Menu</h1>
          <p className="text-sm text-gray-500 mt-1">See what's being served</p>
        </div>

        {/* Date navigator */}
        <div className="flex items-center justify-between bg-white rounded-2xl border p-3 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => shift(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-gray-800">{date.toDateString()}</p>
            <p className="text-xs text-muted-foreground">{fmt(date) === fmt(new Date()) ? 'Today' : dayName(date)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => shift(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading menu...</div>
        ) : menu ? (
          <div className="space-y-4">
            {MEALS.map(({ key, label, icon: Icon, time, bg, border, icon_bg, icon_color }) => (
              <Card key={key} className={`${bg} ${border} border shadow-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className={`w-10 h-10 ${icon_bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${icon_color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs font-normal text-muted-foreground">{time}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MealRows mealKey={key} data={menu[key]} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Utensils className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No menu available</p>
            <p className="text-sm text-muted-foreground">The menu for this date hasn't been published yet</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default MenuPage
