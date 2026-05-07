# scenario_store.py
from typing import List, Optional
from datetime import datetime
from models import Scenario, SimulationConfig


class ScenarioStore:
    """In-memory storage for simulation scenarios."""
    
    def __init__(self):
        self._scenarios: List[Scenario] = []
        self._next_id = 1
        # Seed with default scenarios
        self._seed_defaults()
    
    def _seed_defaults(self):
        default_config = SimulationConfig(servers=3, arrivalRate=12, serviceTime=8, simDuration=480)
        self.create("Baseline — Current System", SimulationConfig(servers=2, arrivalRate=12, serviceTime=10))
        self.create("Peak Hours — 3 Servers", SimulationConfig(servers=3, arrivalRate=18, serviceTime=8))
        self.create("Emergency Surge", SimulationConfig(servers=5, arrivalRate=35, serviceTime=12))
    
    def get_all(self) -> List[Scenario]:
        return self._scenarios
    
    def get(self, scenario_id: int) -> Optional[Scenario]:
        for s in self._scenarios:
            if s.id == scenario_id:
                return s
        return None
    
    def create(self, name: str, config: SimulationConfig) -> Scenario:
        scenario = Scenario(
            id=self._next_id,
            name=name,
            config=config,
            createdAt=datetime.now()
        )
        self._scenarios.append(scenario)
        self._next_id += 1
        return scenario
    
    def update(self, scenario_id: int, name: Optional[str] = None, config: Optional[SimulationConfig] = None) -> Optional[Scenario]:
        scenario = self.get(scenario_id)
        if not scenario:
            return None
        if name:
            scenario.name = name
        if config:
            scenario.config = config
        return scenario
    
    def delete(self, scenario_id: int) -> bool:
        for i, s in enumerate(self._scenarios):
            if s.id == scenario_id:
                del self._scenarios[i]
                return True
        return False


# Dependency injection helper
_scenario_store_instance = None

def get_scenario_store() -> ScenarioStore:
    global _scenario_store_instance
    if _scenario_store_instance is None:
        _scenario_store_instance = ScenarioStore()
    return _scenario_store_instance