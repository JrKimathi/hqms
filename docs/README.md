# 🏥 Hospital Queue Simulation System (HQMS)

A full-stack web application that simulates patient flow in a hospital using **M/M/c queueing theory** and **discrete‑event simulation**.  
Upload real or synthetic data, configure servers and queue discipline, run simulations, and get AI‑driven insights to reduce wait times and optimise resource allocation.

---

## ✨ Features

- ** Data Upload** – CSV, Excel, or JSON; automatic anonymisation and validation.
- ** Simulation Configuration** – Number of servers, arrival rate (λ), service time (μ), simulation duration, queue discipline (FIFO, Priority, LIFO, Round Robin).
- ** Simulation Engine** – Discrete‑event M/M/c simulator with Erlang‑C derived metrics.
- ** Results Dashboard** – KPIs, wait‑time distribution, queue length charts, server utilisation, patient flow breakdown.
- ** AI‑Driven Insights** – Generates actionable recommendations based on simulation output (for example, add a server, change queue policy).
- ** Scenario Management** – Save, load, compare different configurations.
- ** Export** – Download simulation reports and charts.

---

## Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Frontend    | React, TypeScript, Zustand, CSS (pure – no external chart libs)           |
| Backend     | Python 3.10+, FastAPI, Pandas, NumPy, OpenPyXL, Uvicorn                    |
| Dev Tools   | Vite, ESLint, concurrently (optional)                                     |

---

## Folder Structure
hqms/ # project root
├── frontend/ # React application
│ ├── src/
│ │ ├── components/ # reusable UI (Sidebar, Navbar, Loader, Charts, etc.)
│ │ ├── pages/ # Dashboard, Upload, Simulation, Results, Insights
│ │ ├── hooks/ # useSimulation, useUpload, useResults
│ │ ├── services/ # API client, simulation service, upload service
│ │ ├── store/ # Zustand store (simulationStore.ts)
│ │ ├── types/ # TypeScript interfaces
│ │ ├── utils/ # formatters, fileParser (client‑side fallback)
│ │ └── styles/ # CSS modules
│ ├── index.html
│ ├── package.json
│ └── vite.config.ts
│
├── backend/ # Python FastAPI application
│ ├── main.py # app entry, CORS, route handlers
│ ├── models.py # Pydantic schemas
│ ├── simulation_engine.py # M/M/c event‑loop simulation
│ ├── file_parser.py # CSV/Excel/JSON loading and anonymisation
│ ├── insights.py # recommendation generator
│ ├── scenario_store.py # in‑memory CRUD for scenarios
│ ├── upload_store.py # in‑memory session storage
│ └── requirements.txt
│
└── README.md 


2. Backend setup
cd backend
pip install -r requirements.txt
python main.py   # runs on http://localhost:8000

The backend provides REST APIs and serves the simulation engine.


3. Frontend setup (in a new terminal)

cd frontend
npm install
npm run dev      # runs on http://localhost:5173

4. Open the app

Visit http://localhost:5173 – you should see the dashboard.

Note: The frontend is configured to call the backend at http://localhost:8000/api.
If you change the backend port, update src/services/api.ts accordingly.



API Endpoints (Backend)

Method      Endpoint	                Description
POST	    /api/upload	                Upload files, get session with records
GET	        /api/session/{id}/records	Retrieve parsed patient records
POST	    /api/simulate	            Run simulation with given config
GET	        /api/simulate/{run_id}	    Get previous simulation result
POST	    /api/insights	            Generate recommendations from a result
GET	        /api/scenarios	            List all saved scenarios
POST	    /api/scenarios	            Create new scenario
PUT	        /api/scenarios/{id}	        Update a scenario
DELETE	    /api/scenarios/{id}	        Delete a scenario
GET	        /api/results	            Get recent simulation runs
GET	        /api/health	                Health check

Interactive API docs are available at http://localhost:8000/docs.


# How to Use the Application

Go to Upload Data page.

Drag & drop CSV/Excel/JSON files (or use the sample download).

Files are parsed, validated and anonymised automatically.

# Configure a Simulation
Go to Simulation page.

Adjust number of servers, arrival rate, service time, duration and queue discipline.

Select a built‑in preset (Peak, Off‑Peak, Emergency, Baseline).

Watch the real‑time Erlang‑C preview (traffic intensity, expected wait).


# Run Simulation
Click Run Simulation. The engine processes events and shows progress.

Once complete, results are stored and you are automatically taken to the Results page.


# Analyse Results
Metrics → KPI cards with sparklines.

Charts → queue length over time, wait‑time distribution, utilisation.

Queue → animated visualisation of the queue state.

Compare → side‑by‑side comparison with previous runs.

# Get Insights
Navigate to Insights page.

The AI generates high‑impact recommendations (e.g., “Add a 4th server during peak hours”).

Each recommendation includes estimated impact, effort, and supporting simulation data.

Apply recommendations directly to create new scenarios.

# Simulation Engine Details
**Model:** M/M/c (Markovian arrival & service, c servers).

**Event‑loop** with a priority queue (time‑ordered events).

**Queue disciplines:** FIFO, Priority (pre‑emptive based on 1‑5 urgency), LIFO, Round Robin.

## Performance metrics:

Average/Max wait time

Throughput (patients served / time)

Server utilisation (ρ)

Erlang‑C probability of waiting

Patient flow breakdown (served immediately, waited <15 min, etc.)

###  Visual outputs: hourly arrival/queue data, wait‑time histograms, per‑server stats.

## Acknowledgements
Queueing theory formulas based on “Fundamentals of Queueing Theory” by Gross & Harris.

Inspired by real‑world hospital flow optimisation projects.

Icons and UI adapted from open‑source design systems.