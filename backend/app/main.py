from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import analytics, auth, categories, expenses, reports

settings = get_settings()

# Interactive API docs are a development aid; don't publish them in production.
docs = (
    {"docs_url": None, "redoc_url": None, "openapi_url": None} if settings.is_production else {}
)
app = FastAPI(title="Daily Ledger API", version="2.0.0", **docs)

# Only this origin may run scripts, fetch, or embed the app. Fonts are self-hosted;
# inline styles are needed by the chart library.
CONTENT_SECURITY_POLICY = "; ".join(
    [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ]
)
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}
# Swagger UI loads its assets from a CDN, so the strict CSP would break it.
CSP_EXEMPT = ("/docs", "/redoc", "/openapi.json")


@app.middleware("http")
async def harden(request: Request, call_next) -> Response:
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > settings.max_body_bytes:
        return JSONResponse({"detail": "Request is too large."}, status.HTTP_413_CONTENT_TOO_LARGE)

    response = await call_next(request)
    response.headers.update(SECURITY_HEADERS)
    if not request.url.path.startswith(CSP_EXEMPT):
        response.headers["Content-Security-Policy"] = CONTENT_SECURITY_POLICY
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if request.url.path.startswith("/api/"):
        # Financial data: never let browsers or proxies keep a copy.
        response.headers["Cache-Control"] = "no-store"
    return response


# Auth uses bearer tokens, not cookies, so cross-origin credentials are never needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(analytics.router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


# In production the built React app is served from the same origin as the API.
static_dir = settings.static_dir
if static_dir and (static_dir / "index.html").is_file():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str) -> FileResponse:
        if path == "api" or path.startswith("api/"):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Not Found")
        candidate = (static_dir / path).resolve()
        if path and candidate.is_file() and candidate.is_relative_to(static_dir.resolve()):
            return FileResponse(candidate)
        # A missing file (robots.txt, favicon.ico, /.well-known/...) is a 404, not the app.
        last_segment = path.rsplit("/", 1)[-1]
        if "." in last_segment or path.startswith(".well-known/"):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Not Found")
        return FileResponse(static_dir / "index.html")
