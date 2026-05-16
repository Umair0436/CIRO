// CIRO — ResultScreen
// Displays: crisis_type, severity, actions, simulation, agent_trace

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';

const SEVERITY_COLOR = {
  low:      '#22c55e',
  medium:   '#f59e0b',
  high:     '#f97316',
  critical: '#ef4444',
};

const CRISIS_EMOJI = {
  flood:                  '🌊',
  heatwave:               '🌡️',
  accident:               '🚗',
  road_blockage:          '🚧',
  infrastructure_failure: '⚡',
  unknown:                '❓',
};

export default function ResultScreen({ route }) {
  const { result } = route.params;
  const [traceExpanded, setTraceExpanded] = useState(false);

  const severityColor = SEVERITY_COLOR[result.severity] || '#94a3b8';
  const crisisEmoji   = CRISIS_EMOJI[result.crisis_type] || '❓';
  const detection     = result.crisis_detection || {};
  const situation     = result.situation_report || {};
  const plan          = result.action_plan      || {};
  const sim           = result.simulation       || {};
  const traces        = result.agent_traces     || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Crisis Header ──────────────────────────────────────────────── */}
      <View style={[styles.crisisHeader, { borderColor: severityColor }]}>
        <Text style={styles.crisisEmoji}>{crisisEmoji}</Text>
        <Text style={styles.crisisType}>
          {(result.crisis_type || 'unknown').replace('_', ' ').toUpperCase()}
        </Text>
        <View style={[styles.severityBadge, { backgroundColor: severityColor + '22', borderColor: severityColor }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>
            {(result.severity || 'unknown').toUpperCase()}  ·  {result.severity_score}/10
          </Text>
        </View>
        <Text style={styles.confidenceText}>
          Confidence: {((detection.confidence_score || 0) * 100).toFixed(0)}%
        </Text>
        <Text style={styles.areaText}>📍 {detection.affected_area || result.affected_area || '—'}</Text>
      </View>

      {/* ── Summary ───────────────────────────────────────────────────── */}
      {situation.crisis_summary ? (
        <Section title="📋 Situation Summary">
          <Text style={styles.summaryText}>{situation.crisis_summary}</Text>
        </Section>
      ) : null}

      {/* ── Signal ────────────────────────────────────────────────────── */}
      <Section title="📡 Normalized Signal">
        {result.normalized_signal && (
          <>
            <InfoRow label="Language"   value={result.normalized_signal.detected_language} />
            <InfoRow label="Location"   value={result.normalized_signal.location} />
            <InfoRow label="Urgency"    value={result.normalized_signal.urgency} />
            {result.normalized_signal.translated_text &&
              result.normalized_signal.translated_text !== result.normalized_signal.original_text && (
                <InfoRow label="Translation" value={result.normalized_signal.translated_text} />
            )}
            {(result.normalized_signal.severity_keywords || []).length > 0 && (
              <View style={styles.tagRow}>
                {result.normalized_signal.severity_keywords.map((kw, i) => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>{kw}</Text></View>
                ))}
              </View>
            )}
          </>
        )}
      </Section>

      {/* ── Action Plan ───────────────────────────────────────────────── */}
      <Section title="🗺️ Traffic Rerouting">
        {(plan.traffic_rerouting?.alternate_routes || []).map((route, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>→</Text>
            <Text style={styles.listText}>{route}</Text>
          </View>
        ))}
        {plan.traffic_rerouting?.estimated_delay_mins > 0 && (
          <Text style={styles.delayText}>
            ⏱ Estimated delay: {plan.traffic_rerouting.estimated_delay_mins} mins
          </Text>
        )}
      </Section>

      <Section title="🚑 Emergency Dispatch">
        {(plan.emergency_dispatch?.services || []).map((svc, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.listText}>{svc}</Text>
          </View>
        ))}
        {plan.emergency_dispatch?.response_time_mins > 0 && (
          <InfoRow label="ETA" value={`${plan.emergency_dispatch.response_time_mins} mins`} />
        )}
        {plan.emergency_dispatch?.command_center && (
          <InfoRow label="Command" value={plan.emergency_dispatch.command_center} />
        )}
      </Section>

      <Section title="📢 Public Alerts">
        {plan.public_alerts?.sms_message && (
          <View style={styles.alertBox}>
            <Text style={styles.alertLabel}>SMS (160 chars)</Text>
            <Text style={styles.alertMsg}>{plan.public_alerts.sms_message}</Text>
          </View>
        )}
        {plan.public_alerts?.push_notification && (
          <View style={[styles.alertBox, { borderColor: '#7c3aed22', backgroundColor: '#7c3aed11' }]}>
            <Text style={[styles.alertLabel, { color: '#a78bfa' }]}>Push Notification</Text>
            <Text style={styles.alertMsg}>{plan.public_alerts.push_notification}</Text>
          </View>
        )}
      </Section>

      <Section title="🏗️ Resource Allocation">
        {Object.entries(plan.resource_allocation || {}).map(([key, val]) => {
          if (!val || (Array.isArray(val) && val.length === 0)) return null;
          return (
            <InfoRow
              key={key}
              label={key.replace(/_/g, ' ')}
              value={Array.isArray(val) ? val.join(', ') : String(val)}
            />
          );
        })}
      </Section>

      {/* ── Simulation ────────────────────────────────────────────────── */}
      {sim.simulation_id && (
        <Section title="🔬 Simulation Results">
          <Text style={styles.simId}>ID: {sim.simulation_id}</Text>

          {/* Before / After */}
          <View style={styles.compareRow}>
            <View style={[styles.compareBox, { borderColor: '#ef444444' }]}>
              <Text style={styles.compareLabel}>BEFORE</Text>
              <InfoRow label="Roads"    value={`${sim.before_state?.road_passability ?? '?'}% passable`} small />
              <InfoRow label="Risk"     value={sim.before_state?.casualties_risk}          small />
              <InfoRow label="Trapped"  value={`${sim.before_state?.trapped_vehicles ?? '?'} vehicles`} small />
              <InfoRow label="Stranded" value={`${sim.before_state?.stranded_people ?? '?'} people`}    small />
            </View>
            <View style={[styles.compareBox, { borderColor: '#22c55e44' }]}>
              <Text style={[styles.compareLabel, { color: '#22c55e' }]}>AFTER</Text>
              <InfoRow label="Roads"    value={`${sim.after_state?.road_passability ?? '?'}% passable`} small />
              <InfoRow label="Risk"     value={sim.after_state?.casualties_risk}           small />
              <InfoRow label="Trapped"  value={`${sim.after_state?.trapped_vehicles ?? 0} vehicles`}    small />
              <InfoRow label="Stranded" value={`${sim.after_state?.stranded_people ?? 0} people`}       small />
            </View>
          </View>

          {/* Metrics */}
          {sim.metrics && (
            <View style={styles.metricsRow}>
              <Metric label="Response" value={`${sim.metrics.response_time_mins}m`}  />
              <Metric label="Deployed" value={sim.metrics.resources_deployed}        />
              <Metric label="Protected" value={sim.metrics.estimated_lives_protected}/>
            </View>
          )}

          {/* Tickets */}
          {(sim.mock_tickets || []).length > 0 && (
            <>
              <Text style={styles.subheading}>Emergency Tickets</Text>
              {sim.mock_tickets.map((ticket, i) => (
                <View key={i} style={styles.ticket}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketId}>{ticket.ticket_id}</Text>
                    <View style={[styles.ticketStatus, {
                      backgroundColor: ticket.status === 'resolved' ? '#22c55e22' : '#f59e0b22'
                    }]}>
                      <Text style={[styles.ticketStatusText, {
                        color: ticket.status === 'resolved' ? '#22c55e' : '#f59e0b'
                      }]}>{ticket.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.ticketAssigned}>{ticket.assigned_to} · {ticket.location}</Text>
                  {ticket.eta_mins > 0 && (
                    <Text style={styles.ticketEta}>ETA: {ticket.eta_mins} mins</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </Section>
      )}

      {/* ── Agent Traces ──────────────────────────────────────────────── */}
      <Section title={`🤖 Agent Trace Log (${traces.length} agents)`}>
        <TouchableOpacity onPress={() => setTraceExpanded(!traceExpanded)} style={styles.traceToggle}>
          <Text style={styles.traceToggleText}>
            {traceExpanded ? '▲ Collapse traces' : '▼ Expand all traces'}
          </Text>
        </TouchableOpacity>
        {traceExpanded && traces.map((trace, i) => (
          <View key={i} style={styles.traceCard}>
            <View style={styles.traceHeader}>
              <View style={styles.traceNum}><Text style={styles.traceNumText}>{i + 1}</Text></View>
              <Text style={styles.traceName}>{trace.agent}</Text>
              <Text style={styles.traceDuration}>{trace.duration_ms}ms</Text>
            </View>
            <Text style={styles.traceTs}>{trace.timestamp_iso}</Text>
            {trace.reasoning ? (
              <Text style={styles.traceReasoning}>{trace.reasoning}</Text>
            ) : null}
            <Text style={styles.traceKeys}>
              Keys: {(trace.output_keys || []).join(', ')}
            </Text>
          </View>
        ))}
      </Section>

      {/* ── Timing ────────────────────────────────────────────────────── */}
      <View style={styles.timingBar}>
        <Text style={styles.timingText}>
          ⏱ Total pipeline: {result.total_elapsed_ms || 0}ms
          {' '}· {new Date(result.timestamp).toLocaleTimeString()}
        </Text>
      </View>

    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value, small = false }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, small && { fontSize: 11 }]}>{label}</Text>
      <Text style={[styles.infoValue, small && { fontSize: 11 }]}>{String(value)}</Text>
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value ?? '—'}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0f1117' },
  content:         { padding: 16, paddingBottom: 40 },

  // Crisis header
  crisisHeader:    { backgroundColor: '#161b2e', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 2 },
  crisisEmoji:     { fontSize: 48, marginBottom: 8 },
  crisisType:      { color: '#f1f5f9', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  severityBadge:   { marginTop: 10, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  severityText:    { fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  confidenceText:  { color: '#94a3b8', marginTop: 8, fontSize: 13 },
  areaText:        { color: '#60a5fa', marginTop: 4, fontSize: 13, fontWeight: '600' },

  // Summary
  summaryText:     { color: '#cbd5e1', lineHeight: 22, fontSize: 14 },

  // Section
  section:         { backgroundColor: '#161b2e', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#1e293b' },
  sectionTitle:    { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  sectionBody:     {},

  // Info rows
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel:       { color: '#64748b', fontSize: 13, flex: 1 },
  infoValue:       { color: '#e2e8f0', fontSize: 13, flex: 2, textAlign: 'right' },

  // Tags
  tagRow:          { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  tag:             { backgroundColor: '#1e3a5f', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, margin: 2 },
  tagText:         { color: '#60a5fa', fontSize: 11 },

  // List items
  listItem:        { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bullet:          { color: '#60a5fa', marginRight: 8, marginTop: 1 },
  listText:        { color: '#e2e8f0', fontSize: 13, flex: 1, lineHeight: 20 },
  delayText:       { color: '#f59e0b', fontSize: 12, marginTop: 6 },

  // Alert boxes
  alertBox:        { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ef444422' },
  alertLabel:      { color: '#ef4444', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  alertMsg:        { color: '#e2e8f0', fontSize: 13, lineHeight: 20 },

  // Simulation
  simId:           { color: '#64748b', fontSize: 11, marginBottom: 12, fontFamily: 'monospace' },
  compareRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  compareBox:      { flex: 1, backgroundColor: '#0f1117', borderRadius: 10, padding: 12, borderWidth: 1 },
  compareLabel:    { color: '#ef4444', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  metricsRow:      { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0f1117', borderRadius: 10, padding: 12, marginBottom: 14 },
  metric:          { alignItems: 'center' },
  metricValue:     { color: '#60a5fa', fontSize: 20, fontWeight: '800' },
  metricLabel:     { color: '#64748b', fontSize: 11, marginTop: 2 },
  subheading:      { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 4 },

  // Tickets
  ticket:          { backgroundColor: '#0f1117', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e293b' },
  ticketHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ticketId:        { color: '#60a5fa', fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },
  ticketStatus:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  ticketStatusText:{ fontSize: 11, fontWeight: '600' },
  ticketAssigned:  { color: '#cbd5e1', fontSize: 12 },
  ticketEta:       { color: '#f59e0b', fontSize: 11, marginTop: 2 },

  // Agent traces
  traceToggle:     { paddingVertical: 8, alignItems: 'center' },
  traceToggleText: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  traceCard:       { backgroundColor: '#0f1117', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e293b' },
  traceHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  traceNum:        { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  traceNumText:    { color: '#60a5fa', fontSize: 11, fontWeight: '800' },
  traceName:       { color: '#e2e8f0', fontSize: 13, fontWeight: '700', flex: 1 },
  traceDuration:   { color: '#64748b', fontSize: 11 },
  traceTs:         { color: '#475569', fontSize: 10, marginBottom: 4 },
  traceReasoning:  { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  traceKeys:       { color: '#475569', fontSize: 10 },

  // Timing
  timingBar:       { backgroundColor: '#161b2e', borderRadius: 10, padding: 12, alignItems: 'center' },
  timingText:      { color: '#475569', fontSize: 12 },
});
