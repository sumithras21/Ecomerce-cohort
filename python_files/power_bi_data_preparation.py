import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("POWER BI DATA PREPARATION - COMPREHENSIVE INTEGRATION")
print("="*60)

# Load and clean the main dataset
print("Loading and cleaning main dataset...")
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')
df = df.dropna(subset=['CustomerID'])
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df = df[df['Quantity'] > 0]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

print(f"Main dataset: {df.shape[0]:,} transactions")

# 1. Create comprehensive customer table
print("\nCreating comprehensive customer table...")

# RFM Analysis
analysis_date = df['InvoiceDate'].max() + timedelta(days=1)
rfm = df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (analysis_date - x.max()).days,
    'InvoiceNo': 'nunique',
    'TotalPrice': 'sum'
}).reset_index()
rfm.columns = ['CustomerID', 'Recency', 'Frequency', 'Monetary']

# RFM Scores
rfm['R_Score'] = pd.qcut(rfm['Recency'], 5, labels=[5, 4, 3, 2, 1])
rfm['F_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
rfm['M_Score'] = pd.qcut(rfm['Monetary'], 5, labels=[1, 2, 3, 4, 5])
rfm['RFM_Total'] = rfm['R_Score'].astype(int) + rfm['F_Score'].astype(int) + rfm['M_Score'].astype(int)

# Customer Segmentation
def segment_customers(row):
    if row['R_Score'] >= 4 and row['F_Score'] >= 4 and row['M_Score'] >= 4:
        return 'Champions'
    elif row['R_Score'] >= 4 and row['F_Score'] >= 3:
        return 'Loyal Customers'
    elif row['R_Score'] >= 4 and row['F_Score'] <= 2:
        return 'New Customers'
    elif row['R_Score'] <= 2 and row['F_Score'] >= 3 and row['M_Score'] >= 3:
        return 'At Risk'
    elif row['R_Score'] <= 2 and row['F_Score'] <= 2:
        return 'Lost'
    elif row['R_Score'] >= 3 and row['M_Score'] >= 4:
        return 'Potential Loyalists'
    else:
        return 'Others'

rfm['RFM_Segment'] = rfm.apply(segment_customers, axis=1)

# Additional customer metrics
customer_metrics = df.groupby('CustomerID').agg({
    'InvoiceDate': ['min', 'max'],
    'TotalPrice': ['mean', 'std'],
    'Quantity': ['sum', 'mean'],
    'StockCode': 'nunique',
    'Country': 'first'
}).round(2)

customer_metrics.columns = ['FirstPurchase', 'LastPurchase', 'AvgOrderValue', 'OrderValueStd',
                         'TotalItems', 'AvgItemsPerOrder', 'ProductDiversity', 'Country']

# Calculate derived metrics
customer_metrics['CustomerLifetime'] = (customer_metrics['LastPurchase'] - customer_metrics['FirstPurchase']).dt.days
customer_metrics['DaysSinceLastPurchase'] = (analysis_date - customer_metrics['LastPurchase']).dt.days
customer_metrics['PurchaseFrequency'] = rfm['Frequency'] / customer_metrics['CustomerLifetime'].replace(0, 1)

# Combine all customer data
customer_table = rfm.merge(customer_metrics, on='CustomerID', how='left')
customer_table['CustomerID'] = customer_table['CustomerID'].astype(int)

print(f"Customer table created: {len(customer_table)} customers")

# 2. Create product table
print("\nCreating comprehensive product table...")

product_stats = df.groupby(['StockCode', 'Description']).agg({
    'Quantity': ['sum', 'mean', 'count'],
    'TotalPrice': ['sum', 'mean'],
    'InvoiceNo': 'nunique',
    'CustomerID': 'nunique'
}).round(2)

product_stats.columns = ['TotalQuantity', 'AvgQuantity', 'OrderCount', 
                       'TotalRevenue', 'AvgPrice', 'UniqueOrders', 'UniqueCustomers']

# Calculate product metrics
product_stats['RevenuePerOrder'] = product_stats['TotalRevenue'] / product_stats['UniqueOrders']
product_stats['ItemsPerOrder'] = product_stats['TotalQuantity'] / product_stats['UniqueOrders']
product_stats['CustomerPenetration'] = product_stats['UniqueCustomers'] / customer_table['CustomerID'].nunique()

product_table = product_stats.reset_index()
product_table['StockCode'] = product_table['StockCode'].astype(str)

print(f"Product table created: {len(product_table)} products")

# 3. Create time/date table
print("\nCreating comprehensive date table...")

date_range = pd.date_range(start=df['InvoiceDate'].min(), 
                          end=df['InvoiceDate'].max() + timedelta(days=365), 
                          freq='D')

date_table = pd.DataFrame({'Date': date_range})
date_table['DateKey'] = date_table['Date'].dt.strftime('%Y%m%d').astype(int)
date_table['Year'] = date_table['Date'].dt.year
date_table['Quarter'] = date_table['Date'].dt.quarter
date_table['Month'] = date_table['Date'].dt.month
date_table['MonthName'] = date_table['Date'].dt.month_name()
date_table['Day'] = date_table['Date'].dt.day
date_table['DayOfWeek'] = date_table['Date'].dt.dayofweek
date_table['DayName'] = date_table['Date'].dt.day_name()
date_table['WeekOfYear'] = date_table['Date'].dt.isocalendar().week
date_table['IsWeekend'] = date_table['Date'].dt.dayofweek >= 5
date_table['IsMonthEnd'] = date_table['Date'].dt.is_month_end
date_table['IsQuarterEnd'] = date_table['Date'].dt.is_quarter_end
date_table['IsYearEnd'] = date_table['Date'].dt.is_year_end

print(f"Date table created: {len(date_table)} days")

# 4. Create country/region table
print("\nCreating country/region table...")

country_data = df.groupby('Country').agg({
    'TotalPrice': ['sum', 'mean', 'count'],
    'CustomerID': 'nunique',
    'InvoiceNo': 'nunique',
    'Quantity': 'sum'
}).round(2)

country_data.columns = ['TotalRevenue', 'AvgOrderValue', 'OrderCount', 
                      'UniqueCustomers', 'UniqueOrders', 'TotalItems']

# Add region mapping
def assign_region(country):
    europe = ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 
              'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Denmark', 'Norway', 
              'Finland', 'Portugal', 'Poland', 'Greece', 'Ireland', 'Czech Republic',
              'Lithuania', 'Iceland', 'Cyprus', 'EIRE', 'European Community']
    
    asia_pacific = ['Australia', 'Japan', 'Singapore', 'Hong Kong', 'Thailand', 
                    'United Arab Emirates', 'Israel', 'Lebanon', 'Bahrain', 'Saudi Arabia']
    
    americas = ['USA', 'Canada', 'Brazil', 'Mexico', 'Chile', 'Argentina']
    
    if country in europe:
        return 'Europe'
    elif country in asia_pacific:
        return 'Asia Pacific'
    elif country in americas:
        return 'Americas'
    else:
        return 'Other'

country_data['Region'] = country_data.index.map(assign_region)
country_data['RevenuePerCustomer'] = country_data['TotalRevenue'] / country_data['UniqueCustomers']
country_data['OrdersPerCustomer'] = country_data['UniqueOrders'] / country_data['UniqueCustomers']

country_table = country_data.reset_index()

print(f"Country table created: {len(country_table)} countries")

# 5. Create sales transactions fact table
print("\nCreating sales transactions fact table...")

# Add date keys to main data
df['DateKey'] = df['InvoiceDate'].dt.strftime('%Y%m%d').astype(int)
df['CustomerID'] = df['CustomerID'].astype(int)
df['StockCode'] = df['StockCode'].astype(str)

# Create fact table with key relationships
fact_table = df[['InvoiceNo', 'StockCode', 'CustomerID', 'DateKey', 'Quantity', 
                 'UnitPrice', 'TotalPrice', 'InvoiceDate', 'Country']].copy()

# Add additional calculated columns
fact_table['Year'] = df['InvoiceDate'].dt.year
fact_table['Month'] = df['InvoiceDate'].dt.month
fact_table['Quarter'] = df['InvoiceDate'].dt.quarter
fact_table['DayOfWeek'] = df['InvoiceDate'].dt.dayofweek

print(f"Fact table created: {len(fact_table)} transactions")

# 6. Create monthly summary table
print("\nCreating monthly summary table...")

monthly_summary = df.groupby([df['InvoiceDate'].dt.to_period('M'), 'Country']).agg({
    'TotalPrice': ['sum', 'mean', 'count'],
    'InvoiceNo': 'nunique',
    'CustomerID': 'nunique',
    'Quantity': 'sum'
}).round(2)

monthly_summary.columns = ['TotalRevenue', 'AvgOrderValue', 'TransactionCount',
                        'UniqueOrders', 'UniqueCustomers', 'TotalItems']
monthly_summary = monthly_summary.reset_index()
monthly_summary['YearMonth'] = monthly_summary['InvoiceDate'].astype(str)
monthly_summary['Year'] = monthly_summary['InvoiceDate'].dt.year
monthly_summary['Month'] = monthly_summary['InvoiceDate'].dt.month

print(f"Monthly summary created: {len(monthly_summary)} records")

# Export all tables for Power BI
print("\nExporting Power BI tables...")

# Main fact table
fact_table.to_csv('../data/power_bi/fact_sales.csv', index=False)
print("[DONE] Fact table exported: ../data/power_bi/fact_sales.csv")

# Dimension tables
customer_table.to_csv('../data/power_bi/dim_customer.csv', index=False)
print("[DONE] Customer dimension exported: ../data/power_bi/dim_customer.csv")

product_table.to_csv('../data/power_bi/dim_product.csv', index=False)
print("[DONE] Product dimension exported: ../data/power_bi/dim_product.csv")

date_table.to_csv('../data/power_bi/dim_date.csv', index=False)
print("[DONE] Date dimension exported: ../data/power_bi/dim_date.csv")

country_table.to_csv('../data/power_bi/dim_country.csv', index=False)
print("[DONE] Country dimension exported: ../data/power_bi/dim_country.csv")

monthly_summary.to_csv('../data/power_bi/monthly_summary.csv', index=False)
print("[DONE] Monthly summary exported: ../data/power_bi/monthly_summary.csv")

# Create Power BI relationships documentation
print("\nCreating Power BI relationships documentation...")

relationships = """
Power BI Data Model Relationships:

Fact Table: fact_sales
|-- dim_customer (CustomerID)
|-- dim_product (StockCode)
|-- dim_date (DateKey)
|-- dim_country (Country)

Dimension Tables:
- dim_customer: Customer analytics, RFM, segmentation
- dim_product: Product performance, pricing analysis
- dim_date: Time intelligence, seasonal analysis
- dim_country: Geographic analysis, regional performance

Additional Tables:
- monthly_summary: Pre-aggregated monthly metrics
"""

with open('../data/power_bi/relationships.txt', 'w') as f:
    f.write(relationships)

print("[DONE] Relationships documentation created: ../data/power_bi/relationships.txt")

# Create Power BI measures documentation
measures = """
Power BI DAX Measures Examples:

Customer Metrics:
Total Customers = DISTINCTCOUNT(fact_sales[CustomerID])
Active Customers = CALCULATE(DISTINCTCOUNT(fact_sales[CustomerID]), 
                FILTER(dim_customer, dim_customer[Recency] <= 90))
Customer Retention Rate = DIVIDE([Active Customers], [Total Customers])

Revenue Metrics:
Total Revenue = SUM(fact_sales[TotalPrice])
Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_date[Date]))
Revenue Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY])

Order Metrics:
Total Orders = DISTINCTCOUNT(fact_sales[InvoiceNo])
Avg Order Value = DIVIDE([Total Revenue], [Total Orders])
Orders per Customer = DIVIDE([Total Orders], [Total Customers])

Product Metrics:
Top Products = TOPN(10, VALUES(dim_product[Description]), 
              CALCULATE(SUM(fact_sales[TotalPrice]), dim_product[Description]))
Product Diversity = DISTINCTCOUNT(fact_sales[StockCode])

Time Intelligence:
Revenue MTD = TOTALMTD([Total Revenue], dim_date[Date])
Revenue QTD = TOTALQTD([Total Revenue], dim_date[Date])
Revenue YTD = TOTALYTD([Total Revenue], dim_date[Date])
"""

with open('../data/power_bi/dax_measures.txt', 'w') as f:
    f.write(measures)

print("[DONE] DAX measures documentation created: ../data/power_bi/dax_measures.txt")

# Summary statistics
print("\n" + "="*60)
print("POWER BI DATA PREPARATION SUMMARY")
print("="*60)
print(f"Fact Table: {len(fact_table):,} transactions")
print(f"Customer Dimension: {len(customer_table):,} customers")
print(f"Product Dimension: {len(product_table):,} products")
print(f"Date Dimension: {len(date_table)} days")
print(f"Country Dimension: {len(country_table)} countries")
print(f"Monthly Summary: {len(monthly_summary)} records")

print(f"\nDate Range: {df['InvoiceDate'].min().date()} to {df['InvoiceDate'].max().date()}")
print(f"Total Revenue: ${df['TotalPrice'].sum():,.2f}")
print(f"Total Orders: {df['InvoiceNo'].nunique():,}")
print(f"Average Order Value: ${df['TotalPrice'].mean():.2f}")

print(f"\nCustomer Segments:")
for segment in customer_table['RFM_Segment'].value_counts().index:
    count = customer_table['RFM_Segment'].value_counts()[segment]
    print(f"  {segment}: {count} customers")

print(f"\nTop Countries:")
for country in country_table.sort_values('TotalRevenue', ascending=False).head(5)['Country']:
    revenue = country_table[country_table['Country'] == country]['TotalRevenue'].iloc[0]
    print(f"  {country}: ${revenue:,.2f}")

print("\nAll Power BI data tables exported to ../data/power_bi/ directory")
print("Ready for Power BI dashboard creation!")
print("Use relationships.txt and dax_measures.txt files for guidance")
