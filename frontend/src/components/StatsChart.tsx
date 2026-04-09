import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { doc, onSnapshot } from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import { GlassPanel } from './GlassPanel'

type Daily = Record<string, number>

export function StatsChart() {
  const [daily, setDaily] = useState<Daily>({})
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const db = getDb()
    const ref = doc(db, 'stats', 'global')
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setDaily({})
        setTotal(0)
        return
      }
      const data = snap.data() as { daily?: Daily; total?: number }
      setDaily(data.daily ?? {})
      setTotal(typeof data.total === 'number' ? data.total : 0)
    })
  }, [])

  const chartData = useMemo(() => {
    const entries = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b))
    let cumulative = 0
    return entries.map(([date, count]) => {
      cumulative += count
      return { date, cumulative, new: count }
    })
  }, [daily])

  return (
    <GlassPanel className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cardinal/80">
            Signatures over time
          </p>
          <h2 className="font-display text-2xl font-semibold text-stone-900 md:text-3xl">
            Petition momentum
          </h2>
        </div>
        <div className="rounded-2xl border border-cardinal/25 bg-cardinal/[0.07] px-4 py-2 text-right shadow-inner ring-1 ring-cardinal/10">
          <p className="text-xs uppercase tracking-wider text-cardinal">Total</p>
          <p className="font-display text-3xl font-bold text-cardinal tabular-nums">
            {total ?? '—'}
          </p>
        </div>
      </div>
      <div className="h-64 w-full md:h-72">
        {chartData.length === 0 ? (
          <p className="text-center text-sm text-stone-500">
            Chart appears after the first signature is recorded.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8C1515" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#8C1515" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(15, 60, 40, 0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#57534e', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(120, 113, 108, 0.25)' }}
              />
              <YAxis
                tick={{ fill: '#57534e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  border: '1px solid rgba(140, 21, 21, 0.2)',
                  borderRadius: '12px',
                  color: '#1c1917',
                  boxShadow: '0 8px 24px rgba(15, 60, 40, 0.1)',
                }}
                labelStyle={{ color: '#44403c' }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'cumulative' ? 'Cumulative' : 'New that day',
                ]}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#8C1515"
                strokeWidth={2}
                fill="url(#fillCumulative)"
                name="cumulative"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassPanel>
  )
}
