import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from fastapi import HTTPException
from app.config import settings

# Initialize the Groq LLM (Llama 3 is incredibly fast and accurate for this)
llm = ChatGroq(
    temperature=0, # Keep it deterministic for medical analysis
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.1-8b-instant"
)

# Define strict instructions for the AI
system_prompt = """
You are the HospitalOS Triage AI, an advanced medical assistant. 
Your job is to analyze patient symptoms and provide a preliminary triage assessment.
CRITICAL: You are NOT a doctor. You must always output clinical, professional advice.

Analyze the following symptoms for a {age} year old {gender}:
Symptoms: {symptoms}

You MUST return ONLY a valid JSON object (no markdown, no extra text) with exactly these keys:
- "triage_level": (String: "Routine", "Urgent", or "Emergency")
- "possible_causes": (List of strings: 2-3 brief potential conditions)
- "recommendation": (String: What the patient should do next)
- "disclaimer": (String: "This is an AI preliminary analysis, not a medical diagnosis. Please consult a doctor.")
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_prompt)
])

async def analyze_symptoms(symptoms: list[str], age: int, gender: str) -> dict:
    """Runs the LangChain pipeline to analyze symptoms via Groq."""
    try:
        chain = prompt_template | llm
        
        # Format the symptoms list into a comma-separated string
        symptoms_str = ", ".join(symptoms)
        
        # Call the LLM
        response = await chain.ainvoke({
            "age": age,
            "gender": gender,
            "symptoms": symptoms_str
        })
        
        # Parse the JSON response
        return json.loads(response.content)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")