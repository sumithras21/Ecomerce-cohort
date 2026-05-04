import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

def plot_monthly_sales(df):
    monthly_revenue = df.groupby('YearMonth')['Revenue'].sum().reset_index()
    fig = px.line(monthly_revenue, x='YearMonth', y='Revenue', 
                  title='Monthly Sales Trend',
                  markers=True,
                  line_shape='spline')
    fig.update_layout(xaxis_title="Month", yaxis_title="Revenue ($)", hovermode="x unified")
    return fig

def plot_top_products(df, top_n=10):
    top_products = df.groupby('Description')['Revenue'].sum().sort_values(ascending=False).head(top_n).reset_index()
    fig = px.bar(top_products, x='Revenue', y='Description', orientation='h',
                 title=f'Top {top_n} Products by Revenue',
                 color='Revenue', color_continuous_scale='Blues')
    fig.update_layout(yaxis={'categoryorder':'total ascending'})
    return fig

def plot_rfm_segments(rfm):
    segment_counts = rfm['Customer_Segment'].value_counts().reset_index()
    segment_counts.columns = ['Segment', 'Count']
    fig = px.pie(segment_counts, values='Count', names='Segment', 
                 title='Customer Segmentation Overview',
                 hole=0.4, color_discrete_sequence=px.colors.qualitative.Pastel)
    fig.update_traces(textposition='inside', textinfo='percent+label')
    return fig

def plot_rfm_scatter(rfm):
    fig = px.scatter(rfm, x='Recency', y='Monetary', color='Customer_Segment',
                     size='Frequency', hover_data=['CustomerID', 'RFM_Score'],
                     title='RFM Segments: Recency vs Monetary (Size = Frequency)',
                     opacity=0.7)
    return fig

def plot_geographic_map(df):
    country_rev = df.groupby('Country')['Revenue'].sum().reset_index()
    fig = px.choropleth(country_rev, locations='Country', locationmode='country names',
                        color='Revenue', hover_name='Country',
                        color_continuous_scale='Viridis',
                        title='Global Revenue Distribution')
    # Focus on Europe as mostly UK data
    fig.update_geos(fitbounds="locations")
    return fig
