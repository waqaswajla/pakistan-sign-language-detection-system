
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import capture, recognition, speech, stream, contact
from core.config import settings

app = FastAPI(title="PSL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(capture.router,     prefix="/api", tags=["capture"])
app.include_router(recognition.router, prefix="/api", tags=["recognition"])
app.include_router(speech.router,      prefix="/api", tags=["speech"])
app.include_router(stream.router,      prefix="/api", tags=["stream"])
app.include_router(contact.router,     prefix="/api", tags=["contact"])


@app.get("/")
def root():
    return {"status": "PSL API running"}
