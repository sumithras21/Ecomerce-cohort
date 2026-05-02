import pandas as pd

# Load dataset
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')
print("Using OnlineRetail.csv dataset")

# Show first 5 rows
print("First 5 rows of the dataset:")
print(df.head())

# Dataset information
print("\nDataset Information:")
print(df.info())

# Basic statistics
print("\nBasic Statistics:")
print(df.describe())

# Data Cleaning
print("\n" + "="*50)
print("DATA CLEANING")
print("="*50)

# Remove missing Customer IDs
print(f"Original dataset shape: {df.shape}")
df_clean = df.dropna(subset=['CustomerID'])
print(f"After removing missing Customer IDs: {df_clean.shape}")

# Remove cancelled orders (invoices starting with 'C')
df_clean = df_clean[~df_clean['InvoiceNo'].astype(str).str.startswith('C')]
print(f"After removing cancelled orders: {df_clean.shape}")

# Remove negative quantities
df_clean = df_clean[df_clean['Quantity'] > 0]
print(f"After removing negative quantities: {df_clean.shape}")

# Create TotalPrice column
df_clean['TotalPrice'] = df_clean['Quantity'] * df_clean['UnitPrice']
print(f"Created TotalPrice column")

print("\nCleaned Data:")
print(df_clean.head())

# Monthly Sales Analysis
print("\n" + "="*50)
print("MONTHLY SALES ANALYSIS")
print("="*50)

import matplotlib.pyplot as plt

# Convert date column
df_clean['InvoiceDate'] = pd.to_datetime(df_clean['InvoiceDate'])

# Create month column
df_clean['Month'] = df_clean['InvoiceDate'].dt.to_period('M')

# Group sales by month
monthly_sales = df_clean.groupby('Month')['TotalPrice'].sum()

print("Monthly Sales:")
print(monthly_sales)

# Plot graph
plt.figure(figsize=(10,5))
monthly_sales.plot(kind='line', marker='o')
plt.title("Monthly Sales Trend")
plt.xlabel("Month")
plt.ylabel("Sales")
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()

# Save the chart
plt.savefig("../charts/monthly_sales.png", dpi=300, bbox_inches='tight')
print("\nChart saved as: ../charts/monthly_sales.png")
plt.show()

# Top 10 Products Analysis
print("\n" + "="*50)
print("TOP 10 PRODUCTS ANALYSIS")
print("="*50)

top_products = df_clean.groupby('Description')['Quantity'].sum().sort_values(ascending=False).head(10)

print("Top 10 Products by Quantity Sold:")
print(top_products)

# Plot bar chart
plt.figure(figsize=(12,6))
top_products.plot(kind='bar')
plt.title("Top 10 Products by Quantity Sold")
plt.xlabel("Products")
plt.ylabel("Quantity Sold")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

# Save the chart
plt.savefig("../charts/top_products.png", dpi=300, bbox_inches='tight')
print("\nChart saved as: ../charts/top_products.png")
plt.show()

# Top Countries by Sales Analysis
print("\n" + "="*50)
print("TOP COUNTRIES BY SALES")
print("="*50)

country_sales = df_clean.groupby('Country')['TotalPrice'].sum().sort_values(ascending=False).head(10)

print("Top 10 Countries by Sales:")
print(country_sales)

# Plot bar chart
plt.figure(figsize=(12,6))
country_sales.plot(kind='bar')
plt.title("Top 10 Countries by Sales")
plt.xlabel("Country")
plt.ylabel("Sales")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

# Save the chart
plt.savefig("../charts/top_countries.png", dpi=300, bbox_inches='tight')
print("\nChart saved as: ../charts/top_countries.png")
plt.show()

# Cohort Analysis (MAIN FEATURE)
print("\n" + "="*50)
print("COHORT ANALYSIS - CUSTOMER RETENTION")
print("="*50)

import seaborn as sns

# Create invoice month
df_clean['InvoiceMonth'] = df_clean['InvoiceDate'].dt.to_period('M')

# Create cohort month (first purchase month for each customer)
df_clean['CohortMonth'] = df_clean.groupby('CustomerID')['InvoiceDate'].transform('min').dt.to_period('M')

# Calculate month difference (cohort index)
df_clean['CohortIndex'] = (
    (df_clean['InvoiceMonth'].dt.year - df_clean['CohortMonth'].dt.year) * 12
    + (df_clean['InvoiceMonth'].dt.month - df_clean['CohortMonth'].dt.month)
)

print("Cohort Analysis Data:")
print(df_clean[['CustomerID', 'InvoiceDate', 'InvoiceMonth', 'CohortMonth', 'CohortIndex']].head(10))

# Count unique customers for each cohort and period
cohort_data = df_clean.groupby(['CohortMonth', 'CohortIndex'])['CustomerID'].nunique().reset_index()

# Create pivot table
cohort_table = cohort_data.pivot(index='CohortMonth',
                                 columns='CohortIndex',
                                 values='CustomerID')

print("\nCohort Table (Customer Counts):")
print(cohort_table)

# Calculate retention rates
cohort_size = cohort_table.iloc[:,0]
retention = cohort_table.divide(cohort_size, axis=0)

print("\nRetention Rates (%):")
print((retention * 100).round(1))

# Plot heatmap
plt.figure(figsize=(12,8))
sns.heatmap(retention,
            annot=True,
            fmt='.0%',
            cmap='Blues',
            linewidths=0.5,
            cbar_kws={'label': 'Retention Rate'})

plt.title("Customer Retention Cohort Analysis", fontsize=16, pad=20)
plt.xlabel("Cohort Index (Months since first purchase)", fontsize=12)
plt.ylabel("Cohort Month (First purchase month)", fontsize=12)
plt.tight_layout()

# Save the chart
plt.savefig("../charts/cohort_analysis.png", dpi=300, bbox_inches='tight')
print("\nCohort analysis chart saved as: ../charts/cohort_analysis.png")
plt.show()

# Summary Statistics
print("\n" + "="*50)
print("PROJECT SUMMARY")
print("="*50)
print(f"Total Customers: {df_clean['CustomerID'].nunique()}")
print(f"Total Orders: {df_clean['InvoiceNo'].nunique()}")
print(f"Total Products: {df_clean['StockCode'].nunique()}")
print(f"Total Revenue: ${df_clean['TotalPrice'].sum():,.2f}")
print(f"Average Order Value: ${df_clean['TotalPrice'].mean():,.2f}")
print(f"Date Range: {df_clean['InvoiceDate'].min()} to {df_clean['InvoiceDate'].max()}")
