import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { AppContext } from '../Context';

const formatLivesProtected = (value) => {
  if (value === undefined || value === null) return '—';
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(0)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};

export default function SimulationScreen() {
  const { analysisData } = useContext(AppContext);
  const locationName = analysisData?.affected_area || 'ISLAMABAD SECTOR';
  const simData = analysisData?.simulation || {};

  const getCoordinates = (location) => {
    const loc = location ? String(location).toLowerCase() : '';
    if (loc.includes('lahore')) {
      return { lat: 31.5204, lng: 74.3587 };
    }
    if (loc.includes('islamabad') || loc.includes('g-10') || loc.includes('f-7')) {
      return { lat: 33.6844, lng: 73.0479 };
    }
    return { lat: 33.6844, lng: 73.0479 };
  };

  const { lat, lng } = getCoordinates(locationName);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
      <style>
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #0A0A0A;
        }
        #map {
          height: 100%;
          width: 100%;
        }
        .pulse-marker {
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 1);
          margin: 10px;
          height: 12px;
          width: 12px;
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${lat}, ${lng}], 13);
        
        L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var pulseIcon = L.divIcon({
          className: 'pulse-icon-container',
          html: '<div class="pulse-marker"></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([${lat}, ${lng}], { icon: pulseIcon }).addTo(map);
      </script>
    </body>
    </html>
  `;
  const simId = simData.simulation_id || 'SIM-20260517';
  const improvementSummary = simData.improvement_summary || 'Response deployed successfully.';
  const metrics = simData.metrics;

  const defaultTickets = [
    { ticket_id: 'TKT-0012', type: 'RESCUE', status: 'resolved', assigned_to: 'Rescue 1122 Alpha', location: 'G-10 Markaz' },
    { ticket_id: 'TKT-0013', type: 'MEDICAL', status: 'in_progress', assigned_to: 'PIMS Ambulance 1', location: 'G-9 Centre' },
    { ticket_id: 'TKT-0014', type: 'DRAINAGE', status: 'en_route', assigned_to: 'WASA Pump A', location: 'G-10 Markaz' },
    { ticket_id: 'TKT-0015', type: 'TRAFFIC', status: 'dispatched', assigned_to: 'CDA Traffic', location: 'G-9 Karachi Co' },
  ];
  const tickets = simData.mock_tickets?.length > 0 ? simData.mock_tickets : defaultTickets;

  const defaultAlertLogs = [
    { channel: 'sms', recipients: 20000, status: 'delivered' },
    { channel: 'push_notification', recipients: 5000, status: 'delivered' },
    { channel: 'pa_system', recipients: 20000, status: 'delivered' },
    { channel: 'social_media', recipients: 10000, status: 'delivered' }
  ];
  const alertLogs = simData.alert_dispatch_log?.length > 0 ? simData.alert_dispatch_log : defaultAlertLogs;

  const defaultRouteUpdates = [
    { action: 'close', road: 'G-10 Markaz Road', alternate: 'Use Islamabad Expressway' },
    { action: 'divert', road: 'I-8 Intersection', alternate: 'Follow CDA signs' },
    { action: 'open', road: 'Srinagar Highway westbound', alternate: 'All lanes cleared' }
  ];
  const routeUpdates = simData.route_updates?.length > 0 ? simData.route_updates : defaultRouteUpdates;

  const getTicketStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return {
          style: { backgroundColor: '#22C55E' },
          textStyle: { color: '#FFF' },
          label: '✅ RESOLVED'
        };
      case 'in_progress':
      case 'on_scene':
        return {
          style: { backgroundColor: '#F59E0B' },
          textStyle: { color: '#0A0A0A' },
          label: '⚠️ ON SCENE'
        };
      case 'dispatched':
        return {
          style: { backgroundColor: '#EF4444' },
          textStyle: { color: '#FFF' },
          label: '▶️ DISPATCHED'
        };
      case 'en_route':
        return {
          style: { borderColor: '#F59E0B', borderWidth: 1, backgroundColor: 'transparent' },
          textStyle: { color: '#F59E0B' },
          label: '🚚 EN ROUTE'
        };
      default:
        return {
          style: { backgroundColor: '#374151' },
          textStyle: { color: '#FFF' },
          label: (status || 'UNKNOWN').toUpperCase()
        };
    }
  };

  const getBorderLeftColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return '#22C55E';
      case 'in_progress':
      case 'en_route': return '#F59E0B';
      case 'dispatched': return '#EF4444';
      default: return '#2A2A2A';
    }
  };

  const getChannelLabel = (channel) => {
    switch (channel?.toLowerCase()) {
      case 'sms': return 'SMS';
      case 'push':
      case 'push_notification': return 'PUSH';
      case 'pa':
      case 'pa_system': return 'PA SYSTEM';
      case 'social':
      case 'social_media': return 'SOCIAL MEDIA';
      default: return (channel || 'ALERT').toUpperCase().replace(/_/g, ' ');
    }
  };

  const getRouteStyle = (action) => {
    switch (action?.toLowerCase()) {
      case 'close': return styles.routeStatusRed;
      case 'divert': return styles.routeStatusAmber;
      case 'open': return styles.routeStatusGreen;
      default: return styles.routeStatusGreen;
    }
  };

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
            <Text style={styles.simId}>{simId}</Text>
            <Text style={styles.simImprovement}>{improvementSummary}</Text>
          </View>
        </View>

        {/* Metrics Bar */}
        {metrics && (
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{metrics.response_time_mins ?? '—'}m</Text>
              <Text style={styles.metricLabel}>RESPONSE TIME</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{metrics.resources_deployed ?? '—'}</Text>
              <Text style={styles.metricLabel}>DEPLOYED</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatLivesProtected(metrics.estimated_lives_protected)}</Text>
              <Text style={styles.metricLabel}>PROTECTED LIVES</Text>
            </View>
          </View>
        )}

        <View style={styles.ticketHeader}>
          <Text style={styles.sectionTitle}>ACTIVE EMERGENCY TICKETS</Text>
          <Text style={styles.ticketTotal}>{tickets.length} TOTAL</Text>
        </View>

        {/* Tickets */}
        {tickets.map((ticket, idx) => {
          const badge = getTicketStatusBadge(ticket.status);
          return (
            <View key={ticket.ticket_id || idx} style={[styles.ticketCard, { borderLeftColor: getBorderLeftColor(ticket.status), borderLeftWidth: 4 }]}>
              <View style={styles.ticketHeaderRow}>
                <Text style={ticketIdStyle(ticket.ticket_id)}>{ticket.ticket_id}</Text>
                <View style={[styles.statusTag, badge.style]}><Text style={[styles.statusTagText, badge.textStyle]}>{badge.label}</Text></View>
              </View>
              <Text style={styles.ticketType}>{ticket.type?.toUpperCase()}</Text>
              {ticket.assigned_to ? <Text style={styles.ticketDetail}>🚀 {ticket.assigned_to}</Text> : null}
              {ticket.location ? <Text style={styles.ticketDetail}>📍 {ticket.location}</Text> : null}
            </View>
          );
        })}

        {/* Alert Dispatch Log */}
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>ALERT DISPATCH LOG</Text>
          {alertLogs.map((log, idx) => (
            <View key={idx} style={styles.logRow}>
              <Text style={styles.logLabel}>{getChannelLabel(log.channel)}</Text>
              <Text style={styles.logValue}>{log.recipients?.toLocaleString() || '0'}</Text>
              <Text style={styles.logStatus}>{(log.status || 'delivered').toUpperCase()} ✓</Text>
            </View>
          ))}
        </View>

        {/* Route Updates */}
        <View style={styles.routeSection}>
          <Text style={styles.logTitle}>ROUTE UPDATES</Text>
          {routeUpdates.map((upd, idx) => (
            <View key={idx} style={styles.routeItem}>
              <Text style={getRouteStyle(upd.action)}>{(upd.action || 'open').toUpperCase()}</Text>
              <Text style={styles.routeName}>{upd.road}</Text>
              {upd.alternate ? <Text style={styles.routeDetail}>→ {upd.alternate}</Text> : null}
            </View>
          ))}
          
          <Text style={styles.mapTitle}>GROUND OPERATIONS MAP</Text>
          <View style={styles.mapContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.mapWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Inline styles helper for ticket ID
const ticketIdStyle = (id) => {
  return id ? styles.ticketId : [styles.ticketId, { display: 'none' }];
};

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
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1A1A1A', borderRadius: 8, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2A' },
  metric: { alignItems: 'center' },
  metricValue: { color: '#F59E0B', fontSize: 20, fontWeight: 'bold' },
  metricLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
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
  mapTitle: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  mapContainer: { height: 200, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A', marginTop: 8 },
  mapWebView: { flex: 1, backgroundColor: '#0A0A0A' }
});
