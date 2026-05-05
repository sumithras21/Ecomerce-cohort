from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Customer(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True)
    country = Column(String)
    
    invoices = relationship("Invoice", back_populates="customer")

class Product(Base):
    __tablename__ = 'products'
    stock_code = Column(String, primary_key=True)
    description = Column(String)

class Invoice(Base):
    __tablename__ = 'invoices'
    invoice_no = Column(String, primary_key=True)
    invoice_date = Column(DateTime)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True)
    
    customer = relationship("Customer", back_populates="invoices")
    lines = relationship("InvoiceLine", back_populates="invoice")

class InvoiceLine(Base):
    __tablename__ = 'invoice_lines'
    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_no = Column(String, ForeignKey('invoices.invoice_no'))
    stock_code = Column(String, ForeignKey('products.stock_code'))
    quantity = Column(Integer)
    unit_price = Column(Float)
    
    invoice = relationship("Invoice", back_populates="lines")

# Add some indexing for performance
Index('idx_invoice_date', Invoice.invoice_date)
Index('idx_customer_id', Invoice.customer_id)
