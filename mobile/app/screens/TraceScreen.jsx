import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../Context';
import { analyzeCrisis } from '../api/client';

const AGENT_COLORS = {
  SignalNormalizerAgent: '#3B82F6',
  CrisisDetectorAgent: '#F97316',
  SituationAnalystAgent: '#A855F7',
  ActionPlannerAgent: '#22C55E',
  SimulationAgent: '#EF4444'
};

export default function TraceScreen({ navigation, route }) {
  const { sessionData, setAnalysisData } = useContext(AppContext);
  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('');
  const isDemo = route.params?.isDemo;
  const loadingTimer = React.useRef(null);

  React.useEffect(() => {
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

  if (!sessionData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No session data available.</Text>
      </SafeAreaView>
    );
  }

  const handleContinue = async () => {
    if (isDemo) {
      navigation.navigate('Analysis', { screen: 'Result' });
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeCrisis(sessionData.session_id);
      setAnalysisData(data);
      navigation.navigate('Analysis', { screen: 'Result' });
    } catch (err) {
      Alert.alert('API Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const traces = sessionData.agent_traces || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ CIRO</Text>
          <Text style={styles.profile}>👤</Text>
        </View>

        <Text style={styles.pageTitle}>MULTI-AGENT PIPELINE TRACE</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.latencyBadge}>
            <Text style={styles.latencyText}>TOTAL LATENCY:</Text>
            <Text style={styles.latencyValue}>{sessionData.elapsed_ms}ms</Text>
          </View>
          <Text style={styles.sessionId}>Session ID: {sessionData.session_id}</Text>
        </View>

        <View style={styles.timeline}>
          {traces.map((trace, index) => {
            const color = AGENT_COLORS[trace.agent] || '#9CA3AF';
            return (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={[styles.line, { borderLeftColor: color }]} />
                
                <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 2 }]}>
                  <Text style={styles.agentName}>{trace.agent}</Text>
                  <Text style={[styles.agentDuration, { color }]}>{trace.duration_ms}ms</Text>
                  
                  <Text style={styles.outputLabel}>Output Data Keys</Text>
                  <Text style={styles.outputKeys}>{trace.output_keys?.join(' | ') || 'N/A'}</Text>

                  <View style={styles.reasoningBox}>
                    <Text style={styles.reasoningLabel}>AGENT REASONING</Text>
                    <Text style={styles.reasoningText}>"{trace.reasoning}"</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.continueButtonText}>CONTINUE TO ANALYSIS →</Text>}
        </TouchableOpacity>

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
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 40 },
  pageTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  latencyBadge: { backgroundColor: '#F59E0B20', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#F59E0B', marginRight: 12 },
  latencyText: { color: '#F59E0B', fontSize: 10 },
  latencyValue: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold' },
  sessionId: { color: '#9CA3AF', fontSize: 12 },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', left: -5, top: 12, zIndex: 2 },
  line: { width: 2, position: 'absolute', left: -1, top: 20, bottom: -20, borderLeftWidth: 2 },
  card: { flex: 1, marginLeft: 20, backgroundColor: '#141414', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  agentName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  agentDuration: { fontSize: 12, marginBottom: 12 },
  outputLabel: { color: '#9CA3AF', fontSize: 10, marginBottom: 4 },
  outputKeys: { color: '#FFF', fontSize: 12, marginBottom: 16 },
  reasoningBox: { backgroundColor: '#0A0A0A', padding: 12, borderRadius: 4 },
  reasoningLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  reasoningText: { color: '#FFF', fontSize: 12, fontStyle: 'italic' },
  continueButton: { backgroundColor: '#F59E0B', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  continueButtonText: { color: '#FFF', fontWeight: 'bold' },
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
