"""
iRevolution Flask Application
------------------------------
Serves the Arsha-inspired template with embedded Tableau Public
dashboards, stories, and reports. Also provides API endpoints
for KPI counters and the interactive product specification table.
"""

import os
import pandas as pd
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# ── Load datasets at startup ──────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _read(filename):
    return pd.read_csv(os.path.join(DATA_DIR, filename))


apple_products = _read("apple_products.csv.csv")
flipkart = _read("Flipkart_Smartphone.csv")
annual_rev = _read("Annual_Revenue.csv")
market_pen = _read("Market_Penetrationiphone.csv")


# ── Pages ─────────────────────────────────────────────────────────
@app.route("/")
def index():
    """Main single-page application."""
    return render_template("index.html")


# ── API Endpoints (for KPI counters & product table) ──────────────
@app.route("/api/kpis")
def api_kpis():
    """Key Performance Indicators computed from data."""
    total_products = len(apple_products)
    avg_price = int(apple_products["Sale Price"].mean())
    avg_rating = round(apple_products["Star Rating"].mean(), 1)
    latest_rev = float(annual_rev["Revenue ($bn)"].dropna().iloc[-1])
    total_brands = flipkart["brand"].nunique()
    total_models_fk = flipkart["model"].nunique()
    max_units = float(market_pen["Units sold (mm)"].max())
    max_users = float(market_pen["Active Users (mm)"].max())
    return jsonify({
        "totalProducts": total_products,
        "avgPrice": avg_price,
        "avgRating": avg_rating,
        "latestRevenue": latest_rev,
        "totalBrands": total_brands,
        "totalModelsFlipkart": total_models_fk,
        "maxUnitsSold": max_units,
        "maxActiveUsers": max_users,
    })


@app.route("/api/apple-products")
def api_apple_products():
    """Full apple products table data for the specification report."""
    cols = ["Product Name", "Sale Price", "Mrp", "Discount Percentage",
            "Number Of Ratings", "Star Rating", "Ram"]
    df = apple_products[cols].copy()
    df = df.fillna("")
    return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
