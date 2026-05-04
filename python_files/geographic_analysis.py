import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("GEOGRAPHIC ANALYSIS - REGIONAL SALES INSIGHTS")
print("="*60)

# Load and clean data
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')
df = df.dropna(subset=['CustomerID'])
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df = df[df['Quantity'] > 0]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

print(f"Dataset loaded: {df.shape[0]:,} transactions")
print(f"Unique countries: {df['Country'].nunique()}")

# Country-level analysis
print("\nAnalyzing country-level performance...")

country_stats = df.groupby('Country').agg({
    'TotalPrice': ['sum', 'mean', 'count'],
    'CustomerID': 'nunique',
    'InvoiceNo': 'nunique',
    'Quantity': 'sum'
}).round(2)

# Flatten column names
country_stats.columns = ['TotalRevenue', 'AvgOrderValue', 'OrderCount', 
                       'UniqueCustomers', 'UniqueOrders', 'TotalItems']

# Calculate additional metrics
country_stats['RevenuePerCustomer'] = country_stats['TotalRevenue'] / country_stats['UniqueCustomers']
country_stats['OrdersPerCustomer'] = country_stats['UniqueOrders'] / country_stats['UniqueCustomers']
country_stats['ItemsPerOrder'] = country_stats['TotalItems'] / country_stats['UniqueOrders']

# Sort by total revenue
country_stats = country_stats.sort_values('TotalRevenue', ascending=False)

print(f"Country analysis completed for {len(country_stats)} countries")

# Regional grouping
print("\nCreating regional groupings...")

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

# Add region column
df['Region'] = df['Country'].apply(assign_region)
country_stats['Region'] = country_stats.index.map(assign_region)

print("Regional groupings created")

# Time-based geographic analysis
print("\nAnalyzing temporal patterns by geography...")

# Monthly sales by country
df['YearMonth'] = df['InvoiceDate'].dt.to_period('M')
monthly_country_sales = df.groupby(['YearMonth', 'Country'])['TotalPrice'].sum().reset_index()

# Quarterly sales by region
df['Quarter'] = df['InvoiceDate'].dt.to_period('Q')
quarterly_region_sales = df.groupby(['Quarter', 'Region'])['TotalPrice'].sum().reset_index()

print("Temporal analysis completed")

# Create visualizations
plt.style.use('default')

# 1. Country Performance Overview
plt.figure(figsize=(20, 15))

# Top 15 countries by revenue
plt.subplot(3, 4, 1)
top_15_countries = country_stats.head(15)
plt.barh(range(len(top_15_countries)), top_15_countries['TotalRevenue'], color='skyblue')
plt.yticks(range(len(top_15_countries)), [country[:20] for country in top_15_countries.index])
plt.xlabel('Total Revenue ($)')
plt.title('Top 15 Countries by Revenue', fontsize=12, fontweight='bold')
plt.grid(True, alpha=0.3)

# Customer distribution by country
plt.subplot(3, 4, 2)
plt.barh(range(len(top_15_countries)), top_15_countries['UniqueCustomers'], color='lightgreen')
plt.yticks(range(len(top_15_countries)), [country[:20] for country in top_15_countries.index])
plt.xlabel('Unique Customers')
plt.title('Top 15 Countries by Customers', fontsize=12, fontweight='bold')
plt.grid(True, alpha=0.3)

# Average order value by country
plt.subplot(3, 4, 3)
top_15_aov = country_stats.head(15).sort_values('AvgOrderValue', ascending=True)
plt.barh(range(len(top_15_aov)), top_15_aov['AvgOrderValue'], color='salmon')
plt.yticks(range(len(top_15_aov)), [country[:20] for country in top_15_aov.index])
plt.xlabel('Average Order Value ($)')
plt.title('Top 15 Countries by AOV', fontsize=12, fontweight='bold')
plt.grid(True, alpha=0.3)

# Revenue per customer by country
plt.subplot(3, 4, 4)
top_15_rpc = country_stats.head(15).sort_values('RevenuePerCustomer', ascending=True)
plt.barh(range(len(top_15_rpc)), top_15_rpc['RevenuePerCustomer'], color='purple')
plt.yticks(range(len(top_15_rpc)), [country[:20] for country in top_15_rpc.index])
plt.xlabel('Revenue per Customer ($)')
plt.title('Top 15 Countries by Revenue/Customer', fontsize=12, fontweight='bold')
plt.grid(True, alpha=0.3)

# Regional revenue distribution
plt.subplot(3, 4, 5)
regional_revenue = country_stats.groupby('Region')['TotalRevenue'].sum()
plt.pie(regional_revenue.values, labels=regional_revenue.index, autopct='%1.1f%%',
        colors=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
plt.title('Revenue by Region', fontsize=12, fontweight='bold')

# Regional customer distribution
plt.subplot(3, 4, 6)
regional_customers = country_stats.groupby('Region')['UniqueCustomers'].sum()
plt.pie(regional_customers.values, labels=regional_customers.index, autopct='%1.1f%%',
        colors=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
plt.title('Customers by Region', fontsize=12, fontweight='bold')

# Orders per customer by region
plt.subplot(3, 4, 7)
regional_metrics = country_stats.groupby('Region').agg({
    'OrdersPerCustomer': 'mean',
    'RevenuePerCustomer': 'mean'
})
regional_metrics['OrdersPerCustomer'].plot(kind='bar', color='orange')
plt.title('Avg Orders per Customer by Region', fontsize=12, fontweight='bold')
plt.ylabel('Orders per Customer')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)

# Revenue per customer by region
plt.subplot(3, 4, 8)
regional_metrics['RevenuePerCustomer'].plot(kind='bar', color='teal')
plt.title('Avg Revenue per Customer by Region', fontsize=12, fontweight='bold')
plt.ylabel('Revenue per Customer ($)')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)

# Market share visualization
plt.subplot(3, 4, 9)
market_share = country_stats['TotalRevenue'] / country_stats['TotalRevenue'].sum() * 100
top_10_share = market_share.head(10)
others_share = 100 - top_10_share.sum()
market_share_final = list(top_10_share.values) + [others_share]
labels = list(top_10_share.index) + ['Others']
colors = plt.cm.Set3(np.linspace(0, 1, len(labels)))
plt.pie(market_share_final, labels=labels, autopct='%1.1f%%', colors=colors)
plt.title('Market Share by Country', fontsize=12, fontweight='bold')

# Country growth analysis (comparing first vs last quarter)
plt.subplot(3, 4, 10)
country_growth = monthly_country_sales.groupby('Country').agg({
    'TotalPrice': ['first', 'last']
}).round(2)
country_growth.columns = ['First_Month', 'Last_Month']
country_growth = country_growth[country_growth['First_Month'] > 0]
country_growth['Growth_Rate'] = ((country_growth['Last_Month'] - country_growth['First_Month']) / 
                                 country_growth['First_Month'] * 100)
top_growth = country_growth.sort_values('Growth_Rate', ascending=False).head(10)
plt.barh(range(len(top_growth)), top_growth['Growth_Rate'], color='gold')
plt.yticks(range(len(top_growth)), [country[:15] for country in top_growth.index])
plt.xlabel('Growth Rate (%)')
plt.title('Top 10 Countries by Growth Rate', fontsize=12, fontweight='bold')
plt.grid(True, alpha=0.3)

# Order size distribution by region
plt.subplot(3, 4, 11)
region_order_sizes = df.groupby('Region')['TotalPrice'].apply(list)
for i, (region, sizes) in enumerate(region_order_sizes.items()):
    plt.hist(sizes, alpha=0.5, label=region, bins=30)
plt.xlabel('Order Value ($)')
plt.ylabel('Frequency')
plt.title('Order Size Distribution by Region', fontsize=12, fontweight='bold')
plt.legend()
plt.grid(True, alpha=0.3)

# Seasonal patterns by region
plt.subplot(3, 4, 12)
seasonal_region = df.groupby(['Region', df['InvoiceDate'].dt.month])['TotalPrice'].mean().unstack()
seasonal_region.plot(kind='line', marker='o', ax=plt.gca())
plt.xlabel('Month')
plt.ylabel('Average Order Value ($)')
plt.title('Seasonal Patterns by Region', fontsize=12, fontweight='bold')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/geographic_analysis_overview.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/geographic_analysis_overview.png")

# 2. Detailed Country Analysis
plt.figure(figsize=(16, 12))

# Country correlation matrix
plt.subplot(2, 3, 1)
correlation_data = country_stats[['TotalRevenue', 'UniqueCustomers', 'AvgOrderValue', 
                                'RevenuePerCustomer', 'OrdersPerCustomer', 'ItemsPerOrder']]
correlation_matrix = correlation_data.corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
            square=True, fmt='.2f')
plt.title('Country Metrics Correlation', fontsize=14, fontweight='bold')

# Revenue vs Customer scatter
plt.subplot(2, 3, 2)
plt.scatter(country_stats['UniqueCustomers'], country_stats['TotalRevenue'], 
           alpha=0.6, s=100, c='blue')
plt.xlabel('Unique Customers')
plt.ylabel('Total Revenue ($)')
plt.title('Revenue vs Customers', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)

# Add labels for top countries
for country in country_stats.head(5).index:
    x = country_stats.loc[country, 'UniqueCustomers']
    y = country_stats.loc[country, 'TotalRevenue']
    plt.annotate(country[:10], (x, y), xytext=(5, 5), textcoords='offset points', fontsize=8)

# AOV vs Revenue per Customer
plt.subplot(2, 3, 3)
plt.scatter(country_stats['AvgOrderValue'], country_stats['RevenuePerCustomer'], 
           alpha=0.6, s=100, c='green')
plt.xlabel('Average Order Value ($)')
plt.ylabel('Revenue per Customer ($)')
plt.title('AOV vs Revenue per Customer', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)

# Add labels for top countries
for country in country_stats.head(5).index:
    x = country_stats.loc[country, 'AvgOrderValue']
    y = country_stats.loc[country, 'RevenuePerCustomer']
    plt.annotate(country[:10], (x, y), xytext=(5, 5), textcoords='offset points', fontsize=8)

# Top countries by multiple metrics
plt.subplot(2, 3, 4)
top_countries_multi = country_stats.head(10)
metrics = ['TotalRevenue', 'UniqueCustomers', 'AvgOrderValue', 'RevenuePerCustomer']
top_countries_multi[metrics].plot(kind='bar', ax=plt.gca())
plt.title('Top 10 Countries - Multiple Metrics', fontsize=14, fontweight='bold')
plt.xticks(rotation=45, ha='right')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

# Regional performance radar chart
plt.subplot(2, 3, 5, projection='polar')
regions = regional_metrics.index
metrics_normalized = regional_metrics.copy()
for col in metrics_normalized.columns:
    metrics_normalized[col] = (metrics_normalized[col] - metrics_normalized[col].min()) / \
                            (metrics_normalized[col].max() - metrics_normalized[col].min())

angles = np.linspace(0, 2 * np.pi, len(metrics_normalized.columns), endpoint=False)
angles = np.concatenate((angles, [angles[0]]))  # Complete the circle

colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
for i, region in enumerate(regions):
    values = metrics_normalized.loc[region].values.tolist()
    values = values + [values[0]]  # Complete the circle
    plt.plot(angles, values, 'o-', linewidth=2, label=region, color=colors[i])
    plt.fill(angles, values, alpha=0.25, color=colors[i])

plt.xticks(angles[:-1], metrics_normalized.columns)
plt.title('Regional Performance Radar', fontsize=14, fontweight='bold', pad=20)
plt.legend()

# Country size categories
plt.subplot(2, 3, 6)
# Categorize countries by revenue
def categorize_country(revenue):
    if revenue > 1000000:
        return 'Large (> $1M)'
    elif revenue > 100000:
        return 'Medium ($100K-$1M)'
    else:
        return 'Small (< $100K)'

country_stats['SizeCategory'] = country_stats['TotalRevenue'].apply(categorize_country)
size_counts = country_stats['SizeCategory'].value_counts()
plt.pie(size_counts.values, labels=size_counts.index, autopct='%1.1f%%',
        colors=['gold', 'lightblue', 'lightgreen'])
plt.title('Country Distribution by Size', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('../charts/geographic_detailed_analysis.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/geographic_detailed_analysis.png")

# Export data for Power BI
print("\nExporting data for Power BI...")

# Export country statistics
country_export = country_stats.reset_index()
country_export.to_csv('../data/country_analysis.csv', index=False)
print("Country analysis exported to: ../data/country_analysis.csv")

# Export monthly country sales
monthly_country_sales['YearMonth'] = monthly_country_sales['YearMonth'].astype(str)
monthly_country_sales.to_csv('../data/monthly_country_sales.csv', index=False)
print("Monthly country sales exported to: ../data/monthly_country_sales.csv")

# Export regional analysis
regional_export = regional_metrics.reset_index()
regional_export.to_csv('../data/regional_analysis.csv', index=False)
print("Regional analysis exported to: ../data/regional_analysis.csv")

# Export country growth analysis
country_growth_export = country_growth.reset_index()
country_growth_export.to_csv('../data/country_growth.csv', index=False)
print("Country growth analysis exported to: ../data/country_growth.csv")

# Summary statistics
print("\n" + "="*60)
print("GEOGRAPHIC ANALYSIS SUMMARY")
print("="*60)
print(f"Total Countries: {len(country_stats)}")
print(f"Total Regions: {len(regional_metrics)}")
print(f"Global Revenue: ${country_stats['TotalRevenue'].sum():,.2f}")

print(f"\nTop 5 Countries by Revenue:")
for i, (country, stats) in enumerate(country_stats.head(5).iterrows()):
    print(f"  {i+1}. {country:20s}: ${stats['TotalRevenue']:,.2f} ({stats['UniqueCustomers']} customers)")

print(f"\nRegional Performance:")
for region in regional_revenue.index:
    revenue = regional_revenue[region]
    customers = regional_customers[region]
    print(f"  {region:15s}: ${revenue:,.2f} ({customers} customers)")

print(f"\nKey Insights:")
print(f"  Largest Market: {country_stats.index[0]} (${country_stats.iloc[0]['TotalRevenue']:,.2f})")
print(f"  Most Valuable Customers: {country_stats['RevenuePerCustomer'].idxmax()} (${country_stats['RevenuePerCustomer'].max():,.2f})")
print(f"  Highest AOV: {country_stats['AvgOrderValue'].idxmax()} (${country_stats['AvgOrderValue'].max():,.2f})")
print(f"  Fastest Growing: {top_growth.index[0]} ({top_growth.iloc[0]['Growth_Rate']:.1f}%)")

print(f"\nMarket Concentration:")
print(f"  Top 3 Countries: {market_share.head(3).sum():.1f}% of total revenue")
print(f"  Top 5 Countries: {market_share.head(5).sum():.1f}% of total revenue")
print(f"  Europe: {regional_revenue['Europe']/regional_revenue.sum()*100:.1f}% of total revenue")

print("\nAll geographic analysis charts saved in ../charts/ directory")
print("Data ready for Power BI integration!")
