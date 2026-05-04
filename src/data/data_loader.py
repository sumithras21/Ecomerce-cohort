import pandas as pd
import streamlit as st
import os

@st.cache_data
def load_and_clean_data(file_path):
    """
    Load data from CSV and perform basic cleaning and feature engineering.
    Cached for fast reload in Streamlit.
    """
    if not os.path.exists(file_path):
        st.error(f"Dataset not found at {file_path}. Please check the path.")
        return pd.DataFrame()
        
    df = pd.read_csv(file_path, encoding='unicode_escape')
    
    # 1. Cleaning
    # Drop missing CustomerID
    df = df.dropna(subset=['CustomerID']).copy()
    # Remove cancelled orders (InvoiceNo starts with 'C')
    df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
    # Remove non-positive quantities and prices
    df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
    
    # 2. Feature Engineering
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['Revenue'] = df['Quantity'] * df['UnitPrice']
    df['YearMonth'] = df['InvoiceDate'].dt.to_period('M').astype(str)
    
    return df

@st.cache_data
def get_rfm_segments(df):
    """
    Calculate RFM (Recency, Frequency, Monetary) metrics and segment customers.
    """
    # Define snapshot date as 1 day after the last invoice
    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
    
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
        'InvoiceNo': 'nunique',
        'Revenue': 'sum'
    }).reset_index()
    
    rfm.rename(columns={
        'InvoiceDate': 'Recency',
        'InvoiceNo': 'Frequency',
        'Revenue': 'Monetary'
    }, inplace=True)
    
    # Simple scoring (1-4)
    r_labels = range(4, 0, -1)
    f_labels = range(1, 5)
    m_labels = range(1, 5)
    
    try:
        r_quartiles = pd.qcut(rfm['Recency'], q=4, labels=r_labels, duplicates='drop')
        f_quartiles = pd.qcut(rfm['Frequency'], q=4, labels=f_labels, duplicates='drop')
        m_quartiles = pd.qcut(rfm['Monetary'], q=4, labels=m_labels, duplicates='drop')
        
        rfm['R_Score'] = r_quartiles.astype(int)
        rfm['F_Score'] = f_quartiles.astype(int)
        rfm['M_Score'] = m_quartiles.astype(int)
    except ValueError:
        # Fallback if qcut fails due to lots of identical values
        rfm['R_Score'] = 1
        rfm['F_Score'] = 1
        rfm['M_Score'] = 1
        
    rfm['RFM_Segment'] = rfm.apply(lambda x: str(int(x['R_Score'])) + str(int(x['F_Score'])) + str(int(x['M_Score'])), axis=1)
    rfm['RFM_Score'] = rfm[['R_Score', 'F_Score', 'M_Score']].sum(axis=1)
    
    # Customer Level Labels
    def segment_customer(df):
        if df['RFM_Score'] >= 11:
            return 'Champions'
        elif df['RFM_Score'] >= 8:
            return 'Loyal'
        elif df['RFM_Score'] >= 6:
            return 'Potential'
        else:
            return 'Needs Attention'
            
    rfm['Customer_Segment'] = rfm.apply(segment_customer, axis=1)
    return rfm
