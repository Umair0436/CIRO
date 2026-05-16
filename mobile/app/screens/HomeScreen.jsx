import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../Context';
import { ingestCrisis, runDemo } from '../api/client';

export default function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSessionData, setAnalysisData } = useContext(AppContext);

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
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>14:22</Text>
            <Text style={styles.feedText}>Traffic signal failure reported in Sector F-7.</Text>
          </View>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>14:20</Text>
            <Text style={styles.feedText}>Ambulance dispatch confirmed for G-9/1 medical emergency.</Text>
          </View>
          <View style={styles.feedItem}>
            <Text style={styles.feedTime}>14:18</Text>
            <Text style={styles.feedText}>System diagnostic complete. All sensors operational.</Text>
          </View>
          <Text style={styles.demoLink}>VIEW ALL LOGS</Text>
        </View>
      </ScrollView>
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
});
