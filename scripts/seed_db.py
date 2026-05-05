import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.models import Base, Customer, Product, Invoice, InvoiceLine
from src.data.data_loader import load_and_clean_data

DB_PATH = "sqlite:///ecommerce.db"

def seed_database(csv_path="data/OnlineRetail.csv"):
    print("Loading and cleaning data...")
    df = load_and_clean_data(csv_path)
    
    if df.empty:
        print("Empty dataframe, aborting.")
        return
        
    print("Setting up database...")
    engine = create_engine(DB_PATH)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    print("Extracting relational entities...")
    
    # 1. Customers
    customers_df = df[['CustomerID', 'Country']].drop_duplicates(subset=['CustomerID'])
    customers = [
        Customer(id=int(row.CustomerID), country=row.Country)
        for _, row in customers_df.iterrows()
    ]
    
    # 2. Products
    products_df = df[['StockCode', 'Description']].drop_duplicates(subset=['StockCode'])
    products = [
        Product(stock_code=str(row.StockCode), description=str(row.Description))
        for _, row in products_df.iterrows()
    ]
    
    # 3. Invoices
    invoices_df = df[['InvoiceNo', 'InvoiceDate', 'CustomerID']].drop_duplicates(subset=['InvoiceNo'])
    invoices = [
        Invoice(
            invoice_no=str(row.InvoiceNo), 
            invoice_date=row.InvoiceDate, 
            customer_id=int(row.CustomerID) if pd.notna(row.CustomerID) else None
        )
        for _, row in invoices_df.iterrows()
    ]
    
    print("Inserting Customers, Products, and Invoices...")
    session.add_all(customers)
    session.add_all(products)
    session.add_all(invoices)
    session.commit()
    
    print("Inserting Invoice Lines (this may take a minute)...")
    # For performance on large insert, use core bulk insert
    lines_data = []
    for _, row in df.iterrows():
        lines_data.append({
            "invoice_no": str(row.InvoiceNo),
            "stock_code": str(row.StockCode),
            "quantity": int(row.Quantity),
            "unit_price": float(row.UnitPrice)
        })
        
    # Chunking insert
    chunk_size = 10000
    for i in range(0, len(lines_data), chunk_size):
        chunk = lines_data[i:i + chunk_size]
        session.bulk_insert_mappings(InvoiceLine, chunk)
        session.commit()
        print(f"Inserted {min(i + chunk_size, len(lines_data))}/{len(lines_data)} lines...")
        
    print("Database seeding complete!")
    session.close()

if __name__ == "__main__":
    seed_database()