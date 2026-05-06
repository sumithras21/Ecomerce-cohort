import streamlit as st
import pandas as pd
import os
from dotenv import load_dotenv
from src.data.data_loader import load_and_clean_data, get_rfm_segments

# Load environment variables
load_dotenv()
from src.visualization.plots import (
    plot_monthly_sales, 
    plot_top_products, 
    plot_rfm_segments, 
    plot_rfm_scatter, 
    plot_geographic_map
)
from src.models.forecasting import generate_forecast
from src.visualization.forecast_plots import plot_forecast

# -------------------------------
# PAGE CONFIG
# -------------------------------
st.set_page_config(
    page_title="Ecommerce Analytics Pro Dashboard",
    page_icon="📈",
    layout="wide"
)

# -------------------------------
# STYLES & UI Improvements
# -------------------------------
st.markdown("""
<style>
    .metric-card {
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .metric-value { font-size: 2rem; font-weight: bold; color: #4CAF50; }
    .metric-label { font-size: 1rem; color: #aaa; }
</style>
""", unsafe_allow_html=True)

# -------------------------------
# DATA LOADING
# -------------------------------
DATA_PATH = "data/OnlineRetail.csv"

with st.spinner("Loading and processing data..."):
    df = load_and_clean_data(DATA_PATH)
    if not df.empty:
        rfm_df = get_rfm_segments(df)

if df.empty:
    st.stop()

# -------------------------------
# SIDEBAR FILTERS
# -------------------------------
st.sidebar.title("📈 Filters & Navigation")

# Navigation
page = st.sidebar.radio(
    "Select View",
    ["Executive Summary", "Customer Insights", "Geographic Analysis", "Advanced Forecasting", "🤖 Chat with Data"]
)

st.sidebar.markdown("---")
with st.sidebar.popover("⚙️ Settings"):
    st.markdown("### Configuration")
    env_key = os.getenv("GROQ_API_KEY", "")
    groq_api_key = st.text_input("Groq API Key", value=env_key, type="password", help="Loaded from .env or enter here manually")

st.sidebar.markdown("---")
st.sidebar.subheader("Global Filters")

# Date Filter
min_date = df['InvoiceDate'].min().date()
max_date = df['InvoiceDate'].max().date()
start_date, end_date = st.sidebar.date_input("Select Date Range", [min_date, max_date])

# Apply Date Filter
mask = (df['InvoiceDate'].dt.date >= start_date) & (df['InvoiceDate'].dt.date <= end_date)
filtered_df = df.loc[mask]

# Update RFM based on filter
filtered_rfm = get_rfm_segments(filtered_df)

# -------------------------------
# VIEWS
# -------------------------------
st.title("📊 Ecommerce Business Intelligence Pro")
st.markdown(f"**Analyzing data from {start_date} to {end_date}**")

if page == "Executive Summary":
    
    # Calculate Dynamic KPIs
    total_rev = filtered_df['Revenue'].sum()
    total_orders = filtered_df['InvoiceNo'].nunique()
    total_cust = filtered_df['CustomerID'].nunique()
    aov = total_rev / total_orders if total_orders > 0 else 0

    # UI: KPI Row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Total Revenue</div><div class='metric-value'>${total_rev:,.0f}</div></div>", unsafe_allow_html=True)
    with col2:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Total Orders</div><div class='metric-value'>{total_orders:,}</div></div>", unsafe_allow_html=True)
    with col3:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Unique Customers</div><div class='metric-value'>{total_cust:,}</div></div>", unsafe_allow_html=True)
    with col4:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Avg Order Value</div><div class='metric-value'>${aov:,.2f}</div></div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts Row
    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(plot_monthly_sales(filtered_df), use_container_width=True)
    with c2:
        st.plotly_chart(plot_top_products(filtered_df, 10), use_container_width=True)

elif page == "Customer Insights":
    
    st.subheader("Customer Segmentation (RFM Model)")
    
    c1, c2 = st.columns([1, 2])
    with c1:
        st.plotly_chart(plot_rfm_segments(filtered_rfm), use_container_width=True)
    with c2:
        st.plotly_chart(plot_rfm_scatter(filtered_rfm), use_container_width=True)
        
    st.markdown("### Segment Details")
    st.dataframe(
        filtered_rfm.groupby('Customer_Segment').agg({
            'Recency': 'mean',
            'Frequency': 'mean',
            'Monetary': ['mean', 'sum', 'count']
        }).round(1),
        use_container_width=True
    )

elif page == "Geographic Analysis":
    
    st.subheader("Global Revenue Heatmap")
    st.plotly_chart(plot_geographic_map(filtered_df), use_container_width=True)
    
    st.markdown("### Top 10 Countries by Revenue")
    country_rev = filtered_df.groupby('Country')['Revenue'].sum().sort_values(ascending=False).head(10).reset_index()
    st.dataframe(country_rev.style.format({'Revenue': '${:,.2f}'}), use_container_width=True)

elif page == "Advanced Forecasting":
    st.subheader("Sales Forecasting Model (Predictive Analytics)")
    st.markdown("Holt-Winters Exponential Smoothing model predicting next 30 days of revenue.")
    
    with st.spinner("Training forecasting model..."):
        hist_df, forecast_df = generate_forecast(filtered_df, periods=30)
    
    if not hist_df.empty:
        st.plotly_chart(plot_forecast(hist_df, forecast_df), use_container_width=True)
        
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("### Forecast Data Export")
            st.download_button(
                label="Download Forecast CSV",
                data=forecast_df.to_csv(index=False).encode('utf-8'),
                file_name="revenue_forecast.csv",
                mime="text/csv"
            )
        with c2:
            expected_revenue = forecast_df['Forecast_Revenue'].sum()
            st.metric("Expected Total 30-Day Revenue", f"${expected_revenue:,.2f}")
    else:
        st.warning("Not enough continuous temporal data for the date range selected.")

elif page == "🤖 Chat with Data":
    st.subheader("🤖 Chat with your Data (Powered by LLM)")
    st.markdown("Ask natural language questions about your revenue, customers, and products! The AI will write Pandas code to calculate the exact answer.")
    
    if not groq_api_key:
        st.info("Please enter your Groq API key in the Settings popover to activate the AI Chat.")
    else:
        from langchain_experimental.agents import create_pandas_dataframe_agent
        from langchain_groq import ChatGroq
        
        # Initialize LangChain agent
        llm = ChatGroq(temperature=0, model="llama-3.3-70b-versatile", groq_api_key=groq_api_key)
        agent = create_pandas_dataframe_agent(
            llm,
            filtered_df,
            verbose=True,
            agent_type="zero-shot-react-description"
        )

        # Chat history state
        if "chat_messages" not in st.session_state:
            st.session_state.chat_messages = [
                {"role": "assistant", "content": "Hi! I have access to your current Ecommerce dataset. Try asking me *'What are our top 3 best-selling products by quantity?'*"}
            ]

        # Render chat history
        for msg in st.session_state.chat_messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        # Chat input
        if prompt := st.chat_input("Ask a question about the ecommerce data..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                with st.spinner("Analyzing data..."):
                    try:
                        response = agent.invoke({"input": prompt})
                        answer = response["output"]
                        st.markdown(answer)
                        st.session_state.chat_messages.append({"role": "assistant", "content": answer})
                    except Exception as e:
                        error_msg = f"Sorry, I encountered an error: {str(e)}"
                        st.error(error_msg)
                        st.session_state.chat_messages.append({"role": "assistant", "content": error_msg})
