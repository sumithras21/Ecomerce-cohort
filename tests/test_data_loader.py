import pytest
import pandas as pd
from src.data.data_loader import load_and_clean_data

def test_load_and_clean_data(tmp_path):
    """
    Test the data processing pipeline handles edge cases correctly.
    """
    # Create mock CSV
    test_csv = tmp_path / "test_data.csv"
    mock_data = pd.DataFrame({
        'InvoiceNo': ['536365', 'C536366', '536367', '536368'],
        'StockCode': ['85123A', '85123A', '22423', '22423'],
        'Description': ['ITEM 1', 'ITEM 1', 'ITEM 2', 'ITEM 2'],
        'Quantity': [6, -6, 0, 10], 
        'InvoiceDate': ['12/1/2010 8:26', '12/1/2010 8:28', '12/1/2010 8:30', '12/1/2010 8:32'],
        'UnitPrice': [2.55, 2.55, 3.0, 3.0],
        'CustomerID': [17850, 17850, 17850, None], # One missing customer
        'Country': ['United Kingdom'] * 4
    })
    mock_data.to_csv(test_csv, index=False)

    df = load_and_clean_data(str(test_csv))
    
    # Assertions
    assert not df.empty
    # Cancelled orders dropped
    assert 'C536366' not in df['InvoiceNo'].values
    # Zero/negative quantities dropped
    assert 0 not in df['Quantity'].values
    # Missing CustomerIDs dropped
    assert len(df) == 1
    # Check Feature Engineering
    assert 'Revenue' in df.columns
    assert df['Revenue'].iloc[0] == 6 * 2.55
