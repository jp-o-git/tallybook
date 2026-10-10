from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
from .orders import orders
from .overview import overview
from .products import products


app = FastAPI()
FRONTEND_URL = os.getenv("FRONTEND_REDIRECT_URI", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders)
app.include_router(overview)
app.include_router(products)

