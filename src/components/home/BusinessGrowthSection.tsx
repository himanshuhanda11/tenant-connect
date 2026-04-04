import React from 'react';
import { TrendingUp, Zap, DollarSign, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: Zap, value: '+300%', label: 'Response Speed', color: 'from-primary to-emerald-400' },
  { icon: DollarSign, value: '-45%', label: 'Cost Per Lead', color: 'from-info to-blue-400' },
  { icon: Mail, value: '98%', label: 'Open Rate', color: 'from-warning to-orange-400' },
];

const graphData = [
  { month: 'Jan', value: 15 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 22 },
  { month: 'Apr', value: 28, label: 'AI Automation ON' },
  { month: 'May', value: 38 },
  { month: 'Jun', value: 42, label: 'Campaign Launched' },
  { month: 'Jul', value: 55 },
  { month: 'Aug', value: 62 },
  { month: 'Sep', value: 70, label: 'Lead Spike' },
  { month: 'Oct', value: 78 },
  { month: 'Nov', value: 88 },
  { month: 'Dec', value: 95 },
];

export default function BusinessGrowthSection() {
  const maxVal = 100;
  const width = 700;
  const height = 240;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = graphData.map((d, i) => ({
    x: padX + (i / (graphData.length - 1)) * chartW,
    y: padY + chartH - (d.value / maxVal) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
  }).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Revenue Impact
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              From 1x to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">5x Revenue</span>{' '}
              Growth
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              See how businesses scale from manual replies to automated revenue growth
            </p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Line Chart */}
          <motion.div
            className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-lg mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">REVENUE TRAJECTORY</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">1x → 5x Growth</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Growth</p>
                <p className="text-lg font-bold text-primary">+400%</p>
              </div>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(142 71% 45%)" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((v) => {
                  const y = padY + chartH - (v / maxVal) * chartH;
                  return (
                    <g key={v}>
                      <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" />
                      <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8">{v}%</text>
                    </g>
                  );
                })}

                {/* Gradient area */}
                <motion.path
                  d={areaPath}
                  fill="url(#areaGrad)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />

                {/* Line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Data points & labels */}
                {points.map((p, i) => (
                  <g key={p.month}>
                    {/* Month label */}
                    <text x={p.x} y={padY + chartH + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{p.month}</text>

                    {/* Dot */}
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={p.label ? 4.5 : 3}
                      className={p.label ? 'fill-primary' : 'fill-primary/60'}
                      stroke={p.label ? 'hsl(var(--background))' : 'none'}
                      strokeWidth={p.label ? 2 : 0}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                    />

                    {/* Milestone labels */}
                    {p.label && (
                      <g>
                        <line x1={p.x} y1={p.y - 6} x2={p.x} y2={p.y - 18} stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="2 2" />
                        <rect x={p.x - 40} y={p.y - 32} width="80" height="14" rx="7" className="fill-foreground" />
                        <text x={p.x} y={p.y - 22} textAnchor="middle" className="fill-background" fontSize="7" fontWeight="600">{p.label}</text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}