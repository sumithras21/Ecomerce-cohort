import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

print("="*60)
print("MARKET BASKET ANALYSIS - PRODUCT ASSOCIATION")
print("="*60)

# Load and clean data
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')
df = df.dropna(subset=['CustomerID', 'Description'])
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df = df[df['Quantity'] > 0]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

print(f"Dataset loaded: {df.shape[0]:,} transactions")
print(f"Unique products: {df['Description'].nunique():,}")

# Focus on top products for better analysis
print("\nAnalyzing top 50 products by frequency...")
top_products = df['Description'].value_counts().head(50).index
df_filtered = df[df['Description'].isin(top_products)]
print(f"Filtered to: {df_filtered.shape[0]:,} transactions with top 50 products")

# Create basket format (one row per invoice with products as columns)
print("\nCreating market basket structure...")
basket = df_filtered.groupby(['InvoiceNo', 'Description'])['Quantity'].sum().unstack().reset_index().fillna(0)
basket.set_index('InvoiceNo', inplace=True)

# Convert to binary (1 if product purchased, 0 if not)
basket_sets = basket.map(lambda x: 1 if x > 0 else 0)

print(f"Basket created: {basket_sets.shape[0]} invoices × {basket_sets.shape[1]} products")

# Calculate product co-occurrence matrix (simplified approach)
print("\nCalculating product co-occurrence...")
product_cooccurrence = {}

# Get top 20 products for co-occurrence analysis
top_20_products = top_products[:20]

for i, product1 in enumerate(top_20_products):
    for j, product2 in enumerate(top_20_products):
        if i < j:  # Only calculate each pair once
            # Find invoices that contain both products
            invoices_with_both = basket_sets[(basket_sets[product1] == 1) & (basket_sets[product2] == 1)]
            cooccurrence_count = len(invoices_with_both)
            if cooccurrence_count > 10:  # Only keep pairs with significant co-occurrence
                product_cooccurrence[f"{product1[:20]}... + {product2[:20]}..."] = cooccurrence_count

print(f"Found {len(product_cooccurrence)} significant product pairs")

# Create visualizations
plt.style.use('default')

# 1. Top Products by Purchase Frequency
plt.figure(figsize=(15, 10))

# Top 20 products
plt.subplot(2, 2, 1)
top_20_products_counts = df_filtered['Description'].value_counts().head(20)
top_20_products_counts.plot(kind='bar', color='skyblue')
plt.title('Top 20 Products by Purchase Frequency', fontsize=14, fontweight='bold')
plt.xlabel('Products')
plt.ylabel('Number of Purchases')
plt.xticks(rotation=45, ha='right')
plt.grid(True, alpha=0.3)

# Product co-occurrence bar chart
plt.subplot(2, 2, 2)
if product_cooccurrence:
    cooccurrence_df = pd.DataFrame(list(product_cooccurrence.items()), columns=['Product Pair', 'Co-occurrence'])
    cooccurrence_df = cooccurrence_df.sort_values('Co-occurrence', ascending=True).tail(15)
    plt.barh(range(len(cooccurrence_df)), cooccurrence_df['Co-occurrence'], color='lightgreen')
    plt.yticks(range(len(cooccurrence_df)), [pair[:40] for pair in cooccurrence_df['Product Pair']])
    plt.xlabel('Number of Orders with Both Products')
    plt.title('Top Product Pairs by Co-occurrence', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)

# Revenue contribution by top products
plt.subplot(2, 2, 3)
top_20_revenue = df_filtered[df_filtered['Description'].isin(top_20_products)].groupby('Description')['TotalPrice'].sum().sort_values(ascending=False).head(20)
top_20_revenue.plot(kind='bar', color='salmon')
plt.title('Top 20 Products by Revenue', fontsize=14, fontweight='bold')
plt.xlabel('Products')
plt.ylabel('Total Revenue ($)')
plt.xticks(rotation=45, ha='right')
plt.grid(True, alpha=0.3)

# Average order value for top products
plt.subplot(2, 2, 4)
top_20_aov = df_filtered[df_filtered['Description'].isin(top_20_products)].groupby('Description')['TotalPrice'].mean().sort_values(ascending=False).head(20)
top_20_aov.plot(kind='bar', color='purple')
plt.title('Top 20 Products by Average Order Value', fontsize=14, fontweight='bold')
plt.xlabel('Products')
plt.ylabel('Average Order Value ($)')
plt.xticks(rotation=45, ha='right')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/market_basket_analysis.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/market_basket_analysis.png")

# 2. Product Co-occurrence Heatmap
if product_cooccurrence:
    plt.figure(figsize=(14, 12))
    
    # Create co-occurrence matrix for top 15 products
    top_15_products = top_products[:15]
    cooccurrence_matrix = np.zeros((15, 15))
    
    for i, product1 in enumerate(top_15_products):
        for j, product2 in enumerate(top_15_products):
            if i != j:
                # Count orders with both products
                both_products = basket_sets[(basket_sets[product1] == 1) & (basket_sets[product2] == 1)]
                cooccurrence_matrix[i, j] = len(both_products)
    
    # Create heatmap
    sns.heatmap(cooccurrence_matrix, 
                xticklabels=[p[:20] for p in top_15_products], 
                yticklabels=[p[:20] for p in top_15_products],
                cmap='YlOrRd', annot=True, fmt='g', cbar_kws={'label': 'Number of Orders'})
    plt.title('Product Co-occurrence Matrix (Top 15 Products)', fontsize=16, fontweight='bold')
    plt.xlabel('Products')
    plt.ylabel('Products')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('../charts/product_cooccurrence_heatmap.png', dpi=300, bbox_inches='tight')
    print("Chart saved: ../charts/product_cooccurrence_heatmap.png")

# 3. Basket Analysis Summary
plt.figure(figsize=(12, 8))

# Basket size distribution
basket_sizes = basket_sets.sum(axis=1)
plt.subplot(2, 2, 1)
plt.hist(basket_sizes, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
plt.title('Basket Size Distribution', fontsize=14, fontweight='bold')
plt.xlabel('Number of Products per Order')
plt.ylabel('Number of Orders')
plt.grid(True, alpha=0.3)

# Most common basket sizes
plt.subplot(2, 2, 2)
common_sizes = basket_sizes.value_counts().head(10)
common_sizes.plot(kind='bar', color='lightgreen')
plt.title('Most Common Basket Sizes', fontsize=14, fontweight='bold')
plt.xlabel('Basket Size')
plt.ylabel('Number of Orders')
plt.xticks(rotation=0)
plt.grid(True, alpha=0.3)

# Single vs Multi-product orders
plt.subplot(2, 2, 3)
single_product = (basket_sizes == 1).sum()
multi_product = (basket_sizes > 1).sum()
plt.pie([single_product, multi_product], labels=['Single Product', 'Multiple Products'], 
        autopct='%1.1f%%', colors=['salmon', 'lightblue'])
plt.title('Single vs Multi-Product Orders', fontsize=14, fontweight='bold')

# Top 5 product combinations (if available)
plt.subplot(2, 2, 4)
if product_cooccurrence:
    top_combinations = sorted(product_cooccurrence.items(), key=lambda x: x[1], reverse=True)[:5]
    combinations = [item[0][:30] for item in top_combinations]
    counts = [item[1] for item in top_combinations]
    plt.barh(combinations, counts, color='purple')
    plt.title('Top 5 Product Combinations', fontsize=14, fontweight='bold')
    plt.xlabel('Number of Orders')
    plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/basket_analysis_summary.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/basket_analysis_summary.png")

# Export data for Power BI
print("\nExporting data for Power BI...")

# Export top products analysis
top_products_analysis = pd.DataFrame({
    'Product': top_20_products_counts.index,
    'Purchase_Frequency': top_20_products_counts.values,
    'Total_Revenue': [top_20_revenue.get(product, 0) for product in top_20_products_counts.index],
    'Average_Order_Value': [top_20_aov.get(product, 0) for product in top_20_products_counts.index]
})
top_products_analysis.to_csv('../data/top_products_analysis.csv', index=False)
print("Top products analysis exported to: ../data/top_products_analysis.csv")

# Export product co-occurrence data
if product_cooccurrence:
    cooccurrence_export = pd.DataFrame(list(product_cooccurrence.items()), columns=['Product_Pair', 'Co_occurrence_Count'])
    cooccurrence_export.to_csv('../data/product_cooccurrence.csv', index=False)
    print("Product co-occurrence data exported to: ../data/product_cooccurrence.csv")

# Export basket analysis data
basket_analysis = pd.DataFrame({
    'InvoiceNo': basket_sets.index,
    'Basket_Size': basket_sizes.values,
    'Total_Items': basket_sets.sum(axis=1).values
})
basket_analysis.to_csv('../data/basket_analysis.csv', index=False)
print("Basket analysis data exported to: ../data/basket_analysis.csv")

# Summary statistics
print("\n" + "="*60)
print("MARKET BASKET ANALYSIS SUMMARY")
print("="*60)
print(f"Total Transactions Analyzed: {df_filtered.shape[0]:,}")
print(f"Unique Products Analyzed: {df_filtered['Description'].nunique():,}")
print(f"Average Basket Size: {basket_sizes.mean():.1f} products")
print(f"Median Basket Size: {basket_sizes.median():.1f} products")
print(f"Largest Basket: {basket_sizes.max()} products")
print(f"Single-Product Orders: {single_product:,} ({single_product/len(basket_sizes)*100:.1f}%)")
print(f"Multi-Product Orders: {multi_product:,} ({multi_product/len(basket_sizes)*100:.1f}%)")

if product_cooccurrence:
    top_pair = max(product_cooccurrence.items(), key=lambda x: x[1])
    print(f"\nMost Common Product Pair: {top_pair[0]} ({top_pair[1]} orders)")

print(f"\nTop Product: {top_20_products_counts.index[0]} ({top_20_products_counts.iloc[0]} purchases)")
print(f"Highest Revenue Product: {top_20_revenue.index[0]} (${top_20_revenue.iloc[0]:,.2f})")

print("\nAll market basket analysis charts saved in ../charts/ directory")
print("Data ready for Power BI integration!")
