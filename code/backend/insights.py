# insights.py
from typing import List
from models import SimulationResult, Insight


def generate_recommendations(result: SimulationResult) -> List[Insight]:
    """Generate AI-driven recommendations based on simulation metrics."""
    recommendations = []
    rec_id = 1
    
    config = result.config
    util = result.serverUtilization
    avg_wait = result.avgWaitTime
    prob_wait = result.probWaiting
    traffic_intensity = (config.arrivalRate / 60) / (config.servers * (1 / config.serviceTime))
    
    # High priority: unstable system or very high wait
    if traffic_intensity >= 0.9:
        recommendations.append(Insight(
            id=rec_id,
            priority="high",
            title="System Near Instability – Increase Servers",
            body=f"Traffic intensity ρ = {traffic_intensity:.2f} exceeds 0.9, causing excessive queue growth. Add at least one additional server to bring ρ below 0.8.",
            impact=f"Wait time ↓ {min(70, int((traffic_intensity - 0.7) * 200))}%",
            effort="Medium",
            category="Staffing"
        ))
        rec_id += 1
    
    # High wait time recommendation
    if avg_wait > 20:
        recommendations.append(Insight(
            id=rec_id,
            priority="high",
            title="Reduce Average Wait Time by Adding Server During Peak",
            body=f"Current average wait {avg_wait:.1f} min exceeds target. Adding one server during peak hours would reduce wait by estimated 35-50%.",
            impact=f"Wait ↓ {min(50, int(avg_wait * 1.5))}%",
            effort="Medium",
            category="Staffing"
        ))
        rec_id += 1
    
    # Priority queue if discipline not Priority
    if config.discipline != "Priority" and prob_wait > 0.6:
        recommendations.append(Insight(
            id=rec_id,
            priority="high",
            title="Implement Priority Queuing for Emergency Cases",
            body="Current FCFS/LIFO/RR treats all patients equally. Implement 3-tier priority to reduce critical patient wait times.",
            impact="Critical wait ↓ 68%",
            effort="Low",
            category="Queue Policy"
        ))
        rec_id += 1
    
    # Utilization optimization
    if util < 50 and config.servers > 1:
        recommendations.append(Insight(
            id=rec_id,
            priority="medium",
            title="Consider Reducing Servers During Low Traffic",
            body=f"Current utilization {util:.1f}% is low; reduce servers by 1 during off-peak to improve efficiency without affecting wait times.",
            impact="Cost ↓ 20%",
            effort="Low",
            category="Scheduling"
        ))
        rec_id += 1
    
    # Service time bottleneck
    if result.avgServiceTime > config.serviceTime * 1.1:
        recommendations.append(Insight(
            id=rec_id,
            priority="medium",
            title="Reduce Service Time Variability (Standardize Processes)",
            body="Service times show high variance. Implement standardized protocols or pre-registration to reduce average service time.",
            impact="Service time ↓ 15%",
            effort="Medium",
            category="Process"
        ))
        rec_id += 1
    
    # Low priority: fine-tuning
    if result.servedImmediately < 30 and len(result.patientRecords) > 100:
        recommendations.append(Insight(
            id=rec_id,
            priority="low",
            title="Add Self-Service Kiosk for Registration",
            body="Many patients wait despite available servers due to registration bottleneck. Kiosks would offload triage staff.",
            impact="Immediate service ↑ 40%",
            effort="High",
            category="Process"
        ))
        rec_id += 1
    
    # Add generic recommendation if none generated
    if len(recommendations) == 0:
        recommendations.append(Insight(
            id=1,
            priority="low",
            title="System Performing Well – Monitor Periodically",
            body="Current configuration yields acceptable wait times and utilization. Continue monitoring arrival patterns for seasonal changes.",
            impact="Stability maintained",
            effort="Low",
            category="Maintenance"
        ))
    
    return recommendations[:6]  # Limit to 6 recommendations