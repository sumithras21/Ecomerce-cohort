import streamlit as st
from PIL import Image

# -------------------------------
# PAGE CONFIG
# -------------------------------
st.set_page_config(
    page_title="Ecommerce Analytics Dashboard",
    page_icon="📊",
    layout="wide"
)

# -------------------------------
# TITLE
# -------------------------------
st.title("📊 Ecommerce Business Intelligence Dashboard")
st.markdown("### Python + Streamlit Analytics Solution")

st.markdown("---")

# -------------------------------
# SIDEBAR NAVIGATION
# -------------------------------
st.sidebar.title("Navigation")

page = st.sidebar.radio(
    "Select Section",
    [
        "Executive Dashboard",
        "Customer Analytics",
        "Product Analysis",
        "Geographic Analysis",
        "Sales Forecasting"
    ]
)

# -------------------------------
# EXECUTIVE DASHBOARD
# -------------------------------
if page == "Executive Dashboard":

    # KPI ROW
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Total Revenue", "$8.9M", "+12%")

    with col2:
        st.metric("Orders", "397K", "+8%")

    with col3:
        st.metric("Customers", "4,339", "+5%")

    with col4:
        st.metric("Avg Order Value", "$22.39", "+3%")

    st.markdown("---")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Monthly Sales Trend")
        st.image("../charts/monthly_sales.png", use_container_width=True)

    with col2:
        st.subheader("Top Products")
        st.image("../charts/top_products.png", use_container_width=True)

# -------------------------------
# CUSTOMER ANALYTICS
# -------------------------------
elif page == "Customer Analytics":

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Customer Segments")
        st.image("../charts/customer_segments.png", use_container_width=True)

    with col2:
        st.subheader("RFM Heatmap")
        st.image("../charts/rfm_heatmap.png", use_container_width=True)

    st.markdown("---")

    st.subheader("Segment Comparison")
    st.image("../charts/segment_comparison.png", use_container_width=True)

# -------------------------------
# PRODUCT ANALYSIS
# -------------------------------
elif page == "Product Analysis":

    tab1, tab2, tab3 = st.tabs([
        "Market Basket",
        "Product Network",
        "Basket Summary"
    ])

    with tab1:
        st.image("../charts/market_basket_analysis.png", use_container_width=True)

    with tab2:
        st.image("../charts/product_cooccurrence_heatmap.png", use_container_width=True)

    with tab3:
        st.image("../charts/basket_analysis_summary.png", use_container_width=True)

# -------------------------------
# GEOGRAPHIC ANALYSIS
# -------------------------------
elif page == "Geographic Analysis":

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Global Revenue Map")
        st.image("../charts/geographic_analysis_overview.png", use_container_width=True)

    with col2:
        st.subheader("Country Analysis")
        st.image("../charts/geographic_detailed_analysis.png", use_container_width=True)

# -------------------------------
# SALES FORECASTING
# -------------------------------
elif page == "Sales Forecasting":

    st.subheader("Sales Forecasting Model")
    st.image("../charts/sales_forecasting.png", use_container_width=True)

    st.markdown("---")

    st.subheader("Seasonal Trends")
    st.image("../charts/seasonal_analysis.png", use_container_width=True)

# -------------------------------
# FOOTER
# -------------------------------
st.markdown("---")
st.markdown("### 🚀 Built using Python, Streamlit & Power BI Data Pipeline")