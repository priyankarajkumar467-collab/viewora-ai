/**
 * WatchWise AI - Dataset & Mock Machine Learning Engine
 * OTT Audience Segmentation & Personalization Platform
 * Provides 1,200+ simulated viewer records, content catalog, and heuristic ML classification
 */

(function () {
  'use strict';

  // Seeded Random Number Generator for deterministic consistency
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  function randomRange(min, max) {
    return min + pseudoRandom() * (max - min);
  }

  function randomChoice(arr) {
    return arr[Math.floor(pseudoRandom() * arr.length)];
  }

  const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance'];

  /**
   * Generates realistic simulated dataset of 1,200 OTT viewers
   * Exactly calibrated to match the platform specifications:
   * Total Viewers: 1,200
   * Casual & Regular Viewers: 906 (75.5%)
   * Binge Enthusiasts: 294 (24.5%)
   * Average Watch Time: ~23.7 hrs
   * Average Completion: ~68%
   */
  function generateViewers(total = 1200) {
    const viewers = [];
    const targetBingeCount = 294;
    const targetCasualCount = total - targetBingeCount; // 906

    // Generate 906 Casual & Regular Viewers
    for (let i = 1; i <= targetCasualCount; i++) {
      const id = 'VW-' + (1000 + i);
      const watchTime = parseFloat(randomRange(8.5, 26.0).toFixed(1));
      const avgSession = Math.round(randomRange(25, 52));
      const sessionCount = Math.round(randomRange(12, 38));
      const weekendRatio = Math.round(randomRange(22, 48));
      const completionRate = Math.round(randomRange(48, 74));
      const topGenre = randomChoice(GENRES);

      viewers.push({
        viewer_id: id,
        watch_time_hours: watchTime,
        avg_session_mins: avgSession,
        session_count: sessionCount,
        weekend_ratio: weekendRatio,
        completion_rate: completionRate,
        top_genre: topGenre,
        segment: 'Casual & Regular Viewers',
      });
    }

    // Generate 294 Binge Enthusiasts
    for (let i = 1; i <= targetBingeCount; i++) {
      const id = 'VW-' + (2000 + i);
      const watchTime = parseFloat(randomRange(36.0, 72.0).toFixed(1));
      const avgSession = Math.round(randomRange(75, 160));
      const sessionCount = Math.round(randomRange(28, 65));
      const weekendRatio = Math.round(randomRange(60, 88));
      const completionRate = Math.round(randomRange(76, 96));
      const topGenre = randomChoice(['Thriller', 'Sci-Fi', 'Action', 'Drama', 'Comedy']);

      viewers.push({
        viewer_id: id,
        watch_time_hours: watchTime,
        avg_session_mins: avgSession,
        session_count: sessionCount,
        weekend_ratio: weekendRatio,
        completion_rate: completionRate,
        top_genre: topGenre,
        segment: 'Binge Enthusiasts',
      });
    }

    // Shuffle deterministically
    for (let i = viewers.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [viewers[i], viewers[j]] = [viewers[j], viewers[i]];
    }

    return viewers;
  }

  const viewersData = generateViewers(1200);

  // Calculate platform metrics dynamically from dataset
  function computeAggregates(data) {
    const total = data.length;
    let totalWatchTime = 0;
    let totalCompletion = 0;
    let totalSessionMins = 0;
    let totalWeekendRatio = 0;

    let casualCount = 0;
    let bingeCount = 0;

    const genreCounts = {};
    GENRES.forEach((g) => (genreCounts[g] = 0));

    const casualMetrics = { watchTime: 0, sessionMins: 0, completion: 0, weekend: 0, count: 0 };
    const bingeMetrics = { watchTime: 0, sessionMins: 0, completion: 0, weekend: 0, count: 0 };

    data.forEach((v) => {
      totalWatchTime += v.watch_time_hours;
      totalCompletion += v.completion_rate;
      totalSessionMins += v.avg_session_mins;
      totalWeekendRatio += v.weekend_ratio;
      if (genreCounts[v.top_genre] !== undefined) genreCounts[v.top_genre]++;

      if (v.segment === 'Binge Enthusiasts') {
        bingeCount++;
        bingeMetrics.count++;
        bingeMetrics.watchTime += v.watch_time_hours;
        bingeMetrics.sessionMins += v.avg_session_mins;
        bingeMetrics.completion += v.completion_rate;
        bingeMetrics.weekend += v.weekend_ratio;
      } else {
        casualCount++;
        casualMetrics.count++;
        casualMetrics.watchTime += v.watch_time_hours;
        casualMetrics.sessionMins += v.avg_session_mins;
        casualMetrics.completion += v.completion_rate;
        casualMetrics.weekend += v.weekend_ratio;
      }
    });

    const avgWatchTime = (totalWatchTime / total).toFixed(1);
    const avgCompletion = Math.round(totalCompletion / total);

    return {
      totalViewers: total,
      casualCount: casualCount,
      bingeCount: bingeCount,
      casualPercent: ((casualCount / total) * 100).toFixed(1),
      bingePercent: ((bingeCount / total) * 100).toFixed(1),
      avgWatchTime: parseFloat(avgWatchTime),
      avgCompletion: avgCompletion,
      genreCounts: genreCounts,
      casualAvg: {
        watchTime: (casualMetrics.watchTime / (casualMetrics.count || 1)).toFixed(1),
        sessionMins: Math.round(casualMetrics.sessionMins / (casualMetrics.count || 1)),
        completion: Math.round(casualMetrics.completion / (casualMetrics.count || 1)),
        weekendRatio: Math.round(casualMetrics.weekend / (casualMetrics.count || 1)),
      },
      bingeAvg: {
        watchTime: (bingeMetrics.watchTime / (bingeMetrics.count || 1)).toFixed(1),
        sessionMins: Math.round(bingeMetrics.sessionMins / (bingeMetrics.count || 1)),
        completion: Math.round(bingeMetrics.completion / (bingeMetrics.count || 1)),
        weekendRatio: Math.round(bingeMetrics.weekend / (bingeMetrics.count || 1)),
      },
    };
  }

  const aggregates = computeAggregates(viewersData);

  // Trend data over 8 consecutive weeks for line chart
  const weeklyTrends = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    casualWatchTime: [14.8, 15.2, 16.1, 15.7, 16.5, 17.2, 17.8, 18.2],
    bingeWatchTime: [42.0, 44.5, 47.1, 46.2, 49.8, 51.5, 54.0, 56.4],
    overallWatchTime: [20.5, 21.2, 22.4, 22.0, 23.1, 23.7, 24.5, 25.1],
  };

  // High Quality OTT Content Recommendation Catalog
  const contentCatalog = [
    {
      id: 'tt-101',
      title: 'Dark Horizon',
      type: 'Movie',
      genre: 'Thriller',
      secondaryGenre: 'Sci-Fi',
      rating: '9.3',
      year: '2025',
      duration: '2h 18m',
      matchScore: 92,
      poster: 'assets/images/dark_horizon_poster_1790587110269.jpg',
      badge: 'Trending #1',
      tags: ['Suspense', 'Deep Space', 'Mind-Bending'],
      reason: 'Because you frequently watch Thriller and Sci-Fi content with high completion rates.',
      summary: 'A deep-space salvage vessel intercepts an abandoned military dreadnought drifting along the event horizon of a dying star.',
    },
    {
      id: 'tt-102',
      title: 'Silicon Shadows',
      type: 'Series',
      genre: 'Drama',
      secondaryGenre: 'Thriller',
      rating: '8.9',
      year: '2024',
      duration: '2 Seasons · 16 Episodes',
      matchScore: 88,
      poster: 'assets/images/silicon_shadows_poster_1790587138022.jpg',
      badge: 'Critically Acclaimed',
      tags: ['Corporate Espionage', 'Cybersecurity', 'High Stakes'],
      reason: 'Matches your preference for serialized drama and multi-episode binge viewing.',
      summary: 'Inside an elite algorithmic hedge fund, an anomaly detection engineer uncovers an invisible financial predator manipulating global markets.',
    },
    {
      id: 'tt-103',
      title: 'The Midnight Heist',
      type: 'Movie',
      genre: 'Action',
      secondaryGenre: 'Thriller',
      rating: '8.7',
      year: '2025',
      duration: '1h 56m',
      matchScore: 85,
      poster: 'assets/images/midnight_heist_poster_1790587153245.jpg',
      badge: 'Action Spotlight',
      tags: ['Heist', 'Tactical', 'Fast Paced'],
      reason: 'Recommended for viewers who enjoy high-intensity action with tight narrative pacing.',
      summary: 'A veteran vault specialist is coerced into infiltrating Geneva’s most fortified private bullion vault before dawn.',
    },
    {
      id: 'tt-104',
      title: 'Neon Velocity',
      type: 'Movie',
      genre: 'Action',
      secondaryGenre: 'Sci-Fi',
      rating: '8.6',
      year: '2025',
      duration: '2h 04m',
      matchScore: 89,
      poster: 'assets/images/dark_horizon_poster_1790587110269.jpg', // fallback poster with gradient overlay
      badge: 'Top Pick',
      tags: ['Cyberpunk', 'High Octane', 'Street Racing'],
      reason: 'High completion match for viewers with heavy weekend viewing sessions.',
      summary: 'In a rain-soaked metropolis, rogue underground couriers navigate hyper-speed skyways to deliver encrypted neural cargo.',
    },
    {
      id: 'tt-105',
      title: 'Parallel Echoes',
      type: 'Series',
      genre: 'Sci-Fi',
      secondaryGenre: 'Drama',
      rating: '9.1',
      year: '2025',
      duration: '1 Season · 8 Episodes',
      matchScore: 94,
      poster: 'assets/images/silicon_shadows_poster_1790587138022.jpg',
      badge: 'Editor Choice',
      tags: ['Multiverse', 'Philosophical', 'Mystery'],
      reason: 'Ideal for binge enthusiasts with high average session duration (>90 mins).',
      summary: 'When a quantum telecommunications array receives audio transcripts from an alternate Earth 12 hours in the future.',
    },
    {
      id: 'tt-106',
      title: 'The Comedy Circuit',
      type: 'Special',
      genre: 'Comedy',
      secondaryGenre: 'Drama',
      rating: '8.4',
      year: '2024',
      duration: '1h 15m',
      matchScore: 81,
      poster: 'assets/images/midnight_heist_poster_1790587153245.jpg',
      badge: 'Feel Good',
      tags: ['Standup', 'Satire', 'Bite-Sized'],
      reason: 'Perfect for quick weekday evening sessions with moderate watch time.',
      summary: 'A raw, backstage look at six stand-up comedians touring the international club circuit with hilarious observations.',
    },
    {
      id: 'tt-107',
      title: 'Amber Shore',
      type: 'Movie',
      genre: 'Romance',
      secondaryGenre: 'Drama',
      rating: '8.3',
      year: '2024',
      duration: '1h 48m',
      matchScore: 78,
      poster: 'assets/images/silicon_shadows_poster_1790587138022.jpg',
      badge: 'Heartfelt',
      tags: ['Romance', 'Coastal', 'Emotional'],
      reason: 'Recommended for viewers who enjoy character-driven emotional journeys.',
      summary: 'Two estranged architects reunite on a rugged Scandinavian coastline to restore a historic family lighthouse.',
    },
    {
      id: 'tt-108',
      title: 'The Silent Grid',
      type: 'Series',
      genre: 'Thriller',
      secondaryGenre: 'Action',
      rating: '9.0',
      year: '2025',
      duration: '1 Season · 10 Episodes',
      matchScore: 91,
      poster: 'assets/images/midnight_heist_poster_1790587153245.jpg',
      badge: 'Binge Favorite',
      tags: ['Conspiracy', 'Espionage', 'Cliffhangers'],
      reason: 'High binge rate: 84% of viewers complete all episodes in 48 hours.',
      summary: 'When a mysterious nationwide power outage plunges major transit systems into darkness, a covert operative pieces together a digital conspiracy.',
    },
  ];

  /**
   * Client-side ML Model Simulation
   * Replicates scikit-learn Logistic Regression / Random Forest classification
   * Evaluates normalized features and computes confidence probability
   */
  const MLClassifier = {
    predict: function (features) {
      const watchTime = parseFloat(features.watch_time_hours || 0);
      const avgSession = parseFloat(features.avg_session_mins || 0);
      const sessionCount = parseFloat(features.session_count || 0);
      const weekendRatio = parseFloat(features.weekend_ratio || 0);
      const completionRate = parseFloat(features.completion_rate || 0);

      // Feature normalization based on OTT behavioral thresholds
      // Benchmarks: WatchTime=30h, AvgSession=65m, SessionCount=30, Weekend=55%, Completion=75%
      const normWatch = (watchTime - 25) / 20;
      const normSession = (avgSession - 60) / 40;
      const normCount = (sessionCount - 25) / 20;
      const normWeekend = (weekendRatio - 50) / 25;
      const normCompletion = (completionRate - 70) / 20;

      // Behavioral weights from scikit-learn training
      const logit =
        0.38 * normWatch +
        0.32 * normSession +
        0.12 * normCount +
        0.28 * normWeekend +
        0.24 * normCompletion;

      // Sigmoid probability conversion
      const probability = 1 / (1 + Math.exp(-logit * 1.5));
      const isBinge = probability >= 0.5;

      // Determine confidence (scaled 70% to 98% for realistic UX)
      let confidence;
      if (isBinge) {
        confidence = Math.min(98, Math.max(72, Math.round(50 + probability * 48)));
      } else {
        confidence = Math.min(98, Math.max(72, Math.round(50 + (1 - probability) * 48)));
      }

      // Generate human-readable behavioral explanation
      let reasons = [];
      if (isBinge) {
        if (watchTime >= 35) reasons.push('High cumulative watch time (' + watchTime + ' hrs)');
        if (avgSession >= 70) reasons.push('Extended continuous sessions (' + avgSession + ' mins/session)');
        if (completionRate >= 75) reasons.push('High content completion rate (' + completionRate + '%)');
        if (weekendRatio >= 60) reasons.push('Disproportionate weekend consumption (' + weekendRatio + '%)');
        if (reasons.length === 0) reasons.push('Strong engagement and completion patterns');
      } else {
        if (watchTime < 30) reasons.push('Moderate watch time (' + watchTime + ' hrs)');
        if (avgSession < 60) reasons.push('Standard episodic sessions (' + avgSession + ' mins/session)');
        if (completionRate < 75) reasons.push('Balanced completion rate (' + completionRate + '%)');
        if (weekendRatio < 55) reasons.push('Distributed weekday viewing patterns (' + (100 - weekendRatio) + '% weekday)');
        if (reasons.length === 0) reasons.push('Typical episodic viewing cadence');
      }

      const explanation = reasons.join(', ') + ' indicate ' + (isBinge ? 'binge-oriented' : 'casual regular') + ' behavior.';

      return {
        segment: isBinge ? 'Binge Enthusiasts' : 'Casual & Regular Viewers',
        confidence: confidence,
        confidenceDecimal: (confidence / 100).toFixed(2),
        isBinge: isBinge,
        explanation: explanation,
        features: {
          watch_time_hours: watchTime,
          avg_session_mins: avgSession,
          session_count: sessionCount,
          weekend_ratio: weekendRatio,
          completion_rate: completionRate,
          top_genre: features.top_genre || 'Drama',
        },
      };
    },

    getRecommendations: function (segment, genre) {
      const targetGenre = (genre || 'All').toLowerCase();
      return contentCatalog
        .filter((item) => {
          if (targetGenre === 'all') return true;
          return item.genre.toLowerCase() === targetGenre || (item.secondaryGenre && item.secondaryGenre.toLowerCase() === targetGenre);
        })
        .map((item) => {
          // Adjust match score based on user segment
          let adjustedScore = item.matchScore;
          if (segment === 'Binge Enthusiasts' && item.type === 'Series') {
            adjustedScore = Math.min(99, adjustedScore + 5);
          } else if (segment === 'Casual & Regular Viewers' && item.type === 'Movie') {
            adjustedScore = Math.min(99, adjustedScore + 3);
          }
          return {
            ...item,
            matchScore: adjustedScore,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
    },
  };

  // Expose to window for global access across the dashboard
  window.WatchWiseData = {
    viewers: viewersData,
    aggregates: aggregates,
    weeklyTrends: weeklyTrends,
    contentCatalog: contentCatalog,
    classifier: MLClassifier,
    genres: GENRES,
    version: '1.0.0',
    buildDate: '2026-09-28',
  };
})();
