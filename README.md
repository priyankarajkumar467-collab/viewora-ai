# WatchWise AI

### OTT Audience Segmentation & Personalization Platform

WatchWise AI is an enterprise-grade OTT analytics platform that analyzes viewer behavioral logs, classifies audiences into distinct behavioral cohorts, provides hyper-personalized content recommendations, and empowers streaming platforms to simulate how behavioral shifts influence segmentation.

Designed for production analytics, hackathon showcases, university research, and live demonstrations, WatchWise AI operates as a zero-dependency static frontend that immediately works out of the box in **Demo Mode**, while offering full seamless integration with a Python **FastAPI** machine learning backend.

---

## 🌟 Key Features

* **Audience Segmentation**: Automatically partitions viewer bases into behavioral cohorts:
  * **Casual & Regular Viewers** (75.5% · 906 viewers): Moderate watch time, regular sessions, balanced completion rate, distributed weekday consumption.
  * **Binge Enthusiasts** (24.5% · 294 viewers): High cumulative watch time, extended session duration, high completion rate, concentrated weekend viewing.
* **Viewer Behavior Analysis**: Interactive inference engine that evaluates multi-dimensional streaming metrics (Watch Time, Average Session Length, Session Count, Weekend Ratio, Completion Rate, Top Genre) to output classification, confidence rating, and behavioral reasoning.
* **Personalized Recommendations**: Context-aware catalog recommendation engine matching viewers with tailored movie and series titles based on content genres and predicted consumption propensity.
* **Audience Insights & Visual Analytics**: Deep-dive operational KPIs including Peak Viewing Windows (8 PM – 11 PM), Most Engaged Genres (Thriller), Segment Completion Benchmarks, and Weekend Engagement dynamics.
* **What-If Audience Simulator**: Interactive scenario testing workbench with real-time sliders allowing platform operators to simulate behavioral transformations and visualize cohort transition boundaries.
* **AI-Powered Insight Panels**: Dynamic, data-grounded strategic observations derived directly from 1,200+ simulated viewer logs.
* **One-Click Dataset CSV Export**: Download complete 1,200-viewer behavioral telemetry reports directly as structured CSV files using client-side `Blob` streaming.
* **Custom CSV Dataset Import & Validation**: Upload custom audience CSV files via the Settings modal with schema validation checking required behavioral metrics (`watch_time_hours`, `avg_session_mins`, `session_count`, `weekend_ratio`, `completion_rate`), instantly updating all KPI cards and charts in real time.
* **Seamless Demo Mode & Resilient Architecture**: Automatically operates client-side using JavaScript mock ML pipelines if the Python backend is offline, guaranteeing 100% uptime during live presentations.
* **High-Performance FastAPI Backend**: RESTful Python service implementing `/health`, `/analyze`, and `/recommend` endpoints.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Semantic HTML5, Modern CSS3 (Dark Theme & Glassmorphism), Vanilla JavaScript (ES6+), Chart.js (CDN) |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | Scikit-learn, Joblib, NumPy, Logistic Regression & Random Forest Architecture |
| **Deployment** | GitHub Pages (zero-build static hosting), Cloud Run / Docker (full-stack API) |

---

## 📂 Project Structure

```text
WatchWise-AI/
│
├── index.html          # Core single-page dashboard application (root level)
├── style.css           # Premium dark theme styling, glassmorphism, responsive grid
├── script.js           # UI logic, chart controllers, API connector, interactive simulator
├── data.js             # 1,200+ synthetic viewer logs, OTT catalog & fallback ML engine
├── README.md           # Technical documentation and execution guide
├── requirements.txt    # Python dependencies for the FastAPI microservice
├── .gitignore          # Version control ignore rules
│
├── assets/             # Media and static graphics
│   └── images/         # Cinematic OTT movie/show thumbnails & posters
│
├── api/
│   └── app.py          # FastAPI application serving /health, /analyze, /recommend
│
└── models/
    ├── segmenter.py    # Python behavioral segmentation model implementation
    ├── train_model.py  # Model training pipeline and joblib exporter
    └── model_meta.json # Model metadata and feature weight definitions
```

---

## 🚀 Running the Frontend

The frontend is architected as a pure, zero-build static application. It runs anywhere with zero build step required:

### Option 1: Direct File Opening
Double-click `index.html` in your file browser or right-click and select **Open with Browser** (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (VS Code / Python / Node)
Using Python's built-in web server:
```bash
# Python 3
python -m http.server 3000
```
Then visit `http://localhost:3000`.

Using VS Code **Live Server** extension:
Right-click `index.html` and choose **Open with Live Server**.

---

## 🐍 Running the Python Backend (Optional)

The backend provides high-performance API endpoints for classification and recommendations.

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install requirements**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the model (Optional)**:
   ```bash
   python models/train_model.py
   ```

4. **Launch the FastAPI API server**:
   ```bash
   uvicorn api.app:app --reload --port 8000
   ```

5. **Verify API status**:
   Open `http://localhost:8000/docs` to test the interactive Swagger documentation.

When the backend is active at `http://localhost:8000`, the WatchWise AI frontend will automatically detect the connection and switch from **🟢 Demo Mode** to **🟢 API Connected**.

---

## 🌐 GitHub Pages Deployment

WatchWise AI is explicitly built to be hosted on **GitHub Pages** with zero configuration:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial WatchWise AI release"
   git branch -M main
   git remote add origin https://github.com/USERNAME/WatchWise-AI.git
   git push -u origin main
   ```
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and set the folder to `/ (root)`.
4. Click **Save**.
5. Your live application will be instantly accessible at:
   ```text
   https://USERNAME.github.io/WatchWise-AI/
   ```

Because `data.js` and `script.js` embed client-side fallback ML inference, the entire dashboard—including live viewer analysis, dynamic what-if simulation, and interactive charts—functions with 100% fidelity without needing an active Python server.

---

## 📊 Machine Learning Model Architecture

The segmentation engine processes 5 key behavioral features:
* `watch_time_hours`: Total hours watched across the tracking period.
* `avg_session_mins`: Mean duration of continuous viewing sessions.
* `session_count`: Total discrete streaming sessions.
* `weekend_ratio`: Percentage of total consumption occurring Friday evening through Sunday night.
* `completion_rate`: Percentage of started titles completed to credits.

### Decision Boundary
A logistic regression classifier evaluates standardized behavioral inputs against baseline benchmarks:
$$\text{Logit} = \sum w_i \cdot \frac{x_i - \mu_i}{\sigma_i}$$

Where features with the strongest binge coefficients (`watch_time_hours` $w=0.38$, `avg_session_mins` $w=0.32$, `weekend_ratio` $w=0.28$) drive classification into the high-engagement **Binge Enthusiasts** cohort, with calibrated confidence scoring and transparent natural-language diagnostic feedback.

---

## 📄 License
Apache-2.0 License. Built for OTT platform innovation.
