import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from datetime import datetime, timedelta

print("="*60)
print("RFM ANALYSIS - CUSTOMER SEGMENTATION")
print("="*60)

# Load the cleaned data
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')

# Data cleaning (same as main analysis)
df = df.dropna(subset=['CustomerID'])
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df = df[df['Quantity'] > 0]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

print(f"Dataset loaded: {df.shape[0]:,} transactions")
print(f"Date range: {df['InvoiceDate'].min()} to {df['InvoiceDate'].max()}")

# Calculate RFM metrics
print("\nCalculating RFM metrics...")

# Set analysis date (one day after last purchase)
analysis_date = df['InvoiceDate'].max() + timedelta(days=1)

# Calculate Recency, Frequency, Monetary values
rfm = df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (analysis_date - x.max()).days,  # Recency
    'InvoiceNo': 'nunique',  # Frequency (number of orders)
    'TotalPrice': 'sum'  # Monetary (total spent)
}).reset_index()

rfm.columns = ['CustomerID', 'Recency', 'Frequency', 'Monetary']

print(f"RFM metrics calculated for {rfm.shape[0]:,} customers")

# Create RFM scores (1-5 scale, where 5 is best)
print("\nCalculating RFM scores...")

# Recency score (lower recency = higher score)
rfm['R_Score'] = pd.qcut(rfm['Recency'], 5, labels=[5, 4, 3, 2, 1])

# Frequency score (higher frequency = higher score)
rfm['F_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])

# Monetary score (higher monetary = higher score)
rfm['M_Score'] = pd.qcut(rfm['Monetary'], 5, labels=[1, 2, 3, 4, 5])

# Combine scores
rfm['RFM_Score'] = rfm['R_Score'].astype(str) + rfm['F_Score'].astype(str) + rfm['M_Score'].astype(str)
rfm['RFM_Total'] = rfm['R_Score'].astype(int) + rfm['F_Score'].astype(int) + rfm['M_Score'].astype(int)

print("RFM scoring completed")

# Customer segmentation
print("\nSegmenting customers...")

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

rfm['Segment'] = rfm.apply(segment_customers, axis=1)

# Segment analysis
segment_counts = rfm['Segment'].value_counts()
segment_revenue = rfm.groupby('Segment')['Monetary'].sum()

print("\nCUSTOMER SEGMENTS SUMMARY:")
print("-" * 40)
for segment in segment_counts.index:
    count = segment_counts[segment]
    revenue = segment_revenue[segment]
    percentage = (count / len(rfm)) * 100
    print(f"{segment:20s}: {count:4d} customers ({percentage:5.1f}%) - ${revenue:,.0f}")

# Create visualizations
plt.style.use('default')

# 1. RFM Distribution
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('RFM Analysis - Customer Distribution', fontsize=16, fontweight='bold')

# Recency distribution
axes[0, 0].hist(rfm['Recency'], bins=30, alpha=0.7, color='skyblue', edgecolor='black')
axes[0, 0].set_title('Recency Distribution')
axes[0, 0].set_xlabel('Days Since Last Purchase')
axes[0, 0].set_ylabel('Number of Customers')
axes[0, 0].grid(True, alpha=0.3)

# Frequency distribution
axes[0, 1].hist(rfm['Frequency'], bins=30, alpha=0.7, color='lightgreen', edgecolor='black')
axes[0, 1].set_title('Frequency Distribution')
axes[0, 1].set_xlabel('Number of Orders')
axes[0, 1].set_ylabel('Number of Customers')
axes[0, 1].grid(True, alpha=0.3)

# Monetary distribution
axes[1, 0].hist(rfm['Monetary'], bins=30, alpha=0.7, color='salmon', edgecolor='black')
axes[1, 0].set_title('Monetary Distribution')
axes[1, 0].set_xlabel('Total Spending ($)')
axes[1, 0].set_ylabel('Number of Customers')
axes[1, 0].grid(True, alpha=0.3)

# RFM Score distribution
rfm_score_counts = rfm['RFM_Total'].value_counts().sort_index()
axes[1, 1].bar(rfm_score_counts.index, rfm_score_counts.values, color='purple', alpha=0.7)
axes[1, 1].set_title('RFM Score Distribution')
axes[1, 1].set_xlabel('RFM Total Score')
axes[1, 1].set_ylabel('Number of Customers')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/rfm_distributions.png', dpi=300, bbox_inches='tight')
print("\nChart saved: ../charts/rfm_distributions.png")

# 2. Customer Segments Pie Chart
plt.figure(figsize=(12, 8))

# Create subplots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))

# Customer count by segment
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
explode = [0.1 if segment == 'Champions' else 0 for segment in segment_counts.index]

ax1.pie(segment_counts.values, labels=segment_counts.index, autopct='%1.1f%%', 
        colors=colors[:len(segment_counts)], explode=explode, shadow=True)
ax1.set_title('Customer Segments by Count', fontsize=14, fontweight='bold')

# Revenue by segment
ax2.pie(segment_revenue.values, labels=segment_revenue.index, autopct='%1.1f%%',
        colors=colors[:len(segment_revenue)], explode=explode, shadow=True)
ax2.set_title('Revenue by Customer Segment', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('../charts/customer_segments.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/customer_segments.png")

# 3. RFM Heatmap
plt.figure(figsize=(12, 8))
rfm_numeric = rfm.copy()
rfm_numeric['R_Score'] = rfm_numeric['R_Score'].astype(int)
rfm_numeric['F_Score'] = rfm_numeric['M_Score'].astype(int)
rfm_numeric['M_Score'] = rfm_numeric['M_Score'].astype(int)
rfm_heatmap = rfm_numeric.groupby(['R_Score', 'F_Score'])['M_Score'].mean().unstack()
sns.heatmap(rfm_heatmap, annot=True, fmt='.1f', cmap='RdYlGn', 
            cbar_kws={'label': 'Average Monetary Score'})
plt.title('RFM Heatmap - Average Monetary Score by Recency & Frequency', fontsize=14, fontweight='bold')
plt.xlabel('Frequency Score')
plt.ylabel('Recency Score')
plt.tight_layout()
plt.savefig('../charts/rfm_heatmap.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/rfm_heatmap.png")

# 4. Segment Comparison Chart
plt.figure(figsize=(14, 8))

# Calculate average metrics by segment
segment_stats = rfm.groupby('Segment').agg({
    'Recency': 'mean',
    'Frequency': 'mean', 
    'Monetary': 'mean',
    'CustomerID': 'count'
}).round(2)

# Create bar chart
x = np.arange(len(segment_stats))
width = 0.25

fig, ax = plt.subplots(figsize=(14, 8))
rects1 = ax.bar(x - width, segment_stats['Recency'], width, label='Avg Recency (days)', color='skyblue')
rects2 = ax.bar(x, segment_stats['Frequency'], width, label='Avg Frequency (orders)', color='lightgreen')
rects3 = ax.bar(x + width, segment_stats['Monetary']/100, width, label='Avg Monetary ($100s)', color='salmon')

ax.set_xlabel('Customer Segments')
ax.set_ylabel('Average Values')
ax.set_title('Customer Segment Comparison', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(segment_stats.index, rotation=45, ha='right')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/segment_comparison.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/segment_comparison.png")

# Export RFM data for Power BI
rfm.to_csv('../data/rfm_analysis.csv', index=False)
print(f"\nRFM data exported to: ../data/rfm_analysis.csv")

# Summary statistics
print("\n" + "="*60)
print("RFM ANALYSIS SUMMARY")
print("="*60)
print(f"Total Customers Analyzed: {rfm['CustomerID'].nunique():,}")
print(f"Average Recency: {rfm['Recency'].mean():.1f} days")
print(f"Average Frequency: {rfm['Frequency'].mean():.1f} orders")
print(f"Average Monetary Value: ${rfm['Monetary'].mean():,.2f}")
print(f"Total Revenue: ${rfm['Monetary'].sum():,.2f}")

print(f"\nTop Customer Segment: {segment_counts.index[0]} ({segment_counts.iloc[0]} customers)")
print(f"Highest Revenue Segment: {segment_revenue.index[0]} (${segment_revenue.iloc[0]:,.2f})")

print("\nAll RFM analysis charts saved in ../charts/ directory")
print("Data ready for Power BI integration!")
