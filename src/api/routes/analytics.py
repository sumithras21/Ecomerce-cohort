from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.database.models import Invoice, InvoiceLine, Customer
from src.api.database import get_db

router = APIRouter()

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    # Calculate Total Revenue
    total_rev_query = db.query(func.sum(InvoiceLine.quantity * InvoiceLine.unit_price)).scalar()
    
    # Calculate Unique Orders
    total_orders = db.query(func.count(Invoice.invoice_no)).scalar()
    
    # Calculate Customers
    total_customers = db.query(func.count(Customer.id)).scalar()
    
    # Calculate AOV
    aov = total_rev_query / total_orders if total_orders and total_orders > 0 else 0
    
    return {
        "total_revenue": round(total_rev_query, 2) if total_rev_query else 0,
        "total_orders": total_orders,
        "unique_customers": total_customers,
        "avg_order_value": round(aov, 2)
    }

@router.get("/sales/monthly")
def get_monthly_sales(db: Session = Depends(get_db)):
    """
    Groups sales by month to feed the monthly sales chart
    """
    # SQLite datetime string extraction formatting (YYYY-MM)
    monthly_sales = db.query(
        func.strftime('%Y-%m', Invoice.invoice_date).label('month'),
        func.sum(InvoiceLine.quantity * InvoiceLine.unit_price).label('revenue')
    ).join(InvoiceLine, Invoice.invoice_no == InvoiceLine.invoice_no)\
     .group_by('month').order_by('month').all()
     
    return [{"month": row.month, "revenue": round(row.revenue, 2)} for row in monthly_sales]
