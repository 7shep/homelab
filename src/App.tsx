import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  Box,
  Boxes,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  OctagonAlert,
  Server,
  Settings,
  SlidersHorizontal,
  SquareTerminal,
  TriangleAlert
} from 'lucide-react';
import {
  alerts,
  metrics,
  navigationItems,
  projects,
  timelineEvents,
  type HealthState,
  type Metric
} from './appData';

const colors = {
  app: '#071017',
  sidebar: '#070B10',
  panel: '#0B1821',
  panelRaised: '#101D28',
  border: '#243746',
  borderSoft: '#182B38',
  divider: '#1A2A36',
  text: '#E6EDF3',
  muted: '#9AA8B6',
  faint: '#718190',
  accent: '#2ED9FF',
  success: '#28E39A',
  warning: '#FFC21A',
  critical: '#FF4D52'
};

const monoStack =
  '"IBM Plex Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace';
const sansStack = monoStack;
const brandStack = monoStack;

const statusStyles: Record<
  HealthState,
  { label: string; color: string; backgroundColor: string; borderColor: string }
> = {
  healthy: {
    label: 'Healthy',
    color: colors.success,
    backgroundColor: '#0B3325',
    borderColor: '#158858'
  },
  warning: {
    label: 'Warning',
    color: colors.warning,
    backgroundColor: '#332A0B',
    borderColor: '#7B640F'
  },
  critical: {
    label: 'Critical',
    color: colors.critical,
    backgroundColor: '#351319',
    borderColor: '#A2373F'
  }
};

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

function StatusDot({ status }: { status: HealthState }) {
  return <View style={[styles.statusDot, { backgroundColor: statusStyles[status].color }]} />;
}

function StatusPill({ status }: { status: HealthState }) {
  const style = statusStyles[status];

  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor
        }
      ]}
    >
      <Text style={[styles.statusText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

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

function Sidebar() {
  const icons = [LayoutDashboard, Boxes, Clock3, Bell, Server, SlidersHorizontal, Settings];

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}>
          <SquareTerminal color={colors.text} size={18} strokeWidth={2} />
        </View>
        <Text style={styles.brand}>homelab</Text>
      </View>

      <View style={styles.navList}>
        {navigationItems.map((item, index) => {
          const active = item === 'Dashboard';
          const NavIcon = icons[index];

          return (
            <View key={item} style={[styles.navItem, active && styles.navItemActive]}>
              <NavIcon color={active ? colors.accent : colors.muted} size={18} strokeWidth={2} />
              <Text style={[styles.navText, active && styles.navTextActive]}>{item}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <View style={styles.footerStatusCard}>
          <View style={styles.footerStatusLine}>
            <StatusDot status="healthy" />
            <Text style={styles.footerStatusTitle}>System</Text>
          </View>
          <Text style={styles.footerStatusText}>Healthy</Text>
        </View>
        <View style={styles.operatorRow}>
          <View style={styles.operatorAvatar}>
            <Text style={styles.operatorAvatarText}>o</Text>
          </View>
          <View style={styles.operatorCopy}>
            <Text style={styles.operatorName}>ops</Text>
            <Text style={styles.operatorRole}>operator</Text>
          </View>
          <Text style={styles.operatorChevron}>v</Text>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.app}>
      <Sidebar />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.app,
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontFamily: sansStack,
    minHeight: '100vh'
  },
  sidebar: {
    backgroundColor: colors.sidebar,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: '100vh',
    paddingBlock: 24,
    paddingInline: 14,
    width: 214
  },
  brandBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingInline: 6
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#0D1620',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  brandPrompt: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 14,
    fontWeight: '800'
  },
  brand: {
    color: colors.accent,
    fontFamily: brandStack,
    fontSize: 21,
    fontWeight: '400',
    lineHeight: 24
  },
  navList: {
    gap: 10,
    marginTop: 30
  },
  navItem: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 44,
    paddingBlock: 8,
    paddingInline: 12
  },
  navItemActive: {
    backgroundColor: '#0F2230',
    borderColor: '#113A4D'
  },
  navIcon: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 13,
    minWidth: 25
  },
  navIconActive: {
    color: colors.accent
  },
  navText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700'
  },
  navTextActive: {
    color: colors.accent
  },
  sidebarFooter: {
    gap: 18,
    marginTop: 'auto'
  },
  footerStatusCard: {
    backgroundColor: '#09141D',
    borderColor: colors.borderSoft,
    borderRadius: 6,
    borderWidth: 1,
    paddingBlock: 12,
    paddingInline: 12
  },
  footerStatusLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  footerStatusTitle: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  footerStatusText: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 12,
    marginLeft: 21,
    marginTop: 4
  },
  operatorRow: {
    alignItems: 'center',
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBlock: 16,
    paddingInline: 4
  },
  operatorAvatar: {
    alignItems: 'center',
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  operatorAvatarText: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 13
  },
  operatorCopy: {
    flex: 1,
    gap: 2
  },
  operatorName: {
    color: colors.text,
    fontFamily: monoStack,
    fontSize: 13,
    fontWeight: '800'
  },
  operatorRole: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 11
  },
  operatorChevron: {
    color: colors.muted,
    fontFamily: monoStack,
    fontSize: 13
  },
  content: {
    flex: 1,
    minWidth: 360
  },
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
  metricIconText: {
    fontFamily: monoStack,
    fontSize: 15,
    fontWeight: '900'
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
  inlineArrow: {
    color: colors.accent,
    fontFamily: monoStack,
    fontSize: 18,
    lineHeight: 18
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
  statusPill: {
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    minWidth: 84,
    paddingBlock: 5,
    paddingInline: 10
  },
  statusText: {
    fontFamily: monoStack,
    fontSize: 12,
    fontWeight: '900'
  },
  statusDot: {
    borderRadius: 999,
    height: 10,
    width: 10
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
