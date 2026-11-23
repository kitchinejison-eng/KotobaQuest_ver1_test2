/*
 * Kotoba Quest: optional on-device adaptive AI (integrated Ver.2.5.4)
 * Copyright (c) 2026. A general-purpose example supplied to the project.
 * No external servers, no model download, no clinical or pronunciation rating.
 * Uses online logistic regression (stochastic gradient descent) and a COM-like
 * question-selection policy. Enabled by default for new profiles; users may switch off. Does not alter existing mastery.
 */
(function (root) {
  'use strict';
  if (root.KotobaAIJudge) return;
  const STORE_PREFIX = 'kotobaquest_ai_judge_v252_';
  const SOURCES = new Set(['choice', 'matching', 'button', 'typed', 'objective']);
  // Analysis begins after 3 eligible answers; recommendations and question reordering
  // remain conservative and require 12 answers. Stages indicate quantity, not accuracy.
  const MIN_OBSERVATIONS = 12;
  const ANALYSIS_THRESHOLDS = [3, 6, 12, 24, 40];
  function analysisStage(count) {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    let idx = 0;
    while (idx < ANALYSIS_THRESHOLDS.length && n >= ANALYSIS_THRESHOLDS[idx]) idx++;
    const labels = ['準備中', '初期参考値', '暫定参考値', '参考値', '継続参考値', '継続学習中'];
    return {index:idx, label:labels[idx], observations:n, ready:n>=ANALYSIS_THRESHOLDS[0],
      nextTarget:idx < ANALYSIS_THRESHOLDS.length ? ANALYSIS_THRESHOLDS[idx] : null,
      remaining:idx < ANALYSIS_THRESHOLDS.length ? ANALYSIS_THRESHOLDS[idx]-n : 0,
      minimum:ANALYSIS_THRESHOLDS[0]};
  }
  const INITIAL_WEIGHTS = [-0.08, -0.38, 0.85, 0.12];
  const LR = 0.075;
  const L2 = 0.0003;
  const cap = (n, lo, hi) => Math.min(hi, Math.max(lo, Number(n) || 0));
  const sigmoid = z => 1 / (1 + Math.exp(-cap(z, -15, 15)));
  const cleanId = x => String(x || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'unknown';
  const clone = x => JSON.parse(JSON.stringify(x));
  const storage = (() => {try {return root.localStorage || null;} catch (_) {return null;}})();
  let volatileByProfile = Object.create(null);
  function currentProfile() {
    try {
      const api = root.KotobaQuestUserProfile;
      const profile = api && api.getCurrent && api.getCurrent();
      if (profile && profile.profileId) return cleanId(profile.profileId);
    } catch (_) {}
    return 'guest';
  }
  function storageKey(profileId) {return STORE_PREFIX + cleanId(profileId || currentProfile());}
  function blank() {return {version: 1, enabled: true, models: {}};}
  function read(profileId) {
    const key = storageKey(profileId);
    try {
      if (storage) {
        const saved = JSON.parse(storage.getItem(key) || 'null');
        if (saved && saved.version === 1 && saved.models && typeof saved.models === 'object') {
          // Older profiles without a setting are treated as ON, but an explicit OFF stays OFF.
          if (typeof saved.enabled !== 'boolean') saved.enabled = true;
          return saved;
        }
      }
    } catch (_) {}
    return volatileByProfile[key] ? clone(volatileByProfile[key]) : blank();
  }
  function save(profileId, value) {
    const key = storageKey(profileId);
    volatileByProfile[key] = clone(value);
    try {if (storage) storage.setItem(key, JSON.stringify(value));} catch (_) {}
  }
  function modelFor(state, activityId) {
    const key = cleanId(activityId);
    let m = state.models[key];
    if (!m || !Array.isArray(m.weights) || m.weights.length !== 4) {
      m = {weights: INITIAL_WEIGHTS.slice(), count: 0, correct: 0, recent: [], seenAttempts: []};
      state.models[key] = m;
    }
    if (!Array.isArray(m.recent)) m.recent = [];
    if (!Array.isArray(m.seenAttempts)) m.seenAttempts = [];
    return m;
  }
  function features(m, question) {
    const level = cap(question.difficultyLevel || question.level || 1, 1, 10);
    // Recent rate describes past performance only, never the current answer.
    const rate = m.recent.length ? m.recent.reduce((a,b) => a+b, 0) / m.recent.length : 0.5;
    const observations = Math.min(100, m.count);
    return [1, (level - 5) / 5, (rate - 0.5) * 2, Math.log1p(observations) / Math.log(101)];
  }
  function predictRaw(m, question) {
    const x = features(m, question);
    let z = 0;
    for (let i = 0; i < x.length; i++) z += cap(m.weights[i], -4, 4) * x[i];
    return sigmoid(z);
  }
  function setEnabled(enabled, profileId) {
    const state = read(profileId);
    state.enabled = !!enabled;
    save(profileId, state);
    return state.enabled;
  }
  function isEnabled(profileId) {return read(profileId).enabled !== false;}
  function observe(input) {
    const data = input || {};
    const id = cleanId(data.activityId);
    const pid = data.profileId || currentProfile();
    const state = read(pid);
    if (state.enabled === false) return {accepted:false, reason:'AI学習がOFFです'};
    if (!id || id === 'unknown') return {accepted:false, reason:'課題IDがありません'};
    // Pronunciation/acoustic quality and handwriting motor skill are NOT inferred.
    if (!SOURCES.has(String(data.source || '')) || typeof data.correct !== 'boolean' ||
        data.skipped === true || data.selfReported === true || data.hintOnly === true) {
      return {accepted:false, reason:'客観的な採点データ以外は学習しません'};
    }
    const m = modelFor(state, id);
    const attemptId = data.attemptId ? String(data.attemptId).slice(0, 100) : '';
    if (attemptId && m.seenAttempts.includes(attemptId)) return {accepted:false, reason:'重複回答'};
    const question = {difficultyLevel: cap(data.difficultyLevel || data.level || 1,1,10)};
    const x = features(m, question);
    const before = predictRaw(m, question);
    const error = (data.correct ? 1 : 0) - before;
    m.weights = m.weights.map((w, i) => cap(w + LR * (error * x[i] - L2 * w), -4, 4));
    m.count++; if (data.correct) m.correct++;
    m.recent.push(data.correct ? 1 : 0);
    if (m.recent.length > 20) m.recent.shift();
    if (attemptId) {
      m.seenAttempts.push(attemptId);
      if (m.seenAttempts.length > 100) m.seenAttempts.shift();
    }
    save(pid, state);
    return {accepted:true, before:Math.round(before * 100), observations:m.count};
  }
  function predict(input) {
    const q = input || {};
    const state = read(q.profileId);
    const key = cleanId(q.activityId);
    const existing = state.models[key];
    const m = existing && Array.isArray(existing.weights) ? existing : modelFor(blank(), key);
    const stage = analysisStage(m.count || 0);
    return {probability:Math.round(predictRaw(m, q)*100),
      observations:m.count || 0,
      certainty:stage.ready ? stage.label : 'データ不足',
      stage:stage,
      meaning:'次の客観式問題の正答確率の参考値。データが少ないほど不確実で、言語能力・発音の診断ではありません'};
  }
  function recommend(input) {
    const opts = input || {};
    const state = read(opts.profileId);
    const current = Math.round(cap(opts.currentLevel || 1,1,10));
    const maxLevel = Math.round(cap(opts.maxLevel || 10,1,10));
    const unlocked = Math.round(cap(opts.unlockedLevel || current,1,maxLevel));
    const m = state.models[cleanId(opts.activityId)];
    const base = {currentLevel:current, recommendedLevel:current, action:'維持', reason:'十分なデータがありません', willApply:false};
    if (!state.enabled) return {...base, reason:'AI学習OFF'};
    if (!m || m.count < MIN_OBSERVATIONS || m.recent.length < 8) return base;
    const rate = m.recent.slice(-8).reduce((a,b)=>a+b,0)/8;
    const next = Math.min(current+1, unlocked, maxLevel);
    const pUp = predictRaw(m,{level:next});
    const pNow = predictRaw(m,{level:current});
    if (rate >= 0.875 && pUp >= 0.70 && next > current)
      return {...base, recommendedLevel:next, action:'上げる', reason:'直近8問が安定しており、次の解放済みLvを提案', confidence:Math.round(pUp*100)};
    if (rate <= 0.375 && pNow < 0.53 && current > 1)
      return {...base, recommendedLevel:current-1, action:'下げる', reason:'直近8問で苦戦しているため、負担を下げる提案',confidence:Math.round(pNow*100)};
    return {...base, reason:'現在の難易度を続けることを提案',confidence:Math.round(pNow*100)};
  }
  function chooseQuestion(bank, input) {
    // COM-like decision policy: choose a question with estimated chance near 70%,
    // not clinical AI and NOT an answer/grading mechanism.
    if (!Array.isArray(bank) || !bank.length) return null;
    const opts = input || {};
    const state = read(opts.profileId);
    if (!state.enabled) return bank[0];
    const m = state.models[cleanId(opts.activityId)];
    if (!m || m.count < MIN_OBSERVATIONS) return bank[0];
    const currentLv = cap(opts.currentLevel || 1,1,10);
    const unlocked = cap(opts.unlockedLevel || currentLv,1,10);
    const eligible = bank.filter(q => cap(q.difficultyLevel || q.level || 1,1,10) <= unlocked);
    if (!eligible.length) return null;
    // Preserve question order as a tie-breaker for repeatable tests.
    let best = eligible[0], bestScore = Infinity;
    for (const q of eligible) {
      const score = Math.abs(predictRaw(m,q) - 0.70)
        + Math.abs(cap(q.difficultyLevel || q.level || 1,1,10) - currentLv) * 0.035;
      if (score < bestScore) {best = q;bestScore = score;}
    }
    return best;
  }
  function reset(activityId, profileId) {
    const state = read(profileId);
    if (activityId) delete state.models[cleanId(activityId)];
    else state.models = {};
    save(profileId, state);
  }
  root.KotobaAIJudge = {setEnabled, isEnabled, observe, predict, recommend, chooseQuestion, analysisStage,
    reset, version:'0.2.4-progressive', modelType:'on-device online logistic regression'};
})(typeof window !== 'undefined' ? window : globalThis);
