import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import type { Component } from '../../shared/types';
import { api, type ComponentInput } from '../api/client';
import { useProject } from '../api/hooks';
import { StatusPill } from '../components/StatusPill';
import { colors, monoStack, sansStack } from '../theme';
import { ComponentForm } from './ComponentForm';

const HUB_SECTIONS = ['Checks', 'Deploys', 'Alerts', 'Timeline', 'Config', 'Log pointers'];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useProject(id);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  if (loading) return <Text style={styles.muted}>Loading…</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!data) return <Text style={styles.muted}>Project not found.</Text>;

  async function addComponent(input: ComponentInput) {
    await api.createComponent(id!, input);
    setAdding(false);
    reload();
  }
  async function saveComponent(componentId: string, input: ComponentInput) {
    await api.updateComponent(componentId, input);
    setEditing(null);
    reload();
  }
  async function removeComponent(componentId: string) {
    if (!confirm('Delete this component?')) return;
    await api.deleteComponent(componentId);
    reload();
  }
  async function removeProject() {
    if (!confirm('Delete this project and all its components?')) return;
    await api.deleteProject(id!);
    navigate('/projects');
  }

  const toInput = (c: Component): ComponentInput => ({
    name: c.name, kind: c.kind, status: c.status, target: c.target, notes: c.notes
  });

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.title}>{data.name}</Text>
          <StatusPill status={data.status} />
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.button} onPress={() => navigate(`/projects/${id}/edit`)}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={removeProject}>
            <Text style={styles.dangerText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      {data.description ? <Text style={styles.description}>{data.description}</Text> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Components</Text>
          <Pressable onPress={() => { setAdding(true); setEditing(null); }}>
            <Text style={styles.link}>Add component</Text>
          </Pressable>
        </View>

        {adding ? (
          <ComponentForm onSubmit={addComponent} onCancel={() => setAdding(false)} />
        ) : null}

        {data.components.length === 0 && !adding ? (
          <Text style={styles.muted}>No components yet.</Text>
        ) : null}

        {data.components.map((c) =>
          editing === c.id ? (
            <ComponentForm
              key={c.id}
              initial={toInput(c)}
              onSubmit={(input) => saveComponent(c.id, input)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <View key={c.id} style={styles.componentRow}>
              <View style={styles.kindBadge}>
                <Text style={styles.kindText}>{c.kind}</Text>
              </View>
              <View style={styles.componentIdentity}>
                <Text style={styles.componentName}>{c.name}</Text>
                {c.target ? <Text style={styles.componentTarget}>{c.target}</Text> : null}
              </View>
              <StatusPill status={c.status} />
              <Pressable onPress={() => { setEditing(c.id); setAdding(false); }}>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => removeComponent(c.id)}>
                <Text style={styles.dangerText}>Remove</Text>
              </Pressable>
            </View>
          )
        )}
      </View>

      <View style={styles.hubGrid}>
        {HUB_SECTIONS.map((title) => (
          <View key={title} style={styles.hubCard}>
            <Text style={styles.hubTitle}>{title}</Text>
            <Text style={styles.hubEmpty}>Coming soon.</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  button: {
    borderColor: colors.border, borderWidth: 1, borderRadius: 6,
    paddingBlock: 8, paddingInline: 14
  },
  buttonText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  dangerText: { color: colors.critical, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  description: { color: colors.muted, fontFamily: sansStack, fontSize: 14, maxWidth: 720 },
  section: {
    backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 18, gap: 12
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.text, fontFamily: sansStack, fontSize: 16, fontWeight: '800' },
  link: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  componentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12
  },
  kindBadge: {
    borderColor: colors.border, borderWidth: 1, borderRadius: 999,
    paddingBlock: 3, paddingInline: 10, minWidth: 72, alignItems: 'center'
  },
  kindText: { color: colors.muted, fontFamily: monoStack, fontSize: 11, fontWeight: '800' },
  componentIdentity: { flex: 1, gap: 2 },
  componentName: { color: colors.text, fontFamily: monoStack, fontSize: 14, fontWeight: '800' },
  componentTarget: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  hubCard: {
    backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 18, flexBasis: 220, flexGrow: 1, gap: 6
  },
  hubTitle: { color: colors.text, fontFamily: sansStack, fontSize: 15, fontWeight: '800' },
  hubEmpty: { color: colors.faint, fontFamily: monoStack, fontSize: 12 },
  muted: { color: colors.muted, fontFamily: sansStack, fontSize: 14, padding: 30 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14, padding: 30 }
});
