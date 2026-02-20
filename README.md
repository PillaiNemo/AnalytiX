**Demo Link**:
https://analytixdata.lovable.app

**Data Insights Hub**
This project is a web application that automates basic exploratory data analysis. It allows a user to upload a dataset and quickly understand its structure, quality, and patterns through statistics and visualizations.

The goal of this project is to reduce the time required to manually explore data before building machine learning models.

**Problem**
In most data science workflows, a large amount of time is spent understanding the dataset. This includes checking missing values, data types, distributions, and correlations. These steps are repetitive and often slow, especially for beginners.

This project provides a simple and structured way to perform these tasks automatically.

**Features**
The application currently supports:

- Uploading CSV datasets
- Displaying a data preview
- Summary statistics for numeric columns
- Detection of missing values
- Correlation analysis
- Disribution plots and histograms
- Interactive dashboard for exploration
- The interface is designed to be simple and easy to use.

**How it works**
The user uploads a dataset in CSV format.

- The system reads the file and analyzes its structure.
- It generates summary statistics and visualizations.
- The results are displayed in a dashboard.
- The user can explore different sections to understand the data.

**Technology stack**
_Backend and data processing:_
Python
Pandas
NumPy

_Visualization:_
Matplotlib
Seaborn

_Interface:_
Streamlit
Installation

**Clone the repository:**
git clone https://github.com/PillaiNemo/AnalytiX.git

**Move into the project folder:**
cd AnalytiX

**Install dependencies:**
pip install -r requirements.txt

**Run the application:**
streamlit run app.py

**Project structure**

data-insights-hub
│
├── app.py
├── requirements.txt
├── datasets
└── utils

**Limitations**
- The current version focuses only on basic exploratory analysis. It does not include advanced features such as anomaly detection, automated model training, or report generation.

**Future work**
Possible improvements include:

- Support for larger datasets
- Additional visualizations
- Automated anomaly detection
- Model recommendation

Downloadable reports

Integration with databases

Acknowledgement

This project was developed as part of a generative AI challenge focused on building practical and functional systems.
