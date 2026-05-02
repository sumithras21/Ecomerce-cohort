import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import PolynomialFeatures
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("SALES FORECASTING - TIME SERIES ANALYSIS")
print("="*60)

# Load and clean data
df = pd.read_csv("../data/OnlineRetail.csv", encoding='latin1')
df = df.dropna(subset=['CustomerID'])
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df = df[df['Quantity'] > 0]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

print(f"Dataset loaded: {df.shape[0]:,} transactions")
print(f"Date range: {df['InvoiceDate'].min()} to {df['InvoiceDate'].max()}")

# Aggregate sales by day
print("\nAggregating daily sales...")
daily_sales = df.groupby(df['InvoiceDate'].dt.date).agg({
    'TotalPrice': 'sum',
    'InvoiceNo': 'nunique',
    'CustomerID': 'nunique',
    'Quantity': 'sum'
}).reset_index()
daily_sales.columns = ['Date', 'Revenue', 'Orders', 'Customers', 'Items']
daily_sales['Date'] = pd.to_datetime(daily_sales['Date'])

print(f"Daily sales data: {len(daily_sales)} days")

# Create time series features
print("\nCreating time series features...")
daily_sales['DayOfWeek'] = daily_sales['Date'].dt.dayofweek
daily_sales['Month'] = daily_sales['Date'].dt.month
daily_sales['Year'] = daily_sales['Date'].dt.year
daily_sales['DayOfMonth'] = daily_sales['Date'].dt.day
daily_sales['WeekOfYear'] = daily_sales['Date'].dt.isocalendar().week

# Create lag features
daily_sales['Revenue_Lag1'] = daily_sales['Revenue'].shift(1)
daily_sales['Revenue_Lag7'] = daily_sales['Revenue'].shift(7)
daily_sales['Revenue_MA7'] = daily_sales['Revenue'].rolling(window=7).mean()
daily_sales['Revenue_MA30'] = daily_sales['Revenue'].rolling(window=30).mean()

print("Time series features created")

# Split data for forecasting
print("\nSplitting data for forecasting...")
train_size = int(len(daily_sales) * 0.8)
train_data = daily_sales.iloc[:train_size]
test_data = daily_sales.iloc[train_size:]

print(f"Training data: {len(train_data)} days ({train_data['Date'].min()} to {train_data['Date'].max()})")
print(f"Test data: {len(test_data)} days ({test_data['Date'].min()} to {test_data['Date'].max()})")

# Prepare features for modeling
feature_cols = ['DayOfWeek', 'Month', 'DayOfMonth', 'WeekOfYear', 
                'Revenue_Lag1', 'Revenue_Lag7', 'Revenue_MA7', 'Revenue_MA30']

# Remove rows with NaN values (due to lag features)
train_clean = train_data.dropna()
test_clean = test_data.dropna()

X_train = train_clean[feature_cols]
y_train = train_clean['Revenue']
X_test = test_clean[feature_cols]
y_test = test_clean['Revenue']

print(f"Clean training data: {len(X_train)} samples")
print(f"Clean test data: {len(X_test)} samples")

# Build forecasting models
print("\nBuilding forecasting models...")

# Linear Regression
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)
lr_pred = lr_model.predict(X_test)
lr_mae = mean_absolute_error(y_test, lr_pred)
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))

# Polynomial Regression (degree 2)
poly_features = PolynomialFeatures(degree=2)
X_train_poly = poly_features.fit_transform(X_train)
X_test_poly = poly_features.transform(X_test)

poly_model = LinearRegression()
poly_model.fit(X_train_poly, y_train)
poly_pred = poly_model.predict(X_test_poly)
poly_mae = mean_absolute_error(y_test, poly_pred)
poly_rmse = np.sqrt(mean_squared_error(y_test, poly_pred))

print("Models trained successfully")

# Create forecasts for next 30 days
print("\nGenerating 30-day forecasts...")

# Get the last known data point
last_data = daily_sales.iloc[-1:].copy()
forecast_dates = pd.date_range(start=daily_sales['Date'].max() + pd.Timedelta(days=1), 
                               periods=30, freq='D')

forecasts = []

for i, date in enumerate(forecast_dates):
    # Create features for forecast
    forecast_features = {
        'DayOfWeek': date.dayofweek,
        'Month': date.month,
        'DayOfMonth': date.day,
        'WeekOfYear': date.isocalendar().week,
        'Revenue_Lag1': daily_sales['Revenue'].iloc[-1] if i == 0 else forecasts[i-1]['Revenue'],
        'Revenue_Lag7': daily_sales['Revenue'].iloc[-7] if i < 7 else forecasts[i-7]['Revenue'],
        'Revenue_MA7': daily_sales['Revenue'].iloc[-7:].mean() if i < 7 else np.mean([f['Revenue'] for f in forecasts[max(0,i-7):i]]),
        'Revenue_MA30': daily_sales['Revenue'].iloc[-30:].mean() if i < 30 else np.mean([f['Revenue'] for f in forecasts[max(0,i-30):i]])
    }
    
    # Predict using linear regression
    forecast_df_temp = pd.DataFrame([forecast_features])
    lr_forecast = lr_model.predict(forecast_df_temp[feature_cols])[0]
    
    # Predict using polynomial regression
    poly_forecast = poly_model.predict(poly_features.transform(forecast_df_temp[feature_cols]))[0]
    
    forecasts.append({
        'Date': date,
        'Linear_Forecast': max(0, lr_forecast),  # Ensure non-negative
        'Poly_Forecast': max(0, poly_forecast),  # Ensure non-negative
        'Revenue': max(0, lr_forecast)  # Add Revenue key for lag calculations
    })

forecast_df = pd.DataFrame(forecasts)
print("30-day forecasts generated")

# Create visualizations
plt.style.use('default')

# 1. Historical Sales and Forecast
plt.figure(figsize=(16, 10))

# Historical data
plt.subplot(2, 2, 1)
plt.plot(daily_sales['Date'], daily_sales['Revenue'], label='Historical Revenue', color='blue', alpha=0.7)
plt.plot(test_clean['Date'], lr_pred, label='Linear Regression Test', color='red', linestyle='--', alpha=0.8)
plt.plot(forecast_df['Date'], forecast_df['Linear_Forecast'], label='Linear Forecast', color='red', linewidth=2)
plt.title('Revenue - Historical and Forecast', fontsize=14, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Revenue ($)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)

# Model comparison on test set
plt.subplot(2, 2, 2)
plt.plot(test_clean['Date'], y_test.values, label='Actual', color='blue', linewidth=2)
plt.plot(test_clean['Date'], lr_pred, label=f'Linear Reg (MAE: ${lr_mae:,.0f})', color='red', linestyle='--')
plt.plot(test_clean['Date'], poly_pred, label=f'Poly Reg (MAE: ${poly_mae:,.0f})', color='green', linestyle='--')
plt.title('Model Comparison on Test Set', fontsize=14, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Revenue ($)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)

# Monthly aggregation and forecast
plt.subplot(2, 2, 3)
monthly_sales = daily_sales.groupby(daily_sales['Date'].dt.to_period('M'))['Revenue'].sum()
monthly_forecast = forecast_df.groupby(forecast_df['Date'].dt.to_period('M'))['Linear_Forecast'].sum()

plt.bar(monthly_sales.index.astype(str), monthly_sales.values, alpha=0.7, color='blue', label='Historical Monthly')
plt.bar(monthly_forecast.index.astype(str), monthly_forecast.values, alpha=0.7, color='red', label='Forecast Monthly')
plt.title('Monthly Revenue and Forecast', fontsize=14, fontweight='bold')
plt.xlabel('Month')
plt.ylabel('Revenue ($)')
plt.legend()
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)

# Forecast confidence intervals (simplified)
plt.subplot(2, 2, 4)
forecast_mean = forecast_df['Linear_Forecast'].mean()
forecast_std = forecast_df['Linear_Forecast'].std()

plt.plot(forecast_df['Date'], forecast_df['Linear_Forecast'], label='Forecast', color='red', linewidth=2)
plt.fill_between(forecast_df['Date'], 
                 forecast_df['Linear_Forecast'] - 1.96*forecast_std,
                 forecast_df['Linear_Forecast'] + 1.96*forecast_std,
                 alpha=0.2, color='red', label='95% Confidence')
plt.axhline(y=forecast_mean, color='green', linestyle='--', label=f'Mean: ${forecast_mean:,.0f}')
plt.title('30-Day Forecast with Confidence Intervals', fontsize=14, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Revenue ($)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)

plt.tight_layout()
plt.savefig('../charts/sales_forecasting.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/sales_forecasting.png")

# 2. Seasonal Analysis
plt.figure(figsize=(16, 10))

# Day of week pattern
plt.subplot(2, 3, 1)
dow_pattern = daily_sales.groupby('DayOfWeek')['Revenue'].mean()
dow_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
actual_dow_labels = [dow_labels[i] for i in dow_pattern.index]
plt.bar(actual_dow_labels, dow_pattern.values, color='skyblue')
plt.title('Average Revenue by Day of Week', fontsize=12, fontweight='bold')
plt.xlabel('Day of Week')
plt.ylabel('Average Revenue ($)')
plt.grid(True, alpha=0.3)

# Monthly pattern
plt.subplot(2, 3, 2)
monthly_pattern = daily_sales.groupby('Month')['Revenue'].mean()
month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
plt.bar(month_labels[:len(monthly_pattern)], monthly_pattern.values, color='lightgreen')
plt.title('Average Revenue by Month', fontsize=12, fontweight='bold')
plt.xlabel('Month')
plt.ylabel('Average Revenue ($)')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)

# Day of month pattern
plt.subplot(2, 3, 3)
dom_pattern = daily_sales.groupby('DayOfMonth')['Revenue'].mean()
plt.plot(dom_pattern.index, dom_pattern.values, marker='o', color='salmon')
plt.title('Average Revenue by Day of Month', fontsize=12, fontweight='bold')
plt.xlabel('Day of Month')
plt.ylabel('Average Revenue ($)')
plt.grid(True, alpha=0.3)

# Moving averages
plt.subplot(2, 3, 4)
plt.plot(daily_sales['Date'], daily_sales['Revenue'], label='Daily Revenue', alpha=0.5, color='blue')
plt.plot(daily_sales['Date'], daily_sales['Revenue_MA7'], label='7-Day MA', color='red', linewidth=2)
plt.plot(daily_sales['Date'], daily_sales['Revenue_MA30'], label='30-Day MA', color='green', linewidth=2)
plt.title('Revenue with Moving Averages', fontsize=12, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Revenue ($)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)

# Trend analysis
plt.subplot(2, 3, 5)
# Simple linear trend
daily_sales['DayNumber'] = range(len(daily_sales))
trend_model = LinearRegression()
trend_model.fit(daily_sales[['DayNumber']], daily_sales['Revenue'])
trend_line = trend_model.predict(daily_sales[['DayNumber']])

plt.plot(daily_sales['Date'], daily_sales['Revenue'], label='Actual', alpha=0.5, color='blue')
plt.plot(daily_sales['Date'], trend_line, label='Trend', color='red', linewidth=2)
plt.title('Revenue Trend Analysis', fontsize=12, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Revenue ($)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)

# Residual analysis
plt.subplot(2, 3, 6)
residuals = y_test - lr_pred
plt.scatter(lr_pred, residuals, alpha=0.6, color='purple')
plt.axhline(y=0, color='red', linestyle='--')
plt.title('Model Residuals', fontsize=12, fontweight='bold')
plt.xlabel('Predicted Revenue ($)')
plt.ylabel('Residuals ($)')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('../charts/seasonal_analysis.png', dpi=300, bbox_inches='tight')
print("Chart saved: ../charts/seasonal_analysis.png")

# Export data for Power BI
print("\nExporting data for Power BI...")

# Export forecast data
forecast_export = forecast_df.copy()
forecast_export['Date'] = forecast_export['Date'].dt.strftime('%Y-%m-%d')
forecast_export.to_csv('../data/sales_forecast.csv', index=False)
print("Sales forecast exported to: ../data/sales_forecast.csv")

# Export daily sales with features
daily_sales_export = daily_sales.copy()
daily_sales_export['Date'] = daily_sales_export['Date'].dt.strftime('%Y-%m-%d')
daily_sales_export.to_csv('../data/daily_sales_features.csv', index=False)
print("Daily sales with features exported to: ../data/daily_sales_features.csv")

# Export model performance
model_performance = pd.DataFrame({
    'Model': ['Linear Regression', 'Polynomial Regression'],
    'MAE': [lr_mae, poly_mae],
    'RMSE': [lr_rmse, poly_rmse],
    'Training_Samples': [len(X_train), len(X_train)],
    'Test_Samples': [len(X_test), len(X_test)]
})
model_performance.to_csv('../data/model_performance.csv', index=False)
print("Model performance exported to: ../data/model_performance.csv")

# Summary statistics
print("\n" + "="*60)
print("SALES FORECASTING SUMMARY")
print("="*60)
print(f"Analysis Period: {daily_sales['Date'].min().date()} to {daily_sales['Date'].max().date()}")
print(f"Total Days Analyzed: {len(daily_sales)}")
print(f"Average Daily Revenue: ${daily_sales['Revenue'].mean():,.2f}")
print(f"Peak Daily Revenue: ${daily_sales['Revenue'].max():,.2f}")
print(f"Lowest Daily Revenue: ${daily_sales['Revenue'].min():,.2f}")

print(f"\nLinear Regression Model:")
print(f"  MAE: ${lr_mae:,.2f}")
print(f"  RMSE: ${lr_rmse:,.2f}")
print(f"  Accuracy: {(1 - lr_mae/y_test.mean())*100:.1f}%")

print(f"\nPolynomial Regression Model:")
print(f"  MAE: ${poly_mae:,.2f}")
print(f"  RMSE: ${poly_rmse:,.2f}")
print(f"  Accuracy: {(1 - poly_mae/y_test.mean())*100:.1f}%")

print(f"\n30-Day Forecast Summary:")
print(f"  Forecast Period: {forecast_df['Date'].min().date()} to {forecast_df['Date'].max().date()}")
print(f"  Average Daily Forecast: ${forecast_df['Linear_Forecast'].mean():,.2f}")
print(f"  Total 30-Day Forecast: ${forecast_df['Linear_Forecast'].sum():,.2f}")
print(f"  Forecast Range: ${forecast_df['Linear_Forecast'].min():,.2f} to ${forecast_df['Linear_Forecast'].max():,.2f}")

print(f"\nSeasonal Patterns:")
print(f"  Best Day: {dow_labels[dow_pattern.idxmax()]} (${dow_pattern.max():,.2f})")
print(f"  Best Month: {month_labels[monthly_pattern.idxmax()-1]} (${monthly_pattern.max():,.2f})")
print(f"  Trend: {'Increasing' if trend_model.coef_[0] > 0 else 'Decreasing'} (${abs(trend_model.coef_[0]):.2f} per day)")

print("\nAll sales forecasting charts saved in ../charts/ directory")
print("Data ready for Power BI integration!")
