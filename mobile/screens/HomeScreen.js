// CIRO — HomeScreen
// Text input + Analyze Crisis button + Demo button

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { API_URL } from '../App';

const SAMPLE_INPUTS = [
  "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain",
  "Cars stuck on I-8 after heavy rain, road completely blocked",
  "G-9 par bada haadsa hua hai, ambulance chahiye foran",
  "F-7 mein bijli gul hai, imaarat ko khatrah hai",
  "Extreme heat in E-11, 46 degrees, people collapsing",
];

export default function HomeScreen({ navigation }) {
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // ── Run full pipeline (ingest → analyze) ────────────────────────────────
  const handleAnalyze = async () => {
    if (!text.trim()) {
      Alert.alert('Input Required', 'Please enter a crisis report.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: ingest
      const ingestRes = await fetch(`${API_URL}/api/ingest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: text.trim() }),
      });
      if (!ingestRes.ok) throw new Error(`Ingest failed: ${ingestRes.status}`);
      const ingestData = await ingestRes.json();

      // Step 2: analyze
      const analyzeRes = await fetch(`${API_URL}/api/analyze`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: ingestData.session_id }),
      });
      if (!analyzeRes.ok) throw new Error(`Analyze failed: ${analyzeRes.status}`);
      const analyzeData = await analyzeRes.json();

      // Merge traces
      const result = {
        ...analyzeData,
        agent_traces: [
          ...ingestData.agent_traces,
          ...analyzeData.agent_traces,
        ],
      };

      navigation.navigate('Result', { result });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to connect to CIRO backend.');
    } finally {
      setLoading(false);
    }
  };

  // ── Demo endpoint ────────────────────────────────────────────────────────
  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/demo`);
      if (!res.ok) throw new Error(`Demo failed: ${res.status}`);
      const result = await res.json();
      navigation.navigate('Result', { result });
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not reach CIRO demo endpoint.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🚨</Text>
          <Text style={styles.headerTitle}>CIRO</Text>
          <Text style={styles.headerSub}>Crisis Intelligence & Response Orchestrator</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>5-Agent AI Pipeline</Text>
          </View>
        </View>

        {/* Input card */}
        <View style={styles.card}>
          <Text style={styles.label}>Crisis Report</Text>
          <Text style={styles.labelSub}>English · Roman Urdu · Hinglish</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="e.g. G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"
            placeholderTextColor="#4a5568"
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          {/* Sample inputs */}
          <Text style={styles.samplesLabel}>Quick samples:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesRow}>
            {SAMPLE_INPUTS.map((sample, i) => (
              <TouchableOpacity key={i} style={styles.sampleChip} onPress={() => setText(sample)}>
                <Text style={styles.sampleText} numberOfLines={2}>{sample}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleAnalyze}
          disabled={loading || demoLoading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>🔍 Analyze Crisis</Text>
          )}
        </TouchableOpacity>
        {loading && (
          <Text style={styles.loadingHint}>Running 5-agent pipeline… (~10-20s)</Text>
        )}

        {/* Demo button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnDemo, demoLoading && styles.btnDisabled]}
          onPress={handleDemo}
          disabled={loading || demoLoading}
          activeOpacity={0.8}
        >
          {demoLoading ? (
            <ActivityIndicator color="#f59e0b" size="small" />
          ) : (
            <Text style={[styles.btnText, { color: '#f59e0b' }]}>⚡ Run G-10 Demo</Text>
          )}
        </TouchableOpacity>

        {/* Agent pipeline info */}
        <View style={styles.pipelineCard}>
          <Text style={styles.pipelineTitle}>Agent Pipeline</Text>
          {[
            ['1', 'SignalNormalizerAgent', 'Parses Roman Urdu / English'],
            ['2', 'CrisisDetectorAgent',  'Classifies crisis type'],
            ['3', 'SituationAnalystAgent','Assesses severity'],
            ['4', 'ActionPlannerAgent',   'Generates response plan'],
            ['5', 'SimulationAgent',      'Simulates outcomes'],
          ].map(([num, name, desc]) => (
            <View key={num} style={styles.agentRow}>
              <View style={styles.agentBadge}><Text style={styles.agentNum}>{num}</Text></View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{name}</Text>
                <Text style={styles.agentDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f1117' },
  scroll:       { padding: 20, paddingBottom: 40 },

  // Header
  header:       { alignItems: 'center', marginBottom: 28, paddingTop: 10 },
  headerIcon:   { fontSize: 48, marginBottom: 8 },
  headerTitle:  { fontSize: 36, fontWeight: '900', color: '#f1f5f9', letterSpacing: 4 },
  headerSub:    { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
  badge:        { marginTop: 10, backgroundColor: '#1e3a5f', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#3b82f6' },
  badgeText:    { color: '#60a5fa', fontSize: 12, fontWeight: '600' },

  // Card
  card:         { backgroundColor: '#161b2e', borderRadius: 16, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: '#1e293b' },
  label:        { color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  labelSub:     { color: '#64748b', fontSize: 12, marginBottom: 12 },
  input:        { backgroundColor: '#0f1117', color: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, minHeight: 100, borderWidth: 1, borderColor: '#1e293b', lineHeight: 22 },

  // Sample chips
  samplesLabel: { color: '#64748b', fontSize: 12, marginTop: 14, marginBottom: 8 },
  samplesRow:   { flexDirection: 'row' },
  sampleChip:   { backgroundColor: '#1a2744', borderRadius: 10, padding: 10, marginRight: 10, maxWidth: 200, borderWidth: 1, borderColor: '#2d4270' },
  sampleText:   { color: '#93c5fd', fontSize: 12, lineHeight: 18 },

  // Buttons
  btn:          { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnPrimary:   { backgroundColor: '#2563eb' },
  btnDemo:      { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#f59e0b' },
  btnDisabled:  { opacity: 0.5 },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  loadingHint:  { color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 10, marginTop: -4 },

  // Pipeline card
  pipelineCard:  { backgroundColor: '#161b2e', borderRadius: 16, padding: 18, marginTop: 8, borderWidth: 1, borderColor: '#1e293b' },
  pipelineTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  agentRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  agentBadge:    { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#3b82f6' },
  agentNum:      { color: '#60a5fa', fontWeight: '800', fontSize: 13 },
  agentInfo:     { flex: 1 },
  agentName:     { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  agentDesc:     { color: '#64748b', fontSize: 12, marginTop: 1 },
});
