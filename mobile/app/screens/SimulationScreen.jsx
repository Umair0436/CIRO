import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SimulationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ CIRO</Text>
          <Text style={styles.profile}>👤</Text>
        </View>

        <Text style={styles.sectionTitle}>SYSTEM STATUS: ACTIVE</Text>
        <Text style={styles.pageTitle}>SIMULATION EXECUTED</Text>

        <View style={styles.precisionBadge}>
          <Text style={styles.precisionText}>PRECISION INDEX: 98.4%</Text>
        </View>

        <View style={styles.simBanner}>
          <View style={styles.simIconBox}>
            <Text style={styles.simIconText}>✅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.simId}>SIM-20260515</Text>
            <Text style={styles.simImprovement}>Road passability 20% → 80%</Text>
          </View>
        </View>

        <View style={styles.ticketHeader}>
          <Text style={styles.sectionTitle}>ACTIVE EMERGENCY TICKETS</Text>
          <Text style={styles.ticketTotal}>5 TOTAL</Text>
        </View>

        {/* Tickets */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketId}>TKT-0012</Text>
            <View style={[styles.statusTag, { backgroundColor: '#22C55E' }]}><Text style={[styles.statusTagText, { color: '#FFF' }]}>✅ RESOLVED</Text></View>
          </View>
          <Text style={styles.ticketType}>RESCUE</Text>
          <Text style={styles.ticketDetail}>🚁 Rescue 1122 Alpha</Text>
          <Text style={styles.ticketDetail}>📍 G-10 Markaz</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketId}>TKT-0013</Text>
            <View style={[styles.statusTag, { backgroundColor: '#F59E0B' }]}><Text style={[styles.statusTagText, { color: '#0A0A0A' }]}>⚠️ ON SCENE</Text></View>
          </View>
          <Text style={styles.ticketType}>MEDICAL</Text>
          <Text style={styles.ticketDetail}>🚑 PIMS Ambulance 1</Text>
          <Text style={styles.ticketDetail}>📍 G-9 Centre</Text>
        </View>

        <View style={[styles.ticketCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketId}>TKT-0014</Text>
            <View style={[styles.statusTag, { backgroundColor: 'transparent', borderColor: '#F59E0B', borderWidth: 1 }]}><Text style={[styles.statusTagText, { color: '#F59E0B' }]}>🚚 EN ROUTE</Text></View>
          </View>
          <Text style={[styles.ticketType, { color: '#F59E0B' }]}>DRAINAGE</Text>
          <Text style={styles.ticketDetail}>💧 WASA Pump A</Text>
          <Text style={styles.ticketDetail}>📍 G-10 Markaz</Text>
        </View>

        <View style={[styles.ticketCard, { borderLeftColor: '#EF4444', borderLeftWidth: 4 }]}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketId}>TKT-0015</Text>
            <View style={[styles.statusTag, { backgroundColor: '#EF4444', borderColor: '#EF4444', borderWidth: 1 }]}><Text style={[styles.statusTagText, { color: '#FFF' }]}>▶️ DISPATCHED</Text></View>
          </View>
          <Text style={styles.ticketType}>TRAFFIC</Text>
          <Text style={styles.ticketDetail}>🚥 CDA Traffic</Text>
          <Text style={styles.ticketDetail}>📍 G-9 Karachi Co</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketId}>TKT-0016</Text>
            <View style={[styles.statusTag, { backgroundColor: '#22C55E' }]}><Text style={[styles.statusTagText, { color: '#FFF' }]}>✅ RESOLVED</Text></View>
          </View>
          <Text style={styles.ticketType}>RESCUE</Text>
        </View>

        {/* Alert Dispatch Log */}
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>ALERT DISPATCH LOG</Text>
          <View style={styles.logRow}><Text style={styles.logLabel}>SMS</Text><Text style={styles.logValue}>20,000</Text><Text style={styles.logStatus}>DELIVERED ✓</Text></View>
          <View style={styles.logRow}><Text style={styles.logLabel}>PUSH</Text><Text style={styles.logValue}>5,000</Text><Text style={styles.logStatus}>DELIVERED ✓</Text></View>
          <View style={styles.logRow}><Text style={styles.logLabel}>PA SYSTEM</Text><Text style={styles.logValue}>20,000</Text><Text style={styles.logStatus}>DELIVERED ✓</Text></View>
          <View style={styles.logRow}><Text style={styles.logLabel}>SOCIAL MEDIA</Text><Text style={styles.logValue}>10,000</Text><Text style={styles.logStatus}>DELIVERED ✓</Text></View>
        </View>

        {/* Route Updates */}
        <View style={styles.routeSection}>
          <Text style={styles.logTitle}>ROUTE UPDATES</Text>
          <View style={styles.routeItem}>
            <Text style={styles.routeStatusRed}>CLOSE</Text>
            <Text style={styles.routeName}>G-10 Markaz Road</Text>
            <Text style={styles.routeDetail}>→ Use Islamabad Expressway</Text>
          </View>
          <View style={styles.routeItem}>
            <Text style={styles.routeStatusAmber}>DIVERT</Text>
            <Text style={styles.routeName}>I-8 Intersection</Text>
            <Text style={styles.routeDetail}>→ Follow CDA signs</Text>
          </View>
          <View style={styles.routeItem}>
            <Text style={styles.routeStatusGreen}>OPEN</Text>
            <Text style={styles.routeName}>Srinagar Highway westbound</Text>
            <Text style={styles.routeDetail}>All lanes cleared</Text>
          </View>
          
          <View style={styles.feedImagePlaceholder}>
             <Text style={styles.feedLiveText}>🔴 LIVE FEED: SB-CAM-47</Text>
          </View>
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
  sectionTitle: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  pageTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  precisionBadge: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16 },
  precisionText: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 12 },
  simBanner: { flexDirection: 'row', backgroundColor: '#141414', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#22C55E', marginBottom: 24, alignItems: 'center', borderLeftWidth: 4 },
  simIconBox: { marginRight: 16 },
  simIconText: { fontSize: 24 },
  simId: { color: '#22C55E', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  simImprovement: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  ticketTotal: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
  ticketCard: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  ticketHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketId: { color: '#9CA3AF', fontSize: 12 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  statusTagText: { fontSize: 10, fontWeight: 'bold' },
  ticketType: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  ticketDetail: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
  logSection: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 24, marginTop: 12 },
  logTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold', marginBottom: 16 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  logLabel: { color: '#FFF', flex: 1, fontSize: 12 },
  logValue: { color: '#FFF', flex: 1, fontSize: 12 },
  logStatus: { color: '#22C55E', flex: 1, fontSize: 10, textAlign: 'right' },
  routeSection: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 32 },
  routeItem: { marginBottom: 16 },
  routeStatusRed: { color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  routeStatusAmber: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  routeStatusGreen: { color: '#22C55E', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  routeName: { color: '#FFF', fontSize: 14, marginBottom: 4 },
  routeDetail: { color: '#9CA3AF', fontSize: 12 },
  feedImagePlaceholder: { height: 120, backgroundColor: '#0A0A0A', borderRadius: 4, marginTop: 8 },
  feedLiveText: { color: '#FFF', fontSize: 10, padding: 8, position: 'absolute' }
});
