import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { alerts, navigationItems, projects, timelineEvents, type HealthState } from './appData';

const statusStyles: Record<HealthState, { label: string; color: string; backgroundColor: string }> = {
  healthy: {
    label: 'Healthy',
    color: '#166534',
    backgroundColor: '#DCFCE7'
  },
  warning: {
    label: 'Warning',
    color: '#92400E',
    backgroundColor: '#FEF3C7'
  },
  critical: {
    label: 'Critical',
    color: '#991B1B',
    backgroundColor: '#FEE2E2'
  }
};

function StatusPill({ status }: { status: HealthState }) {
  const style = statusStyles[status];

  return (
    <View style={[styles.statusPill, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.statusText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function App() {
  const criticalProjects = projects.filter((project) => project.status === 'critical').length;
  const warningProjects = projects.filter((project) => project.status === 'warning').length;
  const healthyProjects = projects.filter((project) => project.status === 'healthy').length;

  return (
    <View style={styles.app}>
      <View style={styles.sidebar}>
        <View>
          <Text style={styles.brand}>homelab</Text>
          <Text style={styles.brandSubline}>Tiny observability</Text>
        </View>

        <View style={styles.navList}>
          {navigationItems.map((item) => (
            <View key={item} style={[styles.navItem, item === 'Dashboard' && styles.navItemActive]}>
              <Text style={[styles.navText, item === 'Dashboard' && styles.navTextActive]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="heading" aria-level={1} style={styles.title}>
              Dashboard
            </Text>
            <Text style={styles.subtitle}>Current state across projects, servers, alerts, and deploys.</Text>
          </View>
          <View style={styles.runStatus}>
            <Text style={styles.runStatusLabel}>Last sweep</Text>
            <Text style={styles.runStatusValue}>42 seconds ago</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Healthy</Text>
            <Text style={styles.metricValue}>{healthyProjects}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Warnings</Text>
            <Text style={styles.metricValue}>{warningProjects}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Critical</Text>
            <Text style={styles.metricValue}>{criticalProjects}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Active alerts</Text>
            <Text style={styles.metricValue}>{alerts.length}</Text>
          </View>
        </View>

        <View style={styles.primaryGrid}>
          <Section title="Projects needing attention">
            {projects.map((project) => (
              <View key={project.id} style={styles.projectRow}>
                <View style={styles.projectMain}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectSummary}>{project.summary}</Text>
                </View>
                <View style={styles.projectMeta}>
                  <StatusPill status={project.status} />
                  <Text style={styles.projectCheck}>{project.lastChecked}</Text>
                </View>
              </View>
            ))}
          </Section>

          <Section title="Active alerts">
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <StatusPill status={alert.severity} />
                <View style={styles.alertCopy}>
                  <Text style={styles.alertProject}>{alert.projectName}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
                <Text style={styles.alertAge}>{alert.age}</Text>
              </View>
            ))}
          </Section>
        </View>

        <Section title="Recent timeline">
          <View style={styles.timelineList}>
            {timelineEvents.map((event) => (
              <View key={event.id} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineProject}>{event.projectName}</Text>
                  <Text style={styles.timelineMessage}>{event.message}</Text>
                </View>
                <Text style={styles.timelineTime}>{event.time}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    minHeight: '100vh',
    backgroundColor: '#F6F7F9',
    flexDirection: 'row',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  sidebar: {
    width: 248,
    backgroundColor: '#111827',
    padding: 24,
    justifyContent: 'space-between',
    gap: 32
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800'
  },
  brandSubline: {
    color: '#A7F3D0',
    fontSize: 13,
    marginTop: 6
  },
  navList: {
    gap: 6,
    marginTop: 32
  },
  navItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  navItemActive: {
    backgroundColor: '#F9FAFB'
  },
  navText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '700'
  },
  navTextActive: {
    color: '#111827'
  },
  content: {
    flex: 1
  },
  contentInner: {
    padding: 32,
    gap: 24
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between'
  },
  headerCopy: {
    flexShrink: 1,
    gap: 8
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800'
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24
  },
  runStatus: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 180,
    padding: 14
  },
  runStatusLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  runStatusValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metric: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    padding: 18
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  metricValue: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8
  },
  primaryGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 320,
    padding: 18
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14
  },
  projectRow: {
    alignItems: 'center',
    borderTopColor: '#EEF2F7',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingVertical: 14
  },
  projectMain: {
    flexShrink: 1,
    gap: 4
  },
  projectName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800'
  },
  projectSummary: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20
  },
  projectMeta: {
    alignItems: 'flex-end',
    gap: 6
  },
  projectCheck: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700'
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800'
  },
  alertRow: {
    alignItems: 'center',
    borderTopColor: '#EEF2F7',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14
  },
  alertCopy: {
    flex: 1,
    gap: 4
  },
  alertProject: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800'
  },
  alertMessage: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20
  },
  alertAge: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800'
  },
  timelineList: {
    gap: 0
  },
  timelineRow: {
    alignItems: 'center',
    borderTopColor: '#EEF2F7',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14
  },
  timelineDot: {
    backgroundColor: '#2DD4BF',
    borderRadius: 6,
    height: 12,
    width: 12
  },
  timelineCopy: {
    flex: 1,
    gap: 4
  },
  timelineProject: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800'
  },
  timelineMessage: {
    color: '#64748B',
    fontSize: 14
  },
  timelineTime: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800'
  }
});
