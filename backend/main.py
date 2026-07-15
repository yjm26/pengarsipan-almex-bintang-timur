from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import engine, Base
from routes import auth, dashboard, documents, categories, users, ai, audit, export, profile
import time
from collections import defaultdict

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ALMEX Document Archiving System", version="1.0.0")

# CORS - restrict to known origins
ALLOWED_ORIGINS = [
    "https://pengarsipan-almex-bintang-timur.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://tribal-contains-size-pcs.trycloudflare.com",
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rate limiting (simple in-memory, per IP)
rate_limit_store = defaultdict(list)
RATE_LIMIT = 60  # max requests per minute
RATE_LIMIT_LOGIN = 5  # max login attempts per minute

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    
    # Clean old entries
    rate_limit_store[client_ip] = [t for t in rate_limit_store[client_ip] if now - t < 60]
    
    # Check login rate limit (stricter)
    if request.url.path == "/api/auth/login" and request.method == "POST":
        login_attempts = [t for t in rate_limit_store[f"{client_ip}:login"] if now - t < 60]
        if len(login_attempts) >= RATE_LIMIT_LOGIN:
            return JSONResponse(
                status_code=429,
                content={"detail": "Terlalu banyak percobaan login. Coba lagi dalam 1 menit."}
            )
        rate_limit_store[f"{client_ip}:login"].append(now)
    
    # General rate limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"detail": "Terlalu banyak request. Coba lagi dalam 1 menit."}
        )
    
    rate_limit_store[client_ip].append(now)
    response = await call_next(request)
    return response

# Upload size limit (15MB)
MAX_UPLOAD_SIZE = 15 * 1024 * 1024

@app.middleware("http")
async def upload_size_middleware(request: Request, call_next):
    if request.url.path == "/api/documents/upload" and request.method == "POST":
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_UPLOAD_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "File terlalu besar. Maksimal 15MB."}
            )
    return await call_next(request)

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
