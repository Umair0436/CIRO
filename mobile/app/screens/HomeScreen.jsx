import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../Context';
import { ingestCrisis, runDemo, fetchLogs } from '../api/client';

const formatTime = (tsString) => {
  try {
    const d = new Date(tsString);
    if (isNaN(d.getTime())) return '00:00';
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  } catch (e) {
    return '00:00';
  }
};

const getLogMessage = (entry) => {
  if (entry.custom_message) return entry.custom_message;
  const stage = entry.pipeline_stage ? entry.pipeline_stage.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';
  const type = entry.crisis_type ? entry.crisis_type.toUpperCase() : 'CRISIS';
  const area = entry.affected_area || 'unknown location';
  
  if (entry.pipeline_stage === 'ingest_complete') {
    return `Ingested and normalized ${type} signal from ${area}.`;
  } else if (entry.pipeline_stage === 'analyze_complete') {
    return `Completed analysis and orchestrated action plan for ${type} in ${area}.`;
  } else if (entry.pipeline_stage === 'full_pipeline_complete') {
    return `Full pipeline orchestration succeeded for ${type} in ${area}.`;
  }
  return `${stage}: ${type} response active in ${area}.`;
};

export default function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { setSessionData, setAnalysisData } = useContext(AppContext);
  const [logs, setLogs] = useState([]);
  const logsCache = useRef([]);
  const loadingTimer = useRef(null);

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Analyzing crisis signals...');
      let elapsed = 0;
      loadingTimer.current = setInterval(() => {
        elapsed += 1;
        if (elapsed < 5) {
          setLoadingMessage('Analyzing crisis signals...');
        } else if (elapsed < 15) {
          setLoadingMessage('Running AI agents...');
        } else if (elapsed < 30) {
          setLoadingMessage('Generating response plan...');
        } else {
          setLoadingMessage('Finalizing simulation...');
        }
      }, 1000);
    } else {
      if (loadingTimer.current) {
        clearInterval(loadingTimer.current);
        loadingTimer.current = null;
      }
      setLoadingMessage('');
    }

    return () => {
      if (loadingTimer.current) {
        clearInterval(loadingTimer.current);
      }
    };
  }, [loading]);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      try {
        const response = await fetchLogs();
        if (response && Array.isArray(response.entries)) {
          const freshLogs = response.entries.slice(0, 5);
          if (isMounted) {
            setLogs(freshLogs);
            logsCache.current = freshLogs;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live logs, using cached/default logs:", err);
        if (isMounted) {
          if (logsCache.current.length === 0) {
            const defaults = [
              { timestamp: new Date(Date.now() - 120000).toISOString(), custom_message: 'Traffic signal failure reported in Sector F-7.' },
              { timestamp: new Date(Date.now() - 240000).toISOString(), custom_message: 'Ambulance dispatch confirmed for G-9/1 medical emergency.' },
              { timestamp: new Date(Date.now() - 360000).toISOString(), custom_message: 'System diagnostic complete. All sensors operational.' },
            ];
            setLogs(defaults);
            logsCache.current = defaults;
          } else {
            setLogs(logsCache.current);
          }
        }
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a crisis report');
      return;
    }
    setLoading(true);
    try {
      const data = await ingestCrisis(text);
      setSessionData(data);
      setAnalysisData(null); // Clear previous
      navigation.navigate('Trace');
    } catch (err) {
      Alert.alert('API Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const data = await runDemo();
      setSessionData({
        session_id: data.session_id,
        agent_traces: data.agent_traces,
        timestamp: data.timestamp,
        elapsed_ms: data.total_elapsed_ms
      });
      setAnalysisData(data);
      navigation.navigate('Trace', { isDemo: true });
    } catch (err) {
      Alert.alert('API Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ CIRO</Text>
          <Text style={styles.profile}>👤</Text>
        </View>

        <Text style={styles.sectionTitle}>OPERATIONAL OVERVIEW</Text>
        <Text style={styles.pageTitle}>Command Center</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>🟢 SYSTEMS GREEN</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>GLOBAL THREAT</Text>
          <Text style={[styles.cardValue, { color: '#22C55E' }]}>NORMAL</Text>
          <Text style={styles.cardSub}>Status: Stable</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACTIVE RESPONDERS</Text>
          <Text style={styles.cardValue}>1,248</Text>
          <Text style={styles.cardSub}>Across 14 Districts</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SYSTEM LATENCY</Text>
          <Text style={styles.cardValue}>14ms</Text>
          <Text style={styles.cardSub}>Uptime: 99.99%</Text>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>📢 Submit Crisis Report</Text>
          <TextInput
            style={styles.input}
            placeholder="Report crisis in English or Roman Urdu..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.analyzeButtonText}>📊 ANALYZE CRISIS</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDemo} disabled={loading}>
            <Text style={styles.demoLink}>OR RUN DEMO — G-10 FLOOD SCENARIO →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.cardLabel}>REAL-TIME FEED</Text>
          {logs.map((log, index) => (
            <View key={index} style={styles.feedItem}>
              <Text style={styles.feedTime}>{formatTime(log.timestamp)}</Text>
              <Text style={styles.feedText}>{getLogMessage(log)}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => Alert.alert('Live Activity', 'Submit crisis reports or run a demo to populate new live logs.')}>
            <Text style={styles.demoLink}>LIVE SCANNING ACTIVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.overlayContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F59E0B" style={{ marginBottom: 16 }} />
            <Text style={styles.overlayTitle}>CIRO PIPELINE ACTIVE</Text>
            <Text style={styles.overlayText}>{loadingMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  logo: { color: '#F59E0B', fontSize: 20, fontWeight: 'bold' },
  profile: { fontSize: 20 },
  sectionTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  pageTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statusBadge: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16 },
  statusBadgeText: { color: '#22C55E', fontWeight: 'bold' },
  card: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  cardLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  cardValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  cardSub: { color: '#9CA3AF', fontSize: 12 },
  actionSection: { backgroundColor: '#141414', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B', marginTop: 16, marginBottom: 24 },
  actionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', height: 100, borderRadius: 8, padding: 12, textAlignVertical: 'top', marginBottom: 12 },
  analyzeButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  analyzeButtonText: { color: '#FFF', fontWeight: 'bold' },
  demoLink: { color: '#F59E0B', textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  feedSection: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 32 },
  feedItem: { flexDirection: 'row', marginBottom: 12, borderLeftWidth: 2, borderLeftColor: '#F59E0B', paddingLeft: 12 },
  feedTime: { color: '#F59E0B', width: 45, fontSize: 12 },
  feedText: { color: '#FFF', flex: 1, fontSize: 12 },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: '#141414',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    width: '80%',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  overlayTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  overlayText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
