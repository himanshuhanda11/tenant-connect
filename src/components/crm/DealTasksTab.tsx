import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useDealTasks } from '@/hooks/useCrmExtras';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function DealTasksTab({ dealId }: { dealId: string }) {
  const { tasks, addTask, toggleTask, deleteTask } = useDealTasks(dealId);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title..."
          className="h-9 text-sm"
        />
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-9 text-xs flex-1"
          />
          <Button size="sm" className="h-9 gap-1.5" disabled={!title.trim()}
            onClick={async () => {
              await addTask(title, due ? new Date(due).toISOString() : null);
              setTitle(''); setDue('');
            }}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground/70">No tasks yet</div>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map(t => {
            const done = t.status === 'done';
            const overdue = !done && t.due_at && isPast(new Date(t.due_at));
            return (
              <li key={t.id} className={cn(
                'group rounded-lg border bg-card p-2.5 flex items-start gap-2.5 transition',
                done ? 'border-border/40 opacity-60' : overdue ? 'border-rose-200 bg-rose-50/40' : 'border-border/60'
              )}>
                <Checkbox checked={done} onCheckedChange={() => toggleTask(t)} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>{t.title}</p>
                  {t.due_at && (
                    <p className={cn('text-[11px] flex items-center gap-1 mt-0.5', overdue ? 'text-rose-600' : 'text-muted-foreground')}>
                      <CalendarIcon className="h-2.5 w-2.5" />
                      {format(new Date(t.due_at), 'PP p')} · {formatDistanceToNow(new Date(t.due_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteTask(t.id)}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
