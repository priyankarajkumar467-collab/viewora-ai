/**
 * WatchWise AI - Frontend Application Logic
 * OTT Audience Segmentation & Personalization Platform
 */

(function () {
  'use strict';

  // Global Application State
  const state = {
    currentView: 'overview',
    apiMode: 'demo', // 'demo' | 'connected'
    apiUrl: 'http://localhost:8000',
    charts: {},
    activeGenreFilter: 'all',
    simulationBaseline: {
      watch_time_hours: 18.5,
      avg_session_mins: 40,
      session_count: 22,
      weekend_ratio: 35,
      completion_rate: 65,
      top_genre: 'Thriller',
      segment: 'Casual & Regular Viewers',
    },
  };

  // DOM Elements cache
  const elements = {
    sidebar: document.getElementById('sidebar'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    pageViews: document.querySelectorAll('.page-view'),
    pageTitle: document.getElementById('pageTitle'),
    pageBreadcrumb: document.getElementById('pageBreadcrumb'),
    modeBadge: document.getElementById('modeBadge'),
    sidebarModeText: document.getElementById('sidebarModeText'),
    sidebarStatusDot: document.getElementById('sidebarStatusDot'),
    settingsModal: document.getElementById('settingsModal'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    apiUrlInput: document.getElementById('apiUrlInput'),
    demoModeToggle: document.getElementById('demoModeToggle'),
    toastContainer: document.getElementById('toastContainer'),
    headerSearchInput: document.getElementById('headerSearchInput'),
  };

  /**
   * Toast notification helper
   */
  function showToast(message, duration = 3000) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /**
   * Navigation router
   */
  const VIEW_TITLES = {
    overview: { title: 'Overview', breadcrumb: 'Platform / Overview' },
    segments: { title: 'Audience Segments', breadcrumb: 'Platform / Audience Segments' },
    analyzer: { title: 'Viewer Analyzer', breadcrumb: 'Inference / Viewer Analyzer' },
    recommendations: { title: 'Recommendations', breadcrumb: 'Personalization / Recommendations' },
    insights: { title: 'Audience Insights', breadcrumb: 'Analytics / Audience Insights' },
    simulator: { title: 'What-If Audience Simulator', breadcrumb: 'Simulation / What-If Workbench' },
  };

  function switchView(viewId) {
    if (!VIEW_TITLES[viewId]) viewId = 'overview';
    state.currentView = viewId;

    // Update active class on nav
    elements.navItems.forEach((btn) => {
      if (btn.dataset.view === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle views
    elements.pageViews.forEach((view) => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Header
    if (elements.pageTitle) elements.pageTitle.textContent = VIEW_TITLES[viewId].title;
    if (elements.pageBreadcrumb) elements.pageBreadcrumb.textContent = VIEW_TITLES[viewId].breadcrumb;

    // Close mobile menu if open
    if (elements.sidebar && elements.sidebar.classList.contains('mobile-open')) {
      elements.sidebar.classList.remove('mobile-open');
    }

    // Trigger chart resize if needed
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Backend API Health Check
   * Graceful fallback to Demo Mode if backend is unreachable
   */
  async function checkBackendHealth() {
    if (state.demoModeForce) {
      setApiStatus(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${state.apiUrl}/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'healthy') {
          setApiStatus(true);
          return;
        }
      }
      setApiStatus(false);
    } catch {
      // Offline or network error: effortlessly fall back to Demo Mode
      setApiStatus(false);
    }
  }

  function setApiStatus(connected) {
    if (connected) {
      state.apiMode = 'connected';
      if (elements.modeBadge) {
        elements.modeBadge.className = 'mode-pill api-connected';
        elements.modeBadge.innerHTML = '🟢 API Connected';
      }
      if (elements.sidebarModeText) elements.sidebarModeText.textContent = 'API Connected';
      if (elements.sidebarStatusDot) elements.sidebarStatusDot.classList.remove('offline');
    } else {
      state.apiMode = 'demo';
      if (elements.modeBadge) {
        elements.modeBadge.className = 'mode-pill';
        elements.modeBadge.innerHTML = '🟢 Demo Mode';
      }
      if (elements.sidebarModeText) elements.sidebarModeText.textContent = 'Demo Mode (Active)';
      if (elements.sidebarStatusDot) elements.sidebarStatusDot.classList.add('offline');
    }
  }

  /**
   * Chart.js Configuration & Styling Utilities
   */
  const chartColors = {
    cyan: '#06b6d4',
    cyanAlpha: 'rgba(6, 182, 212, 0.2)',
    purple: '#8b5cf6',
    purpleAlpha: 'rgba(139, 92, 246, 0.2)',
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    textColor: '#94a3b8',
  };

  function initOverviewCharts() {
    const data = window.WatchWiseData;
    if (!data || typeof Chart === 'undefined') return;

    // 1. Viewer Segment Distribution Donut Chart
    const donutCtx = document.getElementById('segmentDonutChart');
    if (donutCtx) {
      state.charts.donut = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Casual & Regular Viewers', 'Binge Enthusiasts'],
          datasets: [
            {
              data: [data.aggregates.casualCount, data.aggregates.bingeCount],
              backgroundColor: [chartColors.cyan, chartColors.purple],
              borderColor: '#121a2d',
              borderWidth: 3,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0a0f1d',
              borderColor: '#1c2742',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#cbd5e1',
              callbacks: {
                label: function (context) {
                  const val = context.raw;
                  const pct = ((val / data.aggregates.totalViewers) * 100).toFixed(1);
                  return ` ${val.toLocaleString()} viewers (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // 2. Watch Time Trend Line Chart
    const trendCtx = document.getElementById('watchTimeTrendChart');
    if (trendCtx) {
      state.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: data.weeklyTrends.labels,
          datasets: [
            {
              label: 'Overall Platform',
              data: data.weeklyTrends.overallWatchTime,
              borderColor: chartColors.cyan,
              backgroundColor: chartColors.cyanAlpha,
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: chartColors.cyan,
              pointRadius: 3,
            },
            {
              label: 'Binge Enthusiasts',
              data: data.weeklyTrends.bingeWatchTime,
              borderColor: chartColors.purple,
              borderWidth: 2,
              borderDash: [4, 4],
              tension: 0.35,
              fill: false,
              pointRadius: 0,
            },
            {
              label: 'Casual Viewers',
              data: data.weeklyTrends.casualWatchTime,
              borderColor: '#64748b',
              borderWidth: 1.5,
              tension: 0.35,
              fill: false,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: chartColors.textColor, boxWidth: 12, font: { size: 11 } },
            },
            tooltip: {
              backgroundColor: '#0a0f1d',
              borderColor: '#1c2742',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: { color: chartColors.gridColor },
              ticks: { color: chartColors.textColor, font: { size: 11 } },
            },
            y: {
              grid: { color: chartColors.gridColor },
              ticks: {
                color: chartColors.textColor,
                font: { size: 11 },
                callback: (val) => val + ' hrs',
              },
            },
          },
        },
      });
    }

    // 3. Genre Engagement Bar Chart
    const genreCtx = document.getElementById('genreBarChart');
    if (genreCtx) {
      const genres = data.genres;
      const counts = genres.map((g) => data.aggregates.genreCounts[g] || 0);

      state.charts.genre = new Chart(genreCtx, {
        type: 'bar',
        data: {
          labels: genres,
          datasets: [
            {
              label: 'Viewers Engaged',
              data: counts,
              backgroundColor: [
                '#38bdf8',
                '#818cf8',
                '#34d399',
                '#f43f5e',
                '#a855f7',
                '#f59e0b',
              ],
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0a0f1d',
              borderColor: '#1c2742',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: chartColors.textColor, font: { size: 11 } },
            },
            y: {
              grid: { color: chartColors.gridColor },
              ticks: { color: chartColors.textColor, font: { size: 11 } },
            },
          },
        },
      });
    }
  }

  function initSegmentCharts() {
    const data = window.WatchWiseData;
    if (!data || typeof Chart === 'undefined') return;

    const radarCtx = document.getElementById('segmentRadarChart');
    if (radarCtx) {
      state.charts.radar = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: [
            'Watch Time (hrs)',
            'Session Duration (mins)',
            'Completion Rate (%)',
            'Weekend Ratio (%)',
            'Session Count',
          ],
          datasets: [
            {
              label: 'Binge Enthusiasts',
              data: [
                data.aggregates.bingeAvg.watchTime,
                data.aggregates.bingeAvg.sessionMins,
                data.aggregates.bingeAvg.completion,
                data.aggregates.bingeAvg.weekendRatio,
                42,
              ],
              borderColor: chartColors.purple,
              backgroundColor: chartColors.purpleAlpha,
              borderWidth: 2,
              pointBackgroundColor: chartColors.purple,
            },
            {
              label: 'Casual & Regular Viewers',
              data: [
                data.aggregates.casualAvg.watchTime,
                data.aggregates.casualAvg.sessionMins,
                data.aggregates.casualAvg.completion,
                data.aggregates.casualAvg.weekendRatio,
                24,
              ],
              borderColor: chartColors.cyan,
              backgroundColor: chartColors.cyanAlpha,
              borderWidth: 2,
              pointBackgroundColor: chartColors.cyan,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: chartColors.textColor, boxWidth: 12, font: { size: 11 } },
            },
          },
          scales: {
            r: {
              angleLines: { color: chartColors.gridColor },
              grid: { color: chartColors.gridColor },
              pointLabels: { color: chartColors.textColor, font: { size: 10 } },
              ticks: { display: false },
            },
          },
        },
      });
    }
  }

  function initInsightsCharts() {
    const data = window.WatchWiseData;
    if (!data || typeof Chart === 'undefined') return;

    // Weekend vs Weekday Viewing Dynamics
    const timingCtx = document.getElementById('viewingTimingChart');
    if (timingCtx) {
      state.charts.timing = new Chart(timingCtx, {
        type: 'bar',
        data: {
          labels: ['Morning (6A-12P)', 'Afternoon (12P-5P)', 'Prime Evening (5P-11P)', 'Late Night (11P-4A)'],
          datasets: [
            {
              label: 'Weekend Share (%)',
              data: [18, 28, 74, 38],
              backgroundColor: chartColors.purple,
              borderRadius: 4,
            },
            {
              label: 'Weekday Share (%)',
              data: [12, 16, 58, 14],
              backgroundColor: chartColors.cyan,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: chartColors.textColor, boxWidth: 12 } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: chartColors.textColor } },
            y: { grid: { color: chartColors.gridColor }, ticks: { color: chartColors.textColor, callback: (v) => v + '%' } },
          },
        },
      });
    }

    // Completion Rate Histogram
    const completionCtx = document.getElementById('completionDistributionChart');
    if (completionCtx) {
      state.charts.completion = new Chart(completionCtx, {
        type: 'line',
        data: {
          labels: ['<40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'],
          datasets: [
            {
              label: 'Viewer Volume',
              data: [42, 115, 230, 390, 245, 128, 50],
              borderColor: chartColors.emerald,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: chartColors.textColor } },
            y: { grid: { color: chartColors.gridColor }, ticks: { color: chartColors.textColor } },
          },
        },
      });
    }
  }

  /**
   * Render Recommendations Catalog
   */
  function renderRecommendations(genre = 'all') {
    const data = window.WatchWiseData;
    const container = document.getElementById('recommendationsGrid');
    if (!data || !container) return;

    state.activeGenreFilter = genre;

    // Filter items
    const items = data.classifier.getRecommendations('Casual & Regular Viewers', genre);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-faint);">
          <p>No content titles found matching the selected genre criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
      <div class="movie-card" data-genre="${item.genre.toLowerCase()}">
        <div class="movie-poster-box">
          <img 
            src="${item.poster}" 
            alt="${item.title}" 
            class="movie-poster-img"
            loading="lazy"
            onerror="this.onerror=null; this.src='assets/images/dark_horizon.jpg';"
          />
          <div class="movie-poster-overlay"></div>
          <span class="poster-badge">${item.badge || item.type}</span>
          <span class="match-score-badge">${item.matchScore}% Match</span>
        </div>
        <div class="movie-card-body">
          <div class="movie-title-row">
            <h3 class="movie-title">${item.title}</h3>
            <span style="font-size: 0.75rem; color: #fbbf24; font-weight: 600;">★ ${item.rating}</span>
          </div>
          <div class="movie-meta-line">
            <span>${item.genre}</span>
            <span>·</span>
            <span>${item.duration}</span>
            <span>·</span>
            <span>${item.year}</span>
          </div>
          <div class="movie-reason-box">
            ${item.reason}
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
            ${item.summary}
          </p>
          <div class="movie-tags">
            ${(item.tags || []).map((t) => `<span class="movie-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  /**
   * Viewer Analyzer Logic
   */
  async function handleAnalyzeViewer() {
    const watchTime = parseFloat(document.getElementById('analyzerWatchTime').value) || 20;
    const avgSession = parseFloat(document.getElementById('analyzerAvgSession').value) || 45;
    const sessionCount = parseFloat(document.getElementById('analyzerSessionCount').value) || 25;
    const weekendRatio = parseFloat(document.getElementById('analyzerWeekendRatio').value) || 40;
    const completionRate = parseFloat(document.getElementById('analyzerCompletionRate').value) || 68;
    const topGenre = document.getElementById('analyzerTopGenre').value || 'Thriller';

    const payload = {
      watch_time_hours: watchTime,
      avg_session_mins: avgSession,
      session_count: sessionCount,
      weekend_ratio: weekendRatio,
      completion_rate: completionRate,
      top_genre: topGenre,
    };

    // UI state loading
    const placeholder = document.getElementById('analyzerPlaceholder');
    const loading = document.getElementById('analyzerLoading');
    const results = document.getElementById('analyzerResults');

    if (placeholder) placeholder.style.display = 'none';
    if (results) results.style.display = 'none';
    if (loading) loading.style.display = 'flex';

    let prediction;

    // Check if live API is connected
    if (state.apiMode === 'connected') {
      try {
        const res = await fetch(`${state.apiUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const apiRes = await res.json();
          prediction = {
            segment: apiRes.segment,
            confidence: Math.round(apiRes.confidence * 100),
            isBinge: apiRes.segment.includes('Binge'),
            explanation: apiRes.explanation,
          };
        }
      } catch {
        // Fall back to JS classifier
        prediction = window.WatchWiseData.classifier.predict(payload);
      }
    }

    if (!prediction) {
      // Simulate small realistic latency
      await new Promise((r) => setTimeout(r, 380));
      prediction = window.WatchWiseData.classifier.predict(payload);
    }

    // Render results
    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'block';

    const segmentNameEl = document.getElementById('verdictSegmentName');
    const confidenceValEl = document.getElementById('verdictConfidence');
    const confidenceFillEl = document.getElementById('confidenceBarFill');
    const reasonEl = document.getElementById('verdictReason');
    const recsListEl = document.getElementById('analyzerRecsList');

    if (segmentNameEl) {
      segmentNameEl.textContent = prediction.segment;
      segmentNameEl.className = 'verdict-segment-name ' + (prediction.isBinge ? 'binge-theme' : 'casual-theme');
    }

    if (confidenceValEl) confidenceValEl.textContent = prediction.confidence + '%';
    if (confidenceFillEl) confidenceFillEl.style.width = prediction.confidence + '%';
    if (reasonEl) reasonEl.textContent = prediction.explanation;

    // Render tailored recommendations for this analyzed user
    if (recsListEl) {
      const recs = window.WatchWiseData.classifier.getRecommendations(prediction.segment, topGenre).slice(0, 3);
      recsListEl.innerHTML = recs
        .map(
          (item) => `
        <div style="display: flex; gap: 0.75rem; padding: 0.65rem; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); align-items: center;">
          <img src="${item.poster}" style="width: 60px; height: 38px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/images/dark_horizon.jpg';" />
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h4 style="font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
              <span style="font-size: 0.72rem; color: #10b981; font-weight: 700;">${item.matchScore}% Match</span>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-faint);">${item.genre} · ${item.duration}</p>
          </div>
        </div>
      `
        )
        .join('');
    }

    showToast(`Inference complete: Classified as ${prediction.segment}`);
  }

  /**
   * What-If Simulator Logic
   */
  function initSimulator() {
    const sliders = {
      watchTime: document.getElementById('simWatchTime'),
      sessionMins: document.getElementById('simSessionMins'),
      sessionCount: document.getElementById('simSessionCount'),
      weekendRatio: document.getElementById('simWeekendRatio'),
      completion: document.getElementById('simCompletion'),
      genre: document.getElementById('simGenre'),
    };

    const badges = {
      watchTime: document.getElementById('simWatchTimeVal'),
      sessionMins: document.getElementById('simSessionMinsVal'),
      sessionCount: document.getElementById('simSessionCountVal'),
      weekendRatio: document.getElementById('simWeekendRatioVal'),
      completion: document.getElementById('simCompletionVal'),
    };

    // Setup live badge updates
    if (sliders.watchTime && badges.watchTime) {
      sliders.watchTime.addEventListener('input', (e) => (badges.watchTime.textContent = e.target.value + ' hrs'));
    }
    if (sliders.sessionMins && badges.sessionMins) {
      sliders.sessionMins.addEventListener('input', (e) => (badges.sessionMins.textContent = e.target.value + ' mins'));
    }
    if (sliders.sessionCount && badges.sessionCount) {
      sliders.sessionCount.addEventListener('input', (e) => (badges.sessionCount.textContent = e.target.value));
    }
    if (sliders.weekendRatio && badges.weekendRatio) {
      sliders.weekendRatio.addEventListener('input', (e) => (badges.weekendRatio.textContent = e.target.value + '%'));
    }
    if (sliders.completion && badges.completion) {
      sliders.completion.addEventListener('input', (e) => (badges.completion.textContent = e.target.value + '%'));
    }

    // Run Simulation button
    const runBtn = document.getElementById('runSimulationBtn');
    if (runBtn) {
      runBtn.addEventListener('click', runSimulation);
    }

    // Initialize Simulator Visual Radar
    const simChartCtx = document.getElementById('simulatorRadarChart');
    if (simChartCtx && typeof Chart !== 'undefined') {
      state.charts.simulator = new Chart(simChartCtx, {
        type: 'radar',
        data: {
          labels: ['Watch Time (hrs)', 'Avg Session (m)', 'Weekend (%)', 'Completion (%)', 'Sessions'],
          datasets: [
            {
              label: 'Baseline (Casual)',
              data: [18.5, 40, 35, 65, 22],
              borderColor: '#64748b',
              backgroundColor: 'rgba(100, 116, 139, 0.15)',
              borderWidth: 1.5,
              pointRadius: 2,
            },
            {
              label: 'Simulated Scenario',
              data: [45.0, 95, 75, 88, 38],
              borderColor: chartColors.cyan,
              backgroundColor: chartColors.cyanAlpha,
              borderWidth: 2,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: chartColors.textColor, boxWidth: 12 } },
          },
          scales: {
            r: {
              angleLines: { color: chartColors.gridColor },
              grid: { color: chartColors.gridColor },
              pointLabels: { color: chartColors.textColor, font: { size: 10 } },
              ticks: { display: false },
            },
          },
        },
      });
    }
  }

  function runSimulation() {
    const watchTime = parseFloat(document.getElementById('simWatchTime').value) || 20;
    const avgSession = parseFloat(document.getElementById('simSessionMins').value) || 45;
    const sessionCount = parseFloat(document.getElementById('simSessionCount').value) || 25;
    const weekendRatio = parseFloat(document.getElementById('simWeekendRatio').value) || 40;
    const completionRate = parseFloat(document.getElementById('simCompletion').value) || 68;
    const topGenre = document.getElementById('simGenre').value || 'Thriller';

    const simulatedFeatures = {
      watch_time_hours: watchTime,
      avg_session_mins: avgSession,
      session_count: sessionCount,
      weekend_ratio: weekendRatio,
      completion_rate: completionRate,
      top_genre: topGenre,
    };

    const currentResult = window.WatchWiseData.classifier.predict(state.simulationBaseline);
    const simulatedResult = window.WatchWiseData.classifier.predict(simulatedFeatures);

    // Update UI Badges
    const currentBadge = document.getElementById('simCurrentSegmentBadge');
    const predBadge = document.getElementById('simPredictedSegmentBadge');
    const simConfidence = document.getElementById('simConfidence');
    const simReasonText = document.getElementById('simReasonText');

    if (currentBadge) {
      currentBadge.textContent = currentResult.segment;
      currentBadge.className = 'shift-badge ' + (currentResult.isBinge ? 'binge' : 'casual');
    }

    if (predBadge) {
      predBadge.textContent = simulatedResult.segment;
      predBadge.className = 'shift-badge ' + (simulatedResult.isBinge ? 'binge' : 'casual');
    }

    if (simConfidence) {
      simConfidence.textContent = simulatedResult.confidence + '%';
    }

    // Dynamic Change Explanation
    if (simReasonText) {
      let explanation = '';
      if (currentResult.segment !== simulatedResult.segment) {
        if (simulatedResult.isBinge) {
          explanation =
            'Increasing watch time (' +
            watchTime +
            ' hrs) and completion rate (' +
            completionRate +
            '%) pushed viewer behavior toward binge-oriented patterns. Weekend viewing (' +
            weekendRatio +
            '%) crossed the threshold for serialized engagement.';
        } else {
          explanation =
            'Lowering average session duration (' +
            avgSession +
            ' mins) and distributing viewing across weekdays reverted the viewer back to the Casual & Regular cohort.';
        }
      } else {
        explanation =
          'Viewer remains within the ' +
          simulatedResult.segment +
          ' cohort with ' +
          simulatedResult.confidence +
          '% confidence. While individual parameters adjusted, aggregate engagement remains characteristic of this segment.';
      }
      simReasonText.textContent = explanation;
    }

    // Update Simulator Chart
    if (state.charts.simulator) {
      state.charts.simulator.data.datasets[1].data = [
        watchTime,
        avgSession,
        weekendRatio,
        completionRate,
        sessionCount,
      ];
      state.charts.simulator.update();
    }

    showToast('Simulation evaluated successfully');
  }

  /**
   * Search filter in top header
   */
  function setupSearch() {
    if (!elements.headerSearchInput) return;
    elements.headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = elements.headerSearchInput.value.trim().toLowerCase();
        if (!query) return;

        // Check if query matches a viewer ID
        if (query.startsWith('vw-')) {
          const match = window.WatchWiseData.viewers.find((v) => v.viewer_id.toLowerCase() === query);
          if (match) {
            switchView('analyzer');
            document.getElementById('analyzerWatchTime').value = match.watch_time_hours;
            document.getElementById('analyzerAvgSession').value = match.avg_session_mins;
            document.getElementById('analyzerSessionCount').value = match.session_count;
            document.getElementById('analyzerWeekendRatio').value = match.weekend_ratio;
            document.getElementById('analyzerCompletionRate').value = match.completion_rate;
            document.getElementById('analyzerTopGenre').value = match.top_genre;
            handleAnalyzeViewer();
            showToast(`Loaded profile for ${match.viewer_id}`);
            return;
          }
        }

        // Check if query matches a movie genre or title
        switchView('recommendations');
        const matchedTab = Array.from(document.querySelectorAll('.filter-tab-btn')).find(
          (btn) => btn.dataset.genre.toLowerCase() === query
        );
        if (matchedTab) {
          matchedTab.click();
        } else {
          showToast(`Filtered recommendations for "${query}"`);
        }
      }
    });
  }

  /**
   * Setup Preset buttons in Analyzer
   */
  function setupAnalyzerPresets() {
    const casualBtn = document.getElementById('presetCasual');
    const bingeBtn = document.getElementById('presetBinge');
    const borderlineBtn = document.getElementById('presetBorderline');

    if (casualBtn) {
      casualBtn.addEventListener('click', () => {
        document.getElementById('analyzerWatchTime').value = 14.5;
        document.getElementById('analyzerAvgSession').value = 35;
        document.getElementById('analyzerSessionCount').value = 18;
        document.getElementById('analyzerWeekendRatio').value = 32;
        document.getElementById('analyzerCompletionRate').value = 62;
        document.getElementById('analyzerTopGenre').value = 'Drama';
        handleAnalyzeViewer();
      });
    }

    if (bingeBtn) {
      bingeBtn.addEventListener('click', () => {
        document.getElementById('analyzerWatchTime').value = 54.0;
        document.getElementById('analyzerAvgSession').value = 98;
        document.getElementById('analyzerSessionCount').value = 46;
        document.getElementById('analyzerWeekendRatio').value = 78;
        document.getElementById('analyzerCompletionRate').value = 91;
        document.getElementById('analyzerTopGenre').value = 'Thriller';
        handleAnalyzeViewer();
      });
    }

    if (borderlineBtn) {
      borderlineBtn.addEventListener('click', () => {
        document.getElementById('analyzerWatchTime').value = 28.5;
        document.getElementById('analyzerAvgSession').value = 60;
        document.getElementById('analyzerSessionCount').value = 25;
        document.getElementById('analyzerWeekendRatio').value = 52;
        document.getElementById('analyzerCompletionRate').value = 74;
        document.getElementById('analyzerTopGenre').value = 'Sci-Fi';
        handleAnalyzeViewer();
      });
    }

    const analyzeBtn = document.getElementById('analyzeViewerBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', handleAnalyzeViewer);
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Navigation item clicks
    elements.navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        window.location.hash = view;
        switchView(view);
      });
    });

    // Mobile menu toggle
    if (elements.mobileMenuBtn && elements.sidebar) {
      elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.toggle('mobile-open');
      });
    }

    // Recommendation genre filter tabs
    document.querySelectorAll('.filter-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderRecommendations(btn.dataset.genre);
      });
    });

    // Settings Modal
    if (elements.openSettingsBtn && elements.settingsModal) {
      elements.openSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
      });
    }

    if (elements.closeSettingsBtn && elements.settingsModal) {
      elements.closeSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
      });
    }

    if (elements.saveSettingsBtn && elements.settingsModal) {
      elements.saveSettingsBtn.addEventListener('click', () => {
        if (elements.apiUrlInput) state.apiUrl = elements.apiUrlInput.value.trim();
        state.demoModeForce = elements.demoModeToggle ? !elements.demoModeToggle.checked : false;
        checkBackendHealth();
        elements.settingsModal.classList.remove('active');
        showToast('Configuration settings updated');
      });
    }

    // Close modal on outside click
    if (elements.settingsModal) {
      elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
          elements.settingsModal.classList.remove('active');
        }
      });
    }

    // Hash change handler for browser back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && VIEW_TITLES[hash]) switchView(hash);
    });
  }

  /**
   * Initial App Bootstrapping
   */
  function init() {
    // Check initial hash route
    const hash = window.location.hash.replace('#', '');
    if (hash && VIEW_TITLES[hash]) {
      switchView(hash);
    } else {
      switchView('overview');
    }

    setupEventListeners();
    setupAnalyzerPresets();
    initSimulator();
    setupSearch();

    // Render Recommendations
    renderRecommendations('all');

    // Initialize all Charts
    initOverviewCharts();
    initSegmentCharts();
    initInsightsCharts();

    // Check backend status silently
    checkBackendHealth();

    // Background interval to periodically check API health without errors
    setInterval(checkBackendHealth, 25000);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
