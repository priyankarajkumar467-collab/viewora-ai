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
    downloadReportBtn: document.getElementById('downloadReportBtn'),
    csvFileInput: document.getElementById('csvFileInput'),
    triggerCsvUploadBtn: document.getElementById('triggerCsvUploadBtn'),
    resetDefaultDataBtn: document.getElementById('resetDefaultDataBtn'),
    csvValidationStatus: document.getElementById('csvValidationStatus'),
    modalAudienceCount: document.getElementById('modalAudienceCount'),
    sidebarViewerCount: document.getElementById('sidebarViewerCount'),
    kpiTotalViewers: document.getElementById('kpiTotalViewers'),
    kpiAvgWatchTime: document.getElementById('kpiAvgWatchTime'),
    kpiAvgCompletion: document.getElementById('kpiAvgCompletion'),
    donutCasualCount: document.getElementById('donutCasualCount'),
    donutCasualPct: document.getElementById('donutCasualPct'),
    donutBingeCount: document.getElementById('donutBingeCount'),
    donutBingePct: document.getElementById('donutBingePct'),
    segCasualPct: document.getElementById('segCasualPct'),
    segCasualCount: document.getElementById('segCasualCount'),
    segCasualWatch: document.getElementById('segCasualWatch'),
    segCasualSession: document.getElementById('segCasualSession'),
    segCasualComp: document.getElementById('segCasualComp'),
    segCasualWeekend: document.getElementById('segCasualWeekend'),
    segBingePct: document.getElementById('segBingePct'),
    segBingeCount: document.getElementById('segBingeCount'),
    segBingeWatch: document.getElementById('segBingeWatch'),
    segBingeSession: document.getElementById('segBingeSession'),
    segBingeComp: document.getElementById('segBingeComp'),
    segBingeWeekend: document.getElementById('segBingeWeekend'),
    predictiveAlertCard: document.getElementById('predictiveAlertCard'),
    predictivePulseIcon: document.getElementById('predictivePulseIcon'),
    predictiveStatusBadge: document.getElementById('predictiveStatusBadge'),
    predictiveStatusText: document.getElementById('predictiveStatusText'),
    runPredictiveAuditBtn: document.getElementById('runPredictiveAuditBtn'),
    alertProjectedRetention: document.getElementById('alertProjectedRetention'),
    alertRetentionDelta: document.getElementById('alertRetentionDelta'),
    alertChurnRiskLevel: document.getElementById('alertChurnRiskLevel'),
    alertRiskSeverity: document.getElementById('alertRiskSeverity'),
    alertAtRiskCount: document.getElementById('alertAtRiskCount'),
    alertAtRiskPct: document.getElementById('alertAtRiskPct'),
    presetRetentionStable: document.getElementById('presetRetentionStable'),
    presetRetentionFatigue: document.getElementById('presetRetentionFatigue'),
    presetRetentionSpike: document.getElementById('presetRetentionSpike'),
    alertCompletionDrop: document.getElementById('alertCompletionDrop'),
    alertCompletionDropVal: document.getElementById('alertCompletionDropVal'),
    alertSessionFatigue: document.getElementById('alertSessionFatigue'),
    alertSessionFatigueVal: document.getElementById('alertSessionFatigueVal'),
    alertWeekendDecay: document.getElementById('alertWeekendDecay'),
    alertWeekendDecayVal: document.getElementById('alertWeekendDecayVal'),
    alertCohortSelect: document.getElementById('alertCohortSelect'),
    predictiveBannerBox: document.getElementById('predictiveBannerBox'),
    predictiveBannerIcon: document.getElementById('predictiveBannerIcon'),
    predictiveBannerTitle: document.getElementById('predictiveBannerTitle'),
    predictiveBannerDesc: document.getElementById('predictiveBannerDesc'),
    predictiveMitigationBox: document.getElementById('predictiveMitigationBox'),
    predictiveMitigationText: document.getElementById('predictiveMitigationText'),
  };

  /**
   * Toast notification helper with alert/warning/success styling support
   */
  function showToast(message, type = 'info', duration = 3500) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'warning' || type === 'alert' || type === 'critical') {
      const strokeColor = type === 'warning' ? '#f59e0b' : '#f43f5e';
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
    } else if (type === 'success') {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span style="flex:1;">${message}</span>
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
   * Predictive Alert System: Retention Risk Simulation Engine
   * Evaluates cohort behavioral decay metrics and triggers UI toast notifications
   * when the model detects a potential drop in retention.
   */
  let alertDebounceTimer = null;

  function evaluatePredictiveRetention(userTriggered = false) {
    if (!elements.alertCompletionDrop || !elements.alertProjectedRetention) return;

    const completionDrop = parseFloat(elements.alertCompletionDrop.value) || 0;
    const sessionFatigue = parseFloat(elements.alertSessionFatigue.value) || 0;
    const weekendDecay = parseFloat(elements.alertWeekendDecay.value) || 0;
    const cohortChoice = elements.alertCohortSelect ? elements.alertCohortSelect.value : 'all';

    const data = window.WatchWiseData;
    const totalViewers = data && data.viewers ? data.viewers.length : 1200;
    const casualCount = data && data.aggregates ? data.aggregates.casualCount : 906;
    const bingeCount = data && data.aggregates ? data.aggregates.bingeCount : 294;

    let cohortSize = totalViewers;
    let baselineRetention = 91.8;
    let cohortLabel = 'All Audiences';

    if (cohortChoice === 'casual') {
      cohortSize = casualCount;
      baselineRetention = 88.4;
      cohortLabel = 'Casual & Regular Viewers';
    } else if (cohortChoice === 'binge') {
      cohortSize = bingeCount;
      baselineRetention = 96.2;
      cohortLabel = 'Binge Enthusiasts';
    }

    // Mathematical decay model:
    // Completion drop has highest sensitivity (0.52), followed by continuous session fatigue (0.30)
    // and weekend habit erosion (0.22).
    const drag = (completionDrop / 100) * 0.52 + (sessionFatigue / 60) * 0.30 + (weekendDecay / 100) * 0.22;
    const totalDrop = +(drag * 100).toFixed(1);
    const projectedRetention = Math.max(35.0, Math.min(99.0, +(baselineRetention - totalDrop).toFixed(1)));
    const retentionDelta = +(baselineRetention - projectedRetention).toFixed(1);

    const atRiskCount = Math.round((retentionDelta / 100) * cohortSize);
    const atRiskPct = ((atRiskCount / cohortSize) * 100).toFixed(1);

    // Update UI Metric Readouts
    elements.alertProjectedRetention.textContent = `${projectedRetention}%`;
    elements.alertRetentionDelta.textContent = `Baseline: ~${baselineRetention}% (-${retentionDelta}%)`;
    elements.alertAtRiskCount.textContent = `${atRiskCount.toLocaleString()} Viewers`;
    elements.alertAtRiskPct.textContent = `~${atRiskPct}% of ${cohortLabel}`;

    const isCritical = projectedRetention < 74.0 || retentionDelta >= 20.0;
    const isWarning = !isCritical && (projectedRetention < 80.0 || retentionDelta >= 8.5);
    const isAlertState = isCritical || isWarning;

    // Update Badge & Status
    if (elements.predictiveAlertCard) {
      if (isAlertState) {
        elements.predictiveAlertCard.classList.add('alert-active');
      } else {
        elements.predictiveAlertCard.classList.remove('alert-active');
      }
    }

    if (elements.predictiveStatusBadge && elements.predictiveStatusText) {
      if (isCritical) {
        elements.predictiveStatusBadge.className = 'predictive-alert-badge critical';
        elements.predictiveStatusText.textContent = 'CRITICAL RETENTION DROP';
        elements.alertProjectedRetention.style.color = '#f87171';
        elements.alertChurnRiskLevel.textContent = 'Critical';
        elements.alertChurnRiskLevel.style.color = '#f87171';
        elements.alertRiskSeverity.textContent = 'Severe churn trajectory';
      } else if (isWarning) {
        elements.predictiveStatusBadge.className = 'predictive-alert-badge warning';
        elements.predictiveStatusText.textContent = 'RETENTION ALERT';
        elements.alertProjectedRetention.style.color = '#fbbf24';
        elements.alertChurnRiskLevel.textContent = 'Elevated';
        elements.alertChurnRiskLevel.style.color = '#fbbf24';
        elements.alertRiskSeverity.textContent = 'Decay threshold breached';
      } else {
        elements.predictiveStatusBadge.className = 'predictive-alert-badge nominal';
        elements.predictiveStatusText.textContent = 'RETENTION NOMINAL';
        elements.alertProjectedRetention.style.color = '#34d399';
        elements.alertChurnRiskLevel.textContent = 'Low';
        elements.alertChurnRiskLevel.style.color = '#34d399';
        elements.alertRiskSeverity.textContent = 'Standard seasonal flux';
      }
    }

    // Update Banner Content
    if (elements.predictiveBannerBox) {
      if (isAlertState) {
        elements.predictiveBannerBox.classList.add('alert-active');
      } else {
        elements.predictiveBannerBox.classList.remove('alert-active');
      }
    }

    if (
      elements.predictiveBannerTitle &&
      elements.predictiveBannerDesc &&
      elements.predictiveMitigationText &&
      elements.predictiveBannerIcon
    ) {
      if (isCritical) {
        elements.predictiveBannerTitle.textContent = `Critical Retention Drop Detected (${cohortLabel})`;
        elements.predictiveBannerDesc.textContent = `Simulation model projects an acute ${retentionDelta}% drop in cohort retention (${projectedRetention}% projected). Significant audience volume (${atRiskCount.toLocaleString()} accounts) is trending toward churn and platform dormancy.`;
        elements.predictiveMitigationText.textContent = `Deploy immediate re-engagement sequence: Dispatch targeted episode finale previews, personalized watchlist reminders, and priority streaming recommendations to the ${atRiskCount.toLocaleString()} at-risk accounts within 24 hours.`;
        elements.predictiveBannerIcon.innerHTML = `
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        `;
        elements.predictiveBannerIcon.setAttribute('stroke', '#f43f5e');
      } else if (isWarning) {
        elements.predictiveBannerTitle.textContent = `Elevated Churn Risk Alert (${cohortLabel})`;
        elements.predictiveBannerDesc.textContent = `Projected retention dipped below the 80% threshold to ${projectedRetention}% (-${retentionDelta}% drop). Viewing cadence slowdown and session fatigue indicate growing churn propensity.`;
        elements.predictiveMitigationText.textContent = `Automate personalized 48-hour push notifications featuring 45-minute episodic dramas and high-match thrillers to reverse session abandonment before week's end.`;
        elements.predictiveBannerIcon.innerHTML = `
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        `;
        elements.predictiveBannerIcon.setAttribute('stroke', '#f59e0b');
      } else {
        elements.predictiveBannerTitle.textContent = `Retention Model Stable (${cohortLabel})`;
        elements.predictiveBannerDesc.textContent = `Simulation parameters indicate healthy cohort stability. Viewing cadence and completion rates exceed the 80% platform retention threshold.`;
        elements.predictiveMitigationText.textContent = `Continue standard episodic release schedule. Viewer churn risk is well within nominal parameters.`;
        elements.predictiveBannerIcon.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
        elements.predictiveBannerIcon.setAttribute('stroke', '#10b981');
      }
    }

    // Trigger Toast Notification
    if (isAlertState) {
      const alertType = isCritical ? 'critical' : 'warning';
      const toastMsg = `⚠️ Predictive Alert: Potential ${retentionDelta}% drop in cohort retention detected! ${atRiskCount.toLocaleString()} ${cohortLabel} at churn risk.`;
      showToast(toastMsg, alertType, 5000);
    } else if (userTriggered) {
      showToast(`✓ Predictive Retention Audit: Cohort retention is nominal at ${projectedRetention}% for ${cohortLabel}.`, 'success', 3500);
    }
  }

  function initPredictiveAlertSystem() {
    if (!elements.alertCompletionDrop) return;

    const updateSliderBadges = () => {
      if (elements.alertCompletionDropVal) elements.alertCompletionDropVal.textContent = `-${elements.alertCompletionDrop.value}%`;
      if (elements.alertSessionFatigueVal) elements.alertSessionFatigueVal.textContent = `-${elements.alertSessionFatigue.value} mins`;
      if (elements.alertWeekendDecayVal) elements.alertWeekendDecayVal.textContent = `-${elements.alertWeekendDecay.value}%`;
    };

    const handleSliderInput = () => {
      updateSliderBadges();
      clearTimeout(alertDebounceTimer);
      alertDebounceTimer = setTimeout(() => {
        evaluatePredictiveRetention(false);
      }, 350);
    };

    elements.alertCompletionDrop.addEventListener('input', handleSliderInput);
    elements.alertSessionFatigue.addEventListener('input', handleSliderInput);
    elements.alertWeekendDecay.addEventListener('input', handleSliderInput);

    if (elements.alertCohortSelect) {
      elements.alertCohortSelect.addEventListener('change', () => evaluatePredictiveRetention(true));
    }

    if (elements.runPredictiveAuditBtn) {
      elements.runPredictiveAuditBtn.addEventListener('click', () => evaluatePredictiveRetention(true));
    }

    // Preset Scenario Handlers
    if (elements.presetRetentionStable) {
      elements.presetRetentionStable.addEventListener('click', () => {
        elements.alertCompletionDrop.value = 0;
        elements.alertSessionFatigue.value = 0;
        elements.alertWeekendDecay.value = 0;
        updateSliderBadges();
        evaluatePredictiveRetention(true);
      });
    }

    if (elements.presetRetentionFatigue) {
      elements.presetRetentionFatigue.addEventListener('click', () => {
        elements.alertCompletionDrop.value = 20;
        elements.alertSessionFatigue.value = 24;
        elements.alertWeekendDecay.value = 16;
        updateSliderBadges();
        evaluatePredictiveRetention(true);
      });
    }

    if (elements.presetRetentionSpike) {
      elements.presetRetentionSpike.addEventListener('click', () => {
        elements.alertCompletionDrop.value = 36;
        elements.alertSessionFatigue.value = 44;
        elements.alertWeekendDecay.value = 30;
        updateSliderBadges();
        evaluatePredictiveRetention(true);
      });
    }

    // Initial evaluation without toast
    updateSliderBadges();
    evaluatePredictiveRetention(false);
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
   * Export demo dataset as a CSV file using Blob
   */
  function exportDatasetCSV() {
    const data = window.WatchWiseData;
    if (!data || !data.viewers || !data.viewers.length) {
      showToast('No viewer dataset available to export');
      return;
    }

    const headers = [
      'Viewer ID',
      'Watch Time (Hours)',
      'Avg Session (Minutes)',
      'Session Count',
      'Weekend Ratio (%)',
      'Completion Rate (%)',
      'Top Genre',
      'Audience Segment',
    ];

    const rows = data.viewers.map((v) => [
      v.viewer_id,
      v.watch_time_hours,
      v.avg_session_mins,
      v.session_count,
      v.weekend_ratio,
      v.completion_rate,
      `"${v.top_genre}"`,
      `"${v.segment}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');

    // Create a CSV Blob object
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `WatchWise_Audience_Report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Report downloaded: ${data.viewers.length.toLocaleString()} viewer records exported as CSV`);
  }

  /**
   * Helper to parse a single line of CSV text respecting quotes
   */
  function parseCSVLine(line) {
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    values.push(cur.trim());
    return values;
  }

  /**
   * Validates custom CSV columns and parses viewer records
   */
  function validateAndParseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      return { valid: false, error: 'CSV file is empty or missing data rows.' };
    }

    const headers = parseCSVLine(lines[0]);
    if (!headers || headers.length === 0) {
      return { valid: false, error: 'Could not parse CSV header row.' };
    }

    // Helper to normalize strings for comparison
    const norm = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const headerMap = {};
    headers.forEach((h, idx) => {
      headerMap[norm(h)] = idx;
    });

    function findColIndex(candidates) {
      for (const c of candidates) {
        const n = norm(c);
        if (headerMap[n] !== undefined) return headerMap[n];
        for (const h in headerMap) {
          if (h.includes(n)) return headerMap[h];
        }
      }
      return -1;
    }

    const idxWatchTime = findColIndex(['watch_time_hours', 'watchtimehours', 'watchtime']);
    const idxAvgSession = findColIndex(['avg_session_mins', 'avgsessionminutes', 'avgsession', 'sessionduration']);
    const idxSessionCount = findColIndex(['session_count', 'sessioncount', 'sessions']);
    const idxWeekendRatio = findColIndex(['weekend_ratio', 'weekendratio', 'weekendpercent', 'weekend']);
    const idxCompletionRate = findColIndex(['completion_rate', 'completionrate', 'completionpercent', 'completion']);
    const idxViewerId = findColIndex(['viewer_id', 'viewerid', 'id']);
    const idxTopGenre = findColIndex(['top_genre', 'topgenre', 'genre']);
    const idxSegment = findColIndex(['audiencesegment', 'segment']);

    // Check presence of the 5 expected viewer behavioral metrics
    const missing = [];
    if (idxWatchTime === -1) missing.push('watch_time_hours');
    if (idxAvgSession === -1) missing.push('avg_session_mins');
    if (idxSessionCount === -1) missing.push('session_count');
    if (idxWeekendRatio === -1) missing.push('weekend_ratio');
    if (idxCompletionRate === -1) missing.push('completion_rate');

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required behavioral metric column(s): ${missing.join(', ')}. Expected: watch_time_hours, avg_session_mins, session_count, weekend_ratio, completion_rate.`,
      };
    }

    const parsedViewers = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 5) continue;

      const watchTime = parseFloat(cols[idxWatchTime]);
      const avgSession = parseFloat(cols[idxAvgSession]);
      const sessionCount = parseFloat(cols[idxSessionCount]);
      const weekendRatio = parseFloat(cols[idxWeekendRatio]);
      const completionRate = parseFloat(cols[idxCompletionRate]);

      if (isNaN(watchTime) || isNaN(avgSession) || isNaN(sessionCount) || isNaN(weekendRatio) || isNaN(completionRate)) {
        return {
          valid: false,
          error: `Row ${i} contains non-numeric data for behavioral metrics.`,
        };
      }

      const viewerId = idxViewerId !== -1 && cols[idxViewerId] ? cols[idxViewerId].replace(/['"]/g, '') : `VW-${1000 + i}`;
      const rawGenre = idxTopGenre !== -1 && cols[idxTopGenre] ? cols[idxTopGenre].replace(/['"]/g, '') : 'Thriller';
      const topGenre = window.WatchWiseData.genres.includes(rawGenre) ? rawGenre : 'Drama';

      let rawSegment = idxSegment !== -1 && cols[idxSegment] ? cols[idxSegment].replace(/['"]/g, '') : null;
      let segment = rawSegment;
      if (!segment || (segment !== 'Binge Enthusiasts' && segment !== 'Casual & Regular Viewers')) {
        const pred = window.WatchWiseData.classifier.predict({
          watch_time_hours: watchTime,
          avg_session_mins: avgSession,
          session_count: sessionCount,
          weekend_ratio: weekendRatio,
          completion_rate: completionRate,
          top_genre: topGenre,
        });
        segment = pred.segment;
      }

      parsedViewers.push({
        viewer_id: viewerId,
        watch_time_hours: watchTime,
        avg_session_mins: avgSession,
        session_count: sessionCount,
        weekend_ratio: weekendRatio,
        completion_rate: completionRate,
        top_genre: topGenre,
        segment: segment,
      });
    }

    if (parsedViewers.length === 0) {
      return { valid: false, error: 'CSV file contains no valid data rows.' };
    }

    return { valid: true, viewers: parsedViewers };
  }

  /**
   * Refreshes all KPI cards, counters, and Chart.js instances across the dashboard
   */
  function refreshDashboardMetrics() {
    const data = window.WatchWiseData;
    if (!data || !data.computeAggregates) return;

    const newAggregates = data.computeAggregates(data.viewers);
    data.aggregates = newAggregates;

    // Overview KPI Numbers
    if (elements.kpiTotalViewers) elements.kpiTotalViewers.textContent = newAggregates.totalViewers.toLocaleString();
    if (elements.kpiAvgWatchTime) elements.kpiAvgWatchTime.textContent = newAggregates.avgWatchTime + ' hrs';
    if (elements.kpiAvgCompletion) elements.kpiAvgCompletion.textContent = newAggregates.avgCompletion + '%';

    // Overview Donut Legend
    if (elements.donutCasualCount) elements.donutCasualCount.textContent = newAggregates.casualCount.toLocaleString() + ' viewers';
    if (elements.donutCasualPct) elements.donutCasualPct.textContent = newAggregates.casualPercent + '%';
    if (elements.donutBingeCount) elements.donutBingeCount.textContent = newAggregates.bingeCount.toLocaleString() + ' viewers';
    if (elements.donutBingePct) elements.donutBingePct.textContent = newAggregates.bingePercent + '%';

    // Sidebar & Settings Modal Counters
    if (elements.sidebarViewerCount) elements.sidebarViewerCount.textContent = newAggregates.totalViewers.toLocaleString() + ' Viewers';
    if (elements.modalAudienceCount) elements.modalAudienceCount.textContent = newAggregates.totalViewers.toLocaleString() + ' Viewers';

    // Audience Segments Profile Cards
    if (elements.segCasualPct) elements.segCasualPct.textContent = newAggregates.casualPercent + '%';
    if (elements.segCasualCount) elements.segCasualCount.textContent = newAggregates.casualCount.toLocaleString() + ' Viewers';
    if (elements.segCasualWatch) elements.segCasualWatch.textContent = newAggregates.casualAvg.watchTime + ' hrs';
    if (elements.segCasualSession) elements.segCasualSession.textContent = newAggregates.casualAvg.sessionMins + ' mins';
    if (elements.segCasualComp) elements.segCasualComp.textContent = newAggregates.casualAvg.completion + '%';
    if (elements.segCasualWeekend) elements.segCasualWeekend.textContent = newAggregates.casualAvg.weekendRatio + '%';

    if (elements.segBingePct) elements.segBingePct.textContent = newAggregates.bingePercent + '%';
    if (elements.segBingeCount) elements.segBingeCount.textContent = newAggregates.bingeCount.toLocaleString() + ' Viewers';
    if (elements.segBingeWatch) elements.segBingeWatch.textContent = newAggregates.bingeAvg.watchTime + ' hrs';
    if (elements.segBingeSession) elements.segBingeSession.textContent = newAggregates.bingeAvg.sessionMins + ' mins';
    if (elements.segBingeComp) elements.segBingeComp.textContent = newAggregates.bingeAvg.completion + '%';
    if (elements.segBingeWeekend) elements.segBingeWeekend.textContent = newAggregates.bingeAvg.weekendRatio + '%';

    // Update Donut Chart
    if (state.charts.donut) {
      state.charts.donut.data.datasets[0].data = [newAggregates.casualCount, newAggregates.bingeCount];
      state.charts.donut.update();
    }

    // Update Genre Bar Chart
    if (state.charts.genre) {
      state.charts.genre.data.datasets[0].data = data.genres.map((g) => newAggregates.genreCounts[g] || 0);
      state.charts.genre.update();
    }

    // Update Segment Radar Chart
    if (state.charts.radar) {
      state.charts.radar.data.datasets[0].data = [
        newAggregates.bingeAvg.watchTime,
        newAggregates.bingeAvg.sessionMins,
        newAggregates.bingeAvg.completion,
        newAggregates.bingeAvg.weekendRatio,
        42,
      ];
      state.charts.radar.data.datasets[1].data = [
        newAggregates.casualAvg.watchTime,
        newAggregates.casualAvg.sessionMins,
        newAggregates.casualAvg.completion,
        newAggregates.casualAvg.weekendRatio,
        24,
      ];
      state.charts.radar.update();
    }

    // Refresh predictive retention metrics with new dataset sizes
    evaluatePredictiveRetention(false);
  }

  /**
   * Handles custom CSV file upload and validation
   */
  function handleCsvUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      if (elements.csvValidationStatus) {
        elements.csvValidationStatus.className = 'csv-validation-box error';
        elements.csvValidationStatus.textContent = 'Invalid file format: Please select a valid .csv file.';
      }
      showToast('Upload rejected: File must be in CSV format');
      elements.csvFileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const text = event.target.result;
        const result = validateAndParseCSV(text);

        if (!result.valid) {
          if (elements.csvValidationStatus) {
            elements.csvValidationStatus.className = 'csv-validation-box error';
            elements.csvValidationStatus.innerHTML = `⚠️ <strong>Validation Failed:</strong> ${result.error}`;
          }
          showToast(`CSV Validation Error: ${result.error}`);
          return;
        }

        // Successfully validated: Replace active dataset
        window.WatchWiseData.viewers = result.viewers;
        refreshDashboardMetrics();

        if (elements.csvValidationStatus) {
          elements.csvValidationStatus.className = 'csv-validation-box success';
          elements.csvValidationStatus.innerHTML = `✓ <strong>Validated:</strong> Successfully imported ${result.viewers.length.toLocaleString()} custom viewer records from <em>${file.name}</em>.`;
        }

        showToast(`Custom dataset loaded: ${result.viewers.length.toLocaleString()} viewers active`);
      } catch (err) {
        console.error('CSV parse error:', err);
        if (elements.csvValidationStatus) {
          elements.csvValidationStatus.className = 'csv-validation-box error';
          elements.csvValidationStatus.textContent = 'Failed to parse CSV file: ' + err.message;
        }
        showToast('Error parsing custom CSV file');
      } finally {
        elements.csvFileInput.value = '';
      }
    };

    reader.onerror = function () {
      if (elements.csvValidationStatus) {
        elements.csvValidationStatus.className = 'csv-validation-box error';
        elements.csvValidationStatus.textContent = 'Failed to read uploaded file.';
      }
      showToast('Error reading uploaded CSV file');
      elements.csvFileInput.value = '';
    };

    reader.readAsText(file);
  }

  /**
   * Resets active dataset back to the default 1,200 simulated viewers
   */
  function handleResetDefaultData() {
    if (typeof window.WatchWiseData.generateViewers === 'function') {
      window.WatchWiseData.viewers = window.WatchWiseData.generateViewers(1200);
      refreshDashboardMetrics();

      if (elements.csvValidationStatus) {
        elements.csvValidationStatus.className = 'csv-validation-box';
        elements.csvValidationStatus.innerHTML = `Expected columns: <code style="color: var(--accent-cyan);">watch_time_hours, avg_session_mins, session_count, weekend_ratio, completion_rate</code>`;
      }

      showToast('Dataset reset to default 1,200 simulated viewers');
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Download Report CSV button
    if (elements.downloadReportBtn) {
      elements.downloadReportBtn.addEventListener('click', exportDatasetCSV);
    }

    // Custom CSV file input and trigger upload buttons
    if (elements.triggerCsvUploadBtn && elements.csvFileInput) {
      elements.triggerCsvUploadBtn.addEventListener('click', () => {
        elements.csvFileInput.click();
      });
    }

    if (elements.csvFileInput) {
      elements.csvFileInput.addEventListener('change', handleCsvUpload);
    }

    if (elements.resetDefaultDataBtn) {
      elements.resetDefaultDataBtn.addEventListener('click', handleResetDefaultData);
    }
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

    // Initialize Predictive Retention Alert System
    initPredictiveAlertSystem();

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
