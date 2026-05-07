# models.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class QueueDiscipline(str, Enum):
    FIFO = "FIFO"
    Priority = "Priority"
    LIFO = "LIFO"
    RoundRobin = "Round Robin"


class SimulationConfig(BaseModel):
    servers: int = Field(3, ge=1, le=20)
    arrivalRate: float = Field(12.0, ge=0.1, le=200)  # patients per hour
    serviceTime: float = Field(8.0, ge=0.5, le=120)   # minutes per patient
    simDuration: int = Field(480, ge=60, le=86400)    # minutes
    discipline: QueueDiscipline = QueueDiscipline.FIFO
    priorityEnabled: bool = False
    warmUpPeriod: int = Field(30, ge=0, le=480)


class WaitTimeBucket(BaseModel):
    rangeLabel: str
    count: int
    percentage: float


class HourlyDataPoint(BaseModel):
    hour: str
    arrivals: int
    queueLength: int
    utilization: float


class PatientRecord(BaseModel):
    id: str
    arrivalTime: float
    serviceStart: float
    serviceEnd: float
    serverId: int
    waitTime: float
    serviceTime: float
    priority: int
    department: str


class ServerStats(BaseModel):
    id: int
    busyTime: float
    idleTime: float
    utilization: float
    patientsServed: int


class SimulationResult(BaseModel):
    runId: str
    scenarioName: str = "Simulation Run"
    config: SimulationConfig
    avgWaitTime: float
    avgServiceTime: float
    avgSystemTime: float
    avgQueueLength: float
    avgSystemLength: float
    throughput: float
    patientsPerHour: float
    totalPatients: int
    maxQueueLength: int
    maxQueueTime: float
    serverUtilization: float
    idleServerTime: float
    probWaiting: float
    waitTimeBuckets: List[WaitTimeBucket]
    hourlyData: List[HourlyDataPoint]
    patientRecords: List[PatientRecord]
    serverStats: List[ServerStats]
    servedImmediately: float
    waitedUnder15: float
    waited15to30: float
    waitedOver30: float


class UploadedFile(BaseModel):
    name: str
    size: int
    recordCount: int
    errors: List[str]
    status: str


class UploadSession(BaseModel):
    sessionId: str
    files: List[UploadedFile]
    totalRecords: int
    createdAt: datetime
    errors: List[str] = []


class Scenario(BaseModel):
    id: int
    name: str
    config: SimulationConfig
    createdAt: datetime


class Insight(BaseModel):
    id: int
    priority: str  # high, medium, low
    title: str
    body: str
    impact: str
    effort: str
    category: str


class RecommendationList(BaseModel):
    recommendations: List[Insight]