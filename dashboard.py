import streamlit as st
import pandas as pd
import os
from datetime import datetime

# Page config
st.set_page_config(
    page_title="News Data Dashboard",
    page_icon="📰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .news-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        margin: 10px 0;
        border-left: 4px solid #1f77b4;
    }
    .source-badge {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        margin: 5px 5px 5px 0;
    }
    .hn-badge {
        background-color: #ff6600;
        color: white;
    }
    .tech-badge {
        background-color: #0084ff;
        color: white;
    }
    </style>
""", unsafe_allow_html=True)

# Title and header
st.title("📰 News Data Dashboard")
st.markdown("Latest tech news and Hacker News stories collected by GitHub Actions")

# Load data
@st.cache_data
def load_data():
    try:
        if os.path.exists("NewsData.csv"):
            df = pd.read_csv("NewsData.csv")
            if not df.empty:
                return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
    return pd.DataFrame()

df = load_data()

# Sidebar filters
st.sidebar.header("🔍 Filters")

if not df.empty:
    # Date filter
    if "Date" in df.columns:
        dates = pd.to_datetime(df["Date"], errors='coerce').dropna().unique()
        if len(dates) > 0:
            selected_date = st.sidebar.selectbox(
                "Filter by Date",
                sorted(dates, reverse=True),
                format_func=lambda x: pd.Timestamp(x).strftime("%Y-%m-%d")
            )
            df_filtered = df[pd.to_datetime(df["Date"], errors='coerce') == selected_date]
        else:
            df_filtered = df
    else:
        df_filtered = df
    
    # Source filter
    if "Source" in df.columns:
        sources = df_filtered["Source"].unique()
        selected_sources = st.sidebar.multiselect(
            "Filter by Source",
            sorted(sources),
            default=sorted(sources)
        )
        df_filtered = df_filtered[df_filtered["Source"].isin(selected_sources)]
    
    # Sort by score
    if "Score" in df.columns:
        sort_by = st.sidebar.radio(
            "Sort by",
            ["Score (High to Low)", "Score (Low to High)", "Date (Newest)", "Date (Oldest)"]
        )
        
        if sort_by == "Score (High to Low)":
            df_filtered = df_filtered.sort_values("Score", ascending=False)
        elif sort_by == "Score (Low to High)":
            df_filtered = df_filtered.sort_values("Score", ascending=True)
        elif sort_by == "Date (Newest)":
            df_filtered = df_filtered.sort_values("Date", ascending=False)
        else:
            df_filtered = df_filtered.sort_values("Date", ascending=True)
    
    # Main content
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Stories", len(df_filtered))
    with col2:
        if "Score" in df.columns:
            st.metric("Avg Score", f"{df_filtered['Score'].mean():.0f}")
    with col3:
        if "Source" in df.columns:
            st.metric("Sources", df_filtered["Source"].nunique())
    
    st.divider()
    
    # Display stories
    st.subheader("📑 Stories")
    
    if len(df_filtered) > 0:
        for idx, row in df_filtered.iterrows():
            with st.container():
                col1, col2 = st.columns([4, 1])
                
                with col1:
                    # Title
                    title = row.get("Title", "No Title")
                    url = row.get("URL", "#")
                    
                    if url != "#" and pd.notna(url):
                        st.markdown(f"### [{title}]({url})")
                    else:
                        st.markdown(f"### {title}")
                    
                    # Source badge
                    source = row.get("Source", "Unknown")
                    badge_class = "hn-badge" if "Hacker" in source else "tech-badge"
                    st.markdown(
                        f'<span class="source-badge {badge_class}">{source}</span>',
                        unsafe_allow_html=True
                    )
                    
                    # Metadata
                    col_date, col_score = st.columns(2)
                    with col_date:
                        date = row.get("Date", "N/A")
                        st.caption(f"📅 {date}")
                    with col_score:
                        score = row.get("Score", 0)
                        st.caption(f"⭐ Score: {score}")
                
                st.divider()
    else:
        st.info("No stories found with selected filters.")
else:
    st.warning("⚠️ No data available yet. NewsData.csv is empty or doesn't exist.")
    st.info("Run the Collector.py script or wait for the GitHub Actions workflow to execute.")

# Footer
st.divider()
st.markdown("""
    <div style="text-align: center; color: gray; font-size: 12px;">
        <p>News Data Collector • Data collected via GitHub Actions</p>
    </div>
""", unsafe_allow_html=True)
