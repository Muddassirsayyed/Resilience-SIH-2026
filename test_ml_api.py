import urllib.request, json
req = urllib.request.Request(
  'http://localhost:8000/api/ml/predict-priority', 
  method='POST', 
  data=b'{"task": {"task_id": "T-1", "criticality": "CRITICAL", "overdue": true, "safety_critical": true}}',
  headers={'Content-Type': 'application/json'}
)
try:
  res = urllib.request.urlopen(req).read().decode()
  print(json.loads(res))
except Exception as e:
  print('Failed:', e)
