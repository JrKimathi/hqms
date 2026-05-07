# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid
from datetime import datetime

from models import (
    SimulationConfig, SimulationResult, UploadSession, UploadedFile,
    Scenario, PatientRecord, Insight, RecommendationList
)
from simulation_engine import run_simulation
from file_parser import parse_uploaded_files, anonymize_records
from insights import generate_recommendations
from scenario_store import ScenarioStore, get_scenario_store
from upload_store import UploadStore, get_upload_store

app = FastAPI(title="Hospital Queue Simulation API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store instances
upload_store = UploadStore()
scenario_store = ScenarioStore()
simulation_results_store = {}  # result_id -> SimulationResult
result_counter = 0


# ========== Upload Endpoints ==========
@app.post("/api/upload", response_model=UploadSession)
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload CSV/Excel/JSON files, parse records, return session."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    parsed_results = await parse_uploaded_files(files)
    
    # Combine all records and anonymize
    all_records = []
    uploaded_files = []
    total_errors = []
    
    for result in parsed_results:
        all_records.extend(result.records)
        uploaded_files.append(UploadedFile(
            name=result.filename,
            size=result.size,
            recordCount=len(result.records),
            errors=result.errors[:5],  # First 5 errors
            status="error" if (len(result.errors) > 0 and len(result.records) == 0) else "ready"
        ))
        total_errors.extend(result.errors)
    
    anonymized = anonymize_records(all_records)
    
    session_id = str(uuid.uuid4())
    upload_store.save_session(session_id, anonymized)
    
    return UploadSession(
        sessionId=session_id,
        files=uploaded_files,
        totalRecords=len(anonymized),
        createdAt=datetime.now(),
        errors=total_errors[:10]  # Limit error list
    )


@app.get("/api/session/{session_id}/records", response_model=List[PatientRecord])
async def get_session_records(session_id: str):
    """Retrieve parsed records from an upload session."""
    records = upload_store.get_records(session_id)
    if records is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return records


# ========== Simulation Endpoint ==========
@app.post("/api/simulate", response_model=SimulationResult)
async def simulate(config: SimulationConfig):
    """Run M/M/c discrete-event simulation with given configuration."""
    global result_counter
    result = run_simulation(config)
    result.runId = f"sim-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{result_counter}"
    result_counter += 1
    simulation_results_store[result.runId] = result
    return result


@app.get("/api/simulate/{run_id}", response_model=SimulationResult)
async def get_simulation_result(run_id: str):
    """Retrieve a previous simulation result."""
    if run_id not in simulation_results_store:
        raise HTTPException(status_code=404, detail="Simulation result not found")
    return simulation_results_store[run_id]


# ========== Insights Endpoint ==========
@app.post("/api/insights", response_model=RecommendationList)
async def insights(result: SimulationResult):
    """Generate AI-driven recommendations based on simulation result."""
    recommendations = generate_recommendations(result)
    return RecommendationList(recommendations=recommendations)


# ========== Scenario Management ==========
@app.get("/api/scenarios", response_model=List[Scenario])
async def get_scenarios():
    """List all saved scenarios."""
    return scenario_store.get_all()


@app.post("/api/scenarios", response_model=Scenario)
async def create_scenario(name: str, config: SimulationConfig):
    """Create a new scenario."""
    return scenario_store.create(name, config)


@app.put("/api/scenarios/{scenario_id}", response_model=Scenario)
async def update_scenario(scenario_id: int, name: Optional[str] = None, config: Optional[SimulationConfig] = None):
    """Update an existing scenario."""
    scenario = scenario_store.update(scenario_id, name, config)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@app.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int):
    """Delete a scenario."""
    if not scenario_store.delete(scenario_id):
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {"success": True}


# ========== Results History ==========
@app.get("/api/results", response_model=List[SimulationResult])
async def get_results_history(limit: int = 50):
    """Get recent simulation results."""
    results = list(simulation_results_store.values())
    results.sort(key=lambda x: x.runId, reverse=True)
    return results[:limit]


@app.post("/api/export/{run_id}/csv")
async def export_results_csv(run_id: str):
    """Export simulation result metrics as CSV."""
    if run_id not in simulation_results_store:
        raise HTTPException(status_code=404, detail="Result not found")
    # Return CSV data (implementation skipped for brevity)
    return {"message": "CSV export endpoint ready"}


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)