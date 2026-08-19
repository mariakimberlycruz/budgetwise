from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.budget import router as budget_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.expense import router as expense_router
from app.api.routes.financial_health import router as financial_health_router
from app.api.routes.health import router as health_router
from app.api.routes.income import router as income_router
from app.api.routes.report import router as report_router
from app.api.routes.recurring_expense import router as recurring_expense_router
from app.api.routes.savings_goal import router as savings_goal_router
from app.api.routes.settings import router as settings_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.db.session import engine
from app.models import Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials="*" not in origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

# /health is intentionally left out of the {success, message, data}
# envelope — it's a plain liveness probe consumed by uptime/infra
# tooling as well as the app, so it keeps a flat response shape.
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(income_router, prefix=settings.API_V1_PREFIX)
app.include_router(expense_router, prefix=settings.API_V1_PREFIX)
app.include_router(budget_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(financial_health_router, prefix=settings.API_V1_PREFIX)
app.include_router(report_router, prefix=settings.API_V1_PREFIX)
app.include_router(savings_goal_router, prefix=settings.API_V1_PREFIX)
app.include_router(recurring_expense_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
