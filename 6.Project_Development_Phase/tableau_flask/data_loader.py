"""
iRevolution Data Loader
-----------------------
Downloads the Apple iPhone India dataset (XLSX) from Google Sheets,
parses all 7 sheets, and exports clean CSVs for Tableau Public import.
"""

import os
import requests
import pandas as pd

# Google Sheets export URL (XLSX format)
XLSX_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1p1ZWaYcEuFl5UNFcmNvpkXi3JnoHamut/export?format=xlsx"
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
XLSX_PATH = os.path.join(DATA_DIR, "apple_products.xlsx")

# The 7 sheets expected in the workbook
SHEET_NAMES = [
    "apple_products",
    "Flipkart_smartphone",
    "Annual revenue",
    "Market penetration (iPhone)",
    "Country wise share",
    "Quarterly-share",
    "Model-wise share",
]


def download_xlsx():
    """Download the XLSX file from Google Sheets."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(XLSX_PATH):
        print(f"[INFO] XLSX already exists at {XLSX_PATH}, skipping download.")
        return
    print("[INFO] Downloading dataset from Google Sheets...")
    resp = requests.get(XLSX_URL, timeout=60)
    resp.raise_for_status()
    with open(XLSX_PATH, "wb") as f:
        f.write(resp.content)
    print(f"[INFO] Saved to {XLSX_PATH} ({len(resp.content):,} bytes)")


def parse_and_export():
    """Read each sheet and export as a clean CSV."""
    xl = pd.ExcelFile(XLSX_PATH, engine="openpyxl")
    available = xl.sheet_names
    print(f"\n[INFO] Sheets found in workbook: {available}")

    for sheet in available:
        df = xl.parse(sheet)

        # Basic cleaning
        df.columns = df.columns.str.strip()
        df = df.dropna(how="all")  # drop fully empty rows

        csv_name = sheet.replace(" ", "_").replace("(", "").replace(")", "") + ".csv"
        csv_path = os.path.join(DATA_DIR, csv_name)
        df.to_csv(csv_path, index=False)

        print(f"\n--- {sheet} ---")
        print(f"  Rows : {len(df)}")
        print(f"  Cols : {list(df.columns)}")
        print(f"  Saved: {csv_path}")

    print("\n[SUCCESS] All CSVs exported to", DATA_DIR)
    print("Upload these CSVs to Tableau Public to create your visualizations.")


if __name__ == "__main__":
    download_xlsx()
    parse_and_export()
