"""
Mock ML Model for Scholarship Eligibility Prediction.
This script demonstrates the AI/ML component of the 3-Tier Architecture.
It takes student features and predicts an eligibility probability score.
"""

import json
import random

class EligibilityPredictor:
    def __init__(self):
        # In a real scenario, we would load a trained model like:
        # self.model = joblib.load('random_forest_model.pkl')
        print("Model initialized: RandomForestClassifier (Mock)")

    def predict_score(self, student_data, scholarship_requirements):
        """
        Calculates a probability score (0 to 100) based on student features vs requirements.
        """
        score = 0.0
        
        # Feature 1: Income Analysis (40% weight)
        income = float(student_data.get('family_income', 999999))
        max_income = float(scholarship_requirements.get('max_income', 0))
        if income <= max_income:
            # Lower income relative to max gets a slight bump
            ratio = income / max_income if max_income > 0 else 1
            score += 40 - (ratio * 10) 
        
        # Feature 2: Academic Performance (40% weight)
        cgpa = float(student_data.get('cgpa', 0.0))
        min_cgpa = float(scholarship_requirements.get('min_cgpa', 10.0))
        if cgpa >= min_cgpa:
            score += (cgpa / 10.0) * 40
            
        # Feature 3: Category Matching (20% weight)
        req_cat = scholarship_requirements.get('category_required', 'Any')
        stu_cat = student_data.get('category', 'General')
        if req_cat == 'Any' or stu_cat == req_cat:
            score += 20
            
        # ML Stochastic Noise (simulating model confidence intervals)
        noise = random.uniform(-2.5, 2.5)
        final_score = min(max(score + noise, 0), 100)
        
        return round(final_score, 2)

# Simulate API Handler
def process_prediction_request(json_payload):
    data = json.loads(json_payload)
    predictor = EligibilityPredictor()
    
    result = predictor.predict_score(
        student_data=data['student'],
        scholarship_requirements=data['scholarship']
    )
    
    return json.dumps({
        "status": "success",
        "eligibility_score": result,
        "is_recommended": result >= 75.0,
        "explanation": "High match based on CGPA and Income criteria." if result >= 75.0 else "Requirements not fully met."
    })

# Test Execution
if __name__ == "__main__":
    test_payload = json.dumps({
        "student": { "family_income": 400000, "cgpa": 9.2, "category": "OBC" },
        "scholarship": { "max_income": 600000, "min_cgpa": 8.0, "category_required": "Any" }
    })
    print(process_prediction_request(test_payload))
