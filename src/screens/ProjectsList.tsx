import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../api/hooks';
import { StatusPill } from '../components/StatusPill';
import { colors, monoStack, sansStack } from '../theme';

export function ProjectsList() {
  const { data, loading, error } = useProjects();
  const navigate = useNavigate();

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Link to="/projects/new" style={{ textDecoration: 'none' }}>
          <View style={styles.newButton}>
            <Text style={styles.newButtonText}>New project</Text>
          </View>
        </Link>
      </View>

      {loading ? <Text style={styles.muted}>Loading…</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && data.length === 0 ? (
        <Text style={styles.muted}>No projects yet. Create your first one.</Text>
      ) : null}

      {data?.map((project) => (
        <Pressable
          key={project.id}
          style={styles.row}
          onPress={() => navigate(`/projects/${project.id}`)}
        >
          <View style={styles.identity}>
            <Text style={styles.name}>{project.name}</Text>
            <Text style={styles.slug}>{project.slug}</Text>
          </View>
          <Text style={styles.count}>
            {project.componentCount} component{project.componentCount === 1 ? '' : 's'}
          </Text>
          <StatusPill status={project.status} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  newButton: {
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingBlock: 8,
    paddingInline: 14
  },
  newButtonText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingBlock: 14,
    paddingInline: 18
  },
  identity: { flex: 1, gap: 3 },
  name: { color: colors.text, fontFamily: monoStack, fontSize: 14, fontWeight: '800' },
  slug: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  count: { color: colors.muted, fontFamily: monoStack, fontSize: 12, minWidth: 120 },
  muted: { color: colors.muted, fontFamily: sansStack, fontSize: 14 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14 }
});
