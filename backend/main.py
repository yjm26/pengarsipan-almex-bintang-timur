from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, dashboard, documents, categories, users, ai, audit, export, profile

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ALMEX Document Archiving System", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(documents.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(audit.router)
app.include_router(export.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "ALMEX Document Archiving System API", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
