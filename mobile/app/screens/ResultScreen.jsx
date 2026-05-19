import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
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

  const { crisis_type, severity, affected_area, simulation, action_plan } = analysisData;
  const displayCrisis = crisis_type ? crisis_type.toUpperCase() : 'UNKNOWN CRISIS';
  const displaySeverity = severity || 'HIGH';
  const displayArea = affected_area || 'UNKNOWN LOCATION';
  const plan = action_plan || {};
  
  const beforeState = simulation?.before_state || {};
  const afterState = simulation?.after_state || {};

  const getDynamicMetrics = (state, type) => {
    if (!state) return [];
    
    const metrics = [];
    
    switch (type?.toLowerCase()) {
      case 'flood':
        if (state.road_passability !== undefined) metrics.push({ label: 'Road Passability', value: `${state.road_passability}%` });
        const waterVal = state.flood_water_level_cm !== undefined ? `${state.flood_water_level_cm} cm` : (state.water_level !== undefined ? state.water_level : undefined);
        if (waterVal !== undefined) metrics.push({ label: 'Water Level', value: waterVal });
        if (state.stranded_people !== undefined) metrics.push({ label: 'Stranded People', value: state.stranded_people });
        if (state.trapped_vehicles !== undefined) metrics.push({ label: 'Trapped Vehicles', value: state.trapped_vehicles });
        if (state.power_status !== undefined) metrics.push({ label: 'Power Status', value: state.power_status });
        if (state.casualties_risk !== undefined) metrics.push({ label: 'Casualties Risk', value: state.casualties_risk });
        break;
      case 'heatwave':
        if (state.temperature !== undefined) metrics.push({ label: 'Temperature', value: state.temperature });
        if (state.hospital_capacity !== undefined) metrics.push({ label: 'Hospital Capacity', value: state.hospital_capacity });
        if (state.heat_stroke_cases !== undefined) metrics.push({ label: 'Heat Stroke Cases', value: state.heat_stroke_cases });
        const coolingVal = state.cooling_centers !== undefined ? state.cooling_centers : state.cooling_centers_active;
        if (coolingVal !== undefined) metrics.push({ label: 'Cooling Centers Active', value: coolingVal });
        if (state.casualties_risk !== undefined) metrics.push({ label: 'Casualties Risk', value: state.casualties_risk });
        
        const erVal = state.emergency_response_active !== undefined ? (state.emergency_response_active ? 'Active' : 'Inactive') : undefined;
        if (erVal !== undefined) metrics.push({ label: 'Emergency Response', value: erVal });
        if (state.power_status !== undefined) metrics.push({ label: 'Power Status', value: state.power_status });
        if (state.road_passability !== undefined) metrics.push({ label: 'Road Passability', value: `${state.road_passability}%` });
        break;
      case 'accident':
      case 'road_blockage':
        const congestionVal = state.congestion_level !== undefined ? state.congestion_level : (state.congestion_pct !== undefined ? `${state.congestion_pct}%` : undefined);
        if (congestionVal !== undefined) metrics.push({ label: 'Congestion Level', value: congestionVal });
        if (state.blocked_roads !== undefined) metrics.push({ label: 'Blocked Roads', value: state.blocked_roads });
        if (state.avg_speed !== undefined) metrics.push({ label: 'Average Speed', value: state.avg_speed });
        if (state.casualties_risk !== undefined) metrics.push({ label: 'Casualties Risk', value: state.casualties_risk });
        break;
      case 'infrastructure_failure':
        if (state.power_status !== undefined) metrics.push({ label: 'Power Status', value: state.power_status });
        if (state.affected_sectors !== undefined) metrics.push({ label: 'Affected Sectors', value: state.affected_sectors });
        if (state.repair_eta !== undefined) metrics.push({ label: 'Repair ETA', value: state.repair_eta });
        if (state.backup_systems !== undefined) metrics.push({ label: 'Backup Systems', value: state.backup_systems });
        if (state.casualties_risk !== undefined) metrics.push({ label: 'Casualties Risk', value: state.casualties_risk });
        break;
      default:
        Object.keys(state).forEach(key => {
          if (!['situation', 'casualties_risk', 'road_passability', 'emergency_response_active'].includes(key)) {
            const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            metrics.push({ label: formattedLabel, value: state[key] });
          }
        });
    }
    return metrics;
  };

  const LOCATION_COORDS = {
    'G-10': { latitude: 33.6844, longitude: 73.0033 },
    'G-9': { latitude: 33.6844, longitude: 73.0167 },
    'I-8': { latitude: 33.6667, longitude: 73.0667 },
    'F-7': { latitude: 33.7167, longitude: 73.0500 },
    'E-11': { latitude: 33.7000, longitude: 72.9833 },
    'JOHAR TOWN': { latitude: 31.4697, longitude: 74.2728 },
    'DHA': { latitude: 31.4697, longitude: 74.3750 },
    'MODEL TOWN': { latitude: 31.4800, longitude: 74.3200 },
    'ISLAMABAD': { latitude: 33.6844, longitude: 73.0479 },
    'LAHORE': { latitude: 31.5204, longitude: 74.3587 },
  };

  const getCoords = (area) => {
    if (!area) return LOCATION_COORDS['ISLAMABAD'];
    const upper = area.toUpperCase();
    for (const key in LOCATION_COORDS) {
      if (upper.includes(key)) return LOCATION_COORDS[key];
    }
    return LOCATION_COORDS['ISLAMABAD'];
  };

  const coords = getCoords(displayArea);

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
          
          {getDynamicMetrics(beforeState, crisis_type).map((m, idx) => (
            <View key={idx} style={styles.statRow}><Text style={styles.statLabel}>{m.label}</Text><Text style={styles.statValueBad}>{m.value}</Text></View>
          ))}
          
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

          {getDynamicMetrics(afterState, crisis_type).map((m, idx) => (
            <View key={idx} style={styles.statRow}><Text style={styles.statLabel}>{m.label}</Text><Text style={styles.statValueGood}>{m.value}</Text></View>
          ))}

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
          </View>
          <TouchableOpacity 
            style={styles.mapContainer} 
            onPress={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
              Linking.openURL(url).catch((err) => console.error("Error opening map:", err));
            }} 
            activeOpacity={0.85}
          >
            <View style={styles.mapGridBackground}>
              <View style={styles.radarCircle1} />
              <View style={styles.radarCircle2} />
              <View style={styles.radarLineH} />
              <View style={styles.radarLineV} />
            </View>
            
            <View style={styles.mapInfo}>
              <View style={styles.locationHeader}>
                <View style={styles.pulseDot} />
                <Text style={styles.locationLabel}>ACTIVE SCANNED AREA</Text>
              </View>
              
              <Text style={styles.mapLocationName}>{displayArea}</Text>
              
              <Text style={styles.coordinatesText}>
                LAT: {coords.latitude.toFixed(4)}  |  LNG: {coords.longitude.toFixed(4)}
              </Text>
              
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>🗺️ VIEW ON GOOGLE MAPS</Text>
              </View>
            </View>
            <View style={styles.scanningBadge}><Text style={styles.scanningText}>🟢 ACTIVE AREA SCANNING</Text></View>
          </TouchableOpacity>
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
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mapTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  mapContainer: { height: 220, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#141414', position: 'relative', justifyContent: 'center', padding: 20 },
  mapGridBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.15, justifyContent: 'center', alignItems: 'center' },
  radarCircle1: { width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: '#F59E0B', position: 'absolute' },
  radarCircle2: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: '#F59E0B', position: 'absolute' },
  radarLineH: { width: '100%', height: 1, backgroundColor: '#F59E0B', position: 'absolute' },
  radarLineV: { height: '100%', width: 1, backgroundColor: '#F59E0B', position: 'absolute' },
  mapInfo: { zIndex: 5 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 8 },
  locationLabel: { color: '#EF4444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  mapLocationName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  coordinatesText: { color: '#9CA3AF', fontSize: 12, marginBottom: 16 },
  viewButton: { backgroundColor: '#F59E0B', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 4, alignSelf: 'flex-start' },
  viewButtonText: { color: '#0A0A0A', fontSize: 12, fontWeight: 'bold' },
  scanningBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#141414', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#2A2A2A', zIndex: 10 },
  scanningText: { color: '#9CA3AF', fontSize: 10 },
  viewSimButton: { backgroundColor: '#F59E0B', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  viewSimButtonText: { color: '#FFF', fontWeight: 'bold' }
});
