import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Box,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  HeartPulse,
  OctagonAlert,
  Server,
  TriangleAlert
} from 'lucide-react';
import { alerts, metrics, projects, timelineEvents, type Metric } from '../appData';
import { StatusDot, StatusPill } from '../components/StatusPill';
import { colors, monoStack, sansStack, statusStyles } from '../theme';

const metricPalette: Record<
  Metric['status'],
  {
    color: string;
    bg: string;
    border: string;
    icon: typeof HeartPulse | typeof TriangleAlert | typeof OctagonAlert | typeof Server;
  }
> = {
  healthy: { color: colors.success, bg: '#0C4A31', border: '#1B8F62', icon: HeartPulse },
  warning: { color: colors.warning, bg: '#4B3806', border: '#A87B05', icon: TriangleAlert },
  critical: { color: colors.critical, bg: '#4B171F', border: '#B43A44', icon: OctagonAlert },
  total: { color: colors.text, bg: '#122230', border: colors.border, icon: Server }
};

function Trend({ metric }: { metric: Metric }) {
  const palette = metricPalette[metric.status];
  const max = Math.max(...metric.trend);
  const min = Math.min(...metric.trend);
  const range = max - min || 1;

  return (
    <View style={styles.trend} aria-hidden>
      {metric.trend.slice(-12).map((value, index) => (
        <View
          key={`${metric.id}-${index}`}
          style={[
            styles.trendBar,
            {
              backgroundColor: palette.color,
              height: 5 + ((value - min) / range) * 18
            }
          ]}
        />
      ))}
    </View>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const palette = metricPalette[metric.status];
  const MetricIcon = palette.icon;

  return (
    <View style={styles.metric}>
      <View style={styles.metricTopline}>
        <View style={[styles.metricIcon, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <MetricIcon color={palette.color} size={19} strokeWidth={2} />
        </View>
        <Text style={styles.metricValue}>{metric.value}</Text>
      </View>
      <Text style={[styles.metricLabel, { color: palette.color }]}>{metric.label}</Text>
      <Text style={styles.metricDetail}>{metric.detail}</Text>
      <Trend metric={metric} />
    </View>
  );
}

function Section({
  title,
  action,
  children
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action ? <Text style={styles.inlineLink}>{action}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Dashboard() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentInner}>
      <Text accessibilityRole="heading" aria-level={1} style={styles.screenReaderHeading}>
        Dashboard
      </Text>

      <View style={styles.commandBar}>
        <View style={styles.commandLeft}>
          <Text style={styles.commandBrand}>homelab</Text>
          <Text style={styles.promptPath}>~/ops</Text>
          <Text style={styles.commandDollar}>$</Text>
          <View style={styles.cursor} />
        </View>
        <View style={styles.sweepStatus}>
          <Text style={styles.sweepText}>Last sweep 42s ago</Text>
          <StatusDot status="healthy" />
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <View style={styles.primaryGrid}>
        <Section title="Projects needing attention">
          {projects.map((project) => (
            <View key={project.id} style={styles.projectRow}>
              <View style={styles.projectIdentity}>
                <View style={styles.projectGlyph}>
                  <Box color={statusStyles[project.status].color} size={18} strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectSummary}>{project.serviceCount} services</Text>
                </View>
              </View>
              <StatusPill status={project.status} />
              <Text style={styles.projectCheck}>
                {project.unhealthy > 0
                  ? `${project.unhealthy} / ${project.serviceCount} unhealthy`
                  : 'All healthy'}
              </Text>
              <ChevronRight color={colors.muted} size={18} strokeWidth={2} />
            </View>
          ))}
          <View style={styles.panelFooter}>
            <Text style={styles.inlineLink}>View all projects</Text>
            <ChevronRight color={colors.accent} size={18} strokeWidth={2} />
          </View>
        </Section>

        <Section title="Active alerts" action="View all">
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={styles.alertSeverity}>
                <StatusDot status={alert.severity} />
                <Text style={[styles.alertSeverityText, { color: statusStyles[alert.severity].color }]}>
                  {statusStyles[alert.severity].label}
                </Text>
              </View>
              <View style={styles.alertCopy}>
                <Text style={styles.alertProject}>
                  {alert.projectName} / {alert.target}
                </Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
              <Text style={styles.alertAge}>{alert.age}</Text>
            </View>
          ))}
          <View style={styles.panelFooter}>
            <Text style={styles.inlineLink}>View all alerts</Text>
            <ChevronRight color={colors.accent} size={18} strokeWidth={2} />
          </View>
        </Section>
      </View>

      <Section title="Recent timeline">
        <View style={styles.timelineList}>
          {timelineEvents.map((event) => (
            <View key={event.id} style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{event.time}</Text>
              <View style={[styles.timelineStatus, { borderColor: statusStyles[event.status].color }]}>
                {event.status === 'healthy' ? (
                  <CircleCheckBig color={statusStyles[event.status].color} size={12} strokeWidth={2} />
                ) : event.status === 'warning' ? (
                  <CircleAlert color={statusStyles[event.status].color} size={12} strokeWidth={2} />
                ) : (
                  <CircleX color={statusStyles[event.status].color} size={12} strokeWidth={2} />
                )}
              </View>
              <Text style={styles.timelineProject}>
                {event.projectName} / {event.target}
              </Text>
              <Text style={styles.timelineMessage}>{event.message}</Text>
              <StatusPill status={event.status} />
            </View>
          ))}
        </View>
        <View style={styles.timelineFooter}>
          <View style={styles.followState}>
            <StatusDot status="healthy" />
            <Text style={styles.followText}>Follow</Text>
          </View>
          <View style={styles.timelineTools}>
            <Text style={styles.timelineMuted}>Auto-scroll</Text>
            <View style={styles.toggle}>
              <View style={styles.toggleKnob} />
            </View>
            <Text style={styles.inlineLink}>Clear</Text>
            <ChevronRight color={colors.accent} size={18} strokeWidth={2} />
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  contentInner: {
    gap: 18,
    paddingBlock: 15,
    paddingInline: 30
  },
  screenReaderHeading: {
    height: 1,
    opacity: 0,
    position: 'absolute',
    width: 1
  },
  commandBar: {
    alignItems: 'center',
    backgroundColor: '#0A151F',
    borderColor: colors.borderSoft,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 52,
    paddingBlock: 11,
    paddingInline: 18
  },
  commandLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15
  },
  commandBrand: {
    color: colors.accent,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  promptPath: {
    color: colors.accent,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  commandDollar: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  cursor: {
    backgroundColor: colors.text,
    height: 16,
    width: 8
  },
  sweepStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13
  },
  sweepText: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 13
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metric: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    minHeight: 144,
    overflow: 'hidden',
    paddingBlock: 22,
    paddingInline: 20,
    position: 'relative'
  },
  metricTopline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34
  },
  metricValue: {
    color: colors.text,
    fontFamily: sansStack,
    fontSize: 33,
    fontWeight: '800',
    lineHeight: 38
  },
  metricLabel: {
    fontFamily: monoStack,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 16
  },
  metricDetail: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 13,
    marginTop: 9
  },
  trend: {
    alignItems: 'flex-end',
    bottom: 26,
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    right: 18
  },
  trendBar: {
    borderRadius: 999,
    opacity: 0.95,
    width: 3
  },
  primaryGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  section: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 360,
    overflow: 'hidden'
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingBlock: 12,
    paddingInline: 18
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21
  },
  inlineLink: {
    color: colors.accent,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  projectRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 18,
    minHeight: 58,
    paddingBlock: 10,
    paddingInline: 18
  },
  projectIdentity: {
    alignItems: 'center',
    flex: 1.2,
    flexDirection: 'row',
    gap: 15,
    minWidth: 210
  },
  projectGlyph: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18
  },
  projectName: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18
  },
  projectSummary: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    marginTop: 3
  },
  projectCheck: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    minWidth: 142
  },
  alertRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 60,
    paddingBlock: 10,
    paddingInline: 18
  },
  alertSeverity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minWidth: 130
  },
  alertSeverityText: {
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '900'
  },
  alertCopy: {
    flex: 1,
    gap: 3,
    minWidth: 190
  },
  alertProject: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '900'
  },
  alertMessage: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    lineHeight: 17
  },
  alertAge: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    minWidth: 58,
    textAlign: 'right'
  },
  panelFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: 48,
    paddingInline: 18
  },
  timelineList: {
    paddingTop: 0
  },
  timelineRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 18,
    minHeight: 43,
    paddingBlock: 8,
    paddingInline: 18
  },
  timelineTime: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    minWidth: 178
  },
  timelineStatus: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20
  },
  timelineProject: {
    color: colors.text,
    flex: 0.8,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '900',
    minWidth: 225
  },
  timelineMessage: {
    color: colors.muted,
    flex: 1,
    fontFamily: monoStack,
    fontSize: 12,
    minWidth: 190
  },
  timelineFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingInline: 18
  },
  followState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  followText: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12
  },
  timelineTools: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14
  },
  timelineMuted: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12
  },
  toggle: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 20,
    padding: 3,
    width: 38
  },
  toggleKnob: {
    alignSelf: 'flex-end',
    backgroundColor: colors.text,
    borderRadius: 999,
    height: 14,
    width: 14
  }
});
