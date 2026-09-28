import sys, os
sys.path.append(os.path.abspath('backend'))
from services.cp_sat_scheduler import CPSATScheduler
from datetime import datetime, timezone, timedelta

BASE_DATE = datetime(2026, 9, 28, tzinfo=timezone.utc)

def iso(minutes_offset:int)->str:
    dt = BASE_DATE + timedelta(minutes=minutes_offset)
    return dt.replace(tzinfo=timezone.utc).isoformat().replace('+00:00','Z')

scheduler = CPSATScheduler()

tasks = [
    {"title":"High","priority_score":0.9,"duration_hours":1.0,"location":"L"},
    {"title":"Low1","priority_score":0.1,"duration_hours":1.0,"location":"L"},
    {"title":"Low2","priority_score":0.1,"duration_hours":1.0,"location":"L"},
]

windows = [
    {"id":"w1","location":"L","section_code":"S","start_time":iso(0),"end_time":iso(120)},
    {"id":"w2","location":"L","section_code":"S","start_time":iso(0),"end_time":iso(60)},
    {"id":"w3","location":"L","section_code":"S","start_time":iso(60),"end_time":iso(120)},
]

result = scheduler.schedule(tasks, windows, train_movements=[])
print("Scheduled blocks:")
for block in result.scheduled_blocks:
    print(block)
print("Deferred tasks:", [t['title'] for t in result.deferred_tasks])
