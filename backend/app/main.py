from fastapi import FastAPI
import uvicorn

# Clean relative imports from your folder structure
from routers import appointments, billing

app = FastAPI(
    title="AI-Powered Hospital Management System",
    description="Enterprise Edition - Module 2 Workspace",
    version="0.1.0"
)

# Register your dedicated module routers
app.include_router(appointments.router)
app.include_router(billing.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the HMS Backend API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)