import streamlit as st
import requests
import pandas as pd

API_URL = "http://10.0.0.51:8000/api/"  # When running locally

st.set_page_config(page_title="Shift Viewer", page_icon="🕒")
st.title("Weekly Shift Viewer")

name_input = st.text_input("Enter employee name (partial or full):")

if name_input:
    with st.spinner("Fetching schedule..."):
        try:
            response = requests.get(f"{API_URL}shifts", params={"name": name_input})
            response.raise_for_status()
            shifts = response.json()
        except Exception as e:
            st.error(f"Error fetching shifts: {e}")
            shifts = []

    if shifts:
        df = pd.DataFrame(shifts)
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%A, %b %d")
        st.table(df[["date", "start", "end", "type", "hours"]])
    else:
        st.warning("No shifts found.")
        
if name_input:
    ics_url = f"{API_URL}calendar/{name_input}.ics"
    st.markdown(
        f"""
        <a href="{ics_url}" download>
            <button style="background-color: #4CAF50; color: white; padding: 8px 16px; font-size: 16px; border: none; border-radius: 5px;">
                Sync to Calendar (.ics)
            </button>
        </a>
        """,
        unsafe_allow_html=True
    )
