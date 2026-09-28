def get_coa_trains():
    return [
        {
            "source": "COA",
            "train_number": "12904",
            "train_type": "EXPRESS",
            "section": "KNP-04",
            "direction": "UP",
            "scheduled_arrival": "22:00",
            "scheduled_departure": "22:15",
            "status": "ON_TIME"
        },
        {
            "source": "COA",
            "train_number": "12311",
            "train_type": "MAIL",
            "section": "KNP-07",
            "direction": "DOWN",
            "scheduled_arrival": "23:50",
            "scheduled_departure": "23:55",
            "status": "DELAYED"
        },
        {
            "source": "COA",
            "train_number": "G/7821",
            "train_type": "FREIGHT",
            "section": "KNP-04",
            "direction": "UP",
            "scheduled_arrival": "01:20",
            "scheduled_departure": "01:40",
            "status": "ON_ROUTE"
        }
    ]

def get_coa_block_windows():
    return [
        {
            "source": "COA",
            "corridor": "KNP-04",
            "start_time": "22:00",
            "end_time": "03:00",
            "duration_minutes": 300,
            "maintenance_allowed": True
        },
        {
            "source": "COA",
            "corridor": "KNP-07",
            "start_time": "00:30",
            "end_time": "02:00",
            "duration_minutes": 90,
            "maintenance_allowed": True
        },
        {
            "source": "COA",
            "corridor": "KNP-03",
            "start_time": "22:30",
            "end_time": "01:30",
            "duration_minutes": 180,
            "maintenance_allowed": True
        }
    ]
