import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../Context';

export default function ResultScreen({ navigation }) {
  const { analysisData } = useContext(AppContext);

  if (!analysisData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No analysis data available. Please run a demo or submit a report first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { crisis_type, severity, affected_area } = analysisData;
  const displayCrisis = crisis_type ? crisis_type.toUpperCase() : 'UNKNOWN CRISIS';
  const displaySeverity = severity || 'HIGH';
  const displayArea = affected_area || 'UNKNOWN LOCATION';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertTitle}>⚠️ {displayCrisis} DETECTED - {displaySeverity} SEVERITY</Text>
          <Text style={styles.alertSub}>Confidence: 97% | 50,000 people affected</Text>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {displayArea}</Text>
          </View>
        </View>

        {/* Before Section */}
        <View style={styles.beforeSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>BEFORE</Text>
            <Text style={styles.sectionLabelRight}>T-00:45:00</Text>
          </View>
          
          <View style={styles.statRow}><Text style={styles.statLabel}>Road Passability</Text><Text style={styles.statValueBad}>20%</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Water Level</Text><Text style={styles.statValueBad}>150cm</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Stranded People</Text><Text style={styles.statValueBad}>200</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Trapped Vehicles</Text><Text style={styles.statValueBad}>50</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Power</Text><Text style={styles.statValueBad}>Partial Outage</Text></View>
          
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>BEFORE IMAGE PLACEHOLDER</Text>
          </View>
        </View>

        {/* After Section */}
        <View style={styles.afterSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabelGood}>AFTER RESPONSE</Text>
            <Text style={styles.sectionLabelGoodRight}>LIVE TRACKING</Text>
          </View>

          <View style={styles.statRow}><Text style={styles.statLabel}>Road Passability</Text><Text style={styles.statValueGood}>80%</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Water Level</Text><Text style={styles.statValueGood}>30cm</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Stranded People</Text><Text style={styles.statValueGood}>0</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Trapped Vehicles</Text><Text style={styles.statValueGood}>0</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Power</Text><Text style={styles.statValueGood}>Normal</Text></View>

          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>AFTER IMAGE PLACEHOLDER</Text>
          </View>
        </View>

        {/* Action Cards (2x2 Grid) */}
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>🚥 TRAFFIC DIVERSIONS</Text>
            <Text style={styles.gridText}>Via G-9 Karachi Company, Via I-8 Murree Road, Expressway</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>⚕️ DISPATCH STATUS</Text>
            <Text style={styles.gridText}>Rescue 1122, NDMA, CDA</Text>
            <View style={styles.etaBadge}><Text style={styles.etaText}>ETA 30m</Text></View>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>📡 ACTIVE ALERTS</Text>
            <Text style={styles.gridText}>SMS: <Text style={styles.highlight}>20K users</Text></Text>
            <Text style={styles.gridText}>Push: <Text style={styles.highlight}>5K users</Text></Text>
            <Text style={styles.gridText}>PA System: <Text style={styles.highlight}>20K range</Text></Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>📋 DEPLOYED RESOURCES</Text>
            <Text style={styles.gridText}>• 2 Teams      • 3 Pumps</Text>
            <Text style={styles.gridText}>• 2 Ambulances • 2 Shelters</Text>
          </View>
        </View>

        {/* Ground Operations Map */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>🗺️ Ground Operations Map</Text>
            <View style={styles.openMapBtn}><Text style={styles.openMapText}>OPEN FULL GRID</Text></View>
          </View>
          <View style={styles.mapPlaceholder}>
             <Text style={styles.imagePlaceholderText}>MAP VISUALIZATION</Text>
             <View style={styles.scanningBadge}><Text style={styles.scanningText}>🟢 ACTIVE AREA SCANNING</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.viewSimButton} onPress={() => navigation.navigate('Simulation')}>
          <Text style={styles.viewSimButtonText}>VIEW SIMULATION DETAILS →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#9CA3AF', textAlign: 'center' },
  scroll: { padding: 16 },
  alertBanner: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, marginBottom: 16 },
  alertTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  alertSub: { color: '#FFF', fontSize: 12, marginBottom: 12 },
  locationBadge: { backgroundColor: '#B91C1C', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  beforeSection: { padding: 16, borderLeftWidth: 4, borderLeftColor: '#EF4444', backgroundColor: '#141414', marginBottom: 16 },
  afterSection: { padding: 16, borderLeftWidth: 4, borderLeftColor: '#22C55E', backgroundColor: '#141414', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionLabel: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
  sectionLabelRight: { color: '#9CA3AF', fontSize: 12 },
  sectionLabelGood: { color: '#22C55E', fontWeight: 'bold', fontSize: 12 },
  sectionLabelGoodRight: { color: '#22C55E', fontSize: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: '#9CA3AF', fontSize: 14 },
  statValueBad: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
  statValueGood: { color: '#22C55E', fontSize: 14, fontWeight: 'bold' },
  imagePlaceholder: { height: 100, backgroundColor: '#1A1A1A', marginTop: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  imagePlaceholderText: { color: '#9CA3AF', fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridCard: { width: '48%', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16 },
  gridTitle: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  gridText: { color: '#FFF', fontSize: 12, marginBottom: 4 },
  highlight: { color: '#F59E0B' },
  etaBadge: { backgroundColor: '#064E3B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
  etaText: { color: '#34D399', fontSize: 10, fontWeight: 'bold' },
  mapSection: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 24 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mapTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  openMapBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  openMapText: { color: '#0A0A0A', fontSize: 10, fontWeight: 'bold' },
  mapPlaceholder: { height: 150, backgroundColor: '#0A0A0A', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  scanningBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#141414', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#2A2A2A' },
  scanningText: { color: '#9CA3AF', fontSize: 10 },
  viewSimButton: { backgroundColor: '#F59E0B', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  viewSimButtonText: { color: '#FFF', fontWeight: 'bold' }
});
