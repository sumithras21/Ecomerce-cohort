import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

def plot_forecast(historical_df: pd.DataFrame, forecast_df: pd.DataFrame):
    """
    Plots historical data vs forecasted data.
    """
    fig = go.Figure()
    
    # Historical Data
    fig.add_trace(go.Scatter(
        x=historical_df['Date'], 
        y=historical_df['Revenue'],
        mode='lines',
        name='Historical Sales',
        line=dict(color='blue')
    ))
    
    # Forecast Data
    fig.add_trace(go.Scatter(
        x=forecast_df['Date'], 
        y=forecast_df['Forecast_Revenue'],
        mode='lines',
        name='Forecasted Sales',
        line=dict(color='red', dash='dash')
    ))
    
    fig.update_layout(
        title='Sales Forecasting (30 Days)',
        xaxis_title='Date',
        yaxis_title='Revenue ($)',
        hovermode="x unified"
    )
    return fig

# Note: Appending to existing plots.py
