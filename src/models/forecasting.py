import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from src.utils.logger import get_logger

logger = get_logger(__name__)

def generate_forecast(df: pd.DataFrame, periods: int = 30) -> pd.DataFrame:
    """
    Generates a sales forecast using Exponential Smoothing (Holt-Winters).
    """
    try:
        logger.info(f"Generating forecast for {periods} periods.")
        # Aggregate daily sales
        daily_sales = df.groupby(df['InvoiceDate'].dt.date)['Revenue'].sum().reset_index()
        daily_sales.columns = ['Date', 'Revenue']
        daily_sales['Date'] = pd.to_datetime(daily_sales['Date'])
        daily_sales.set_index('Date', inplace=True)
        
        # Ensure contiguous date index
        daily_sales = daily_sales.asfreq('D', fill_value=0)
        
        # Fit Holt-Winters model
        model = ExponentialSmoothing(
            daily_sales['Revenue'], 
            trend='add', 
            seasonal='add', 
            seasonal_periods=7
        ).fit()
        
        # Forecast
        forecast = model.forecast(periods)
        
        # Format results
        forecast_df = pd.DataFrame({
            'Date': forecast.index,
            'Forecast_Revenue': forecast.values,
            'Type': 'Forecast'
        })
        
        historical_df = pd.DataFrame({
            'Date': daily_sales.index,
            'Revenue': daily_sales['Revenue'].values,
            'Type': 'Historical'
        })
        
        logger.info("Forecast generation successful.")
        return historical_df, forecast_df
        
    except Exception as e:
        logger.error(f"Failed to generate forecast: {e}")
        raise RuntimeError("Unable to generate forecast for current dataset.") from e
