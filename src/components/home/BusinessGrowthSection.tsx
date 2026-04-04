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

        {/* Graph + Stats */}
        <div className="max-w-5xl mx-auto">
          {/* Graph */}
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

            {/* Bar chart */}
            <div className="flex items-end gap-1 sm:gap-2 h-40 sm:h-52 lg:h-60 mt-4">
              {graphData.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 relative group">
                  {d.label && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {d.label}
                    </div>
                  )}
                  <motion.div
                    className={`w-full rounded-t-md ${
                      d.label
                        ? 'bg-gradient-to-t from-primary to-emerald-400 shadow-lg shadow-primary/20'
                        : 'bg-gradient-to-t from-primary/60 to-primary/30'
                    }`}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(d.value / maxVal) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                  />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">{d.month}</span>
                  {d.label && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              ))}
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
