import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { colors, monoStack, sansStack } from '../theme';

export function ProjectForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      api.getProject(id).then((p) => {
        setName(p.name);
        setDescription(p.description ?? '');
      }).catch((err) => setError(err.message));
    }
  }, [mode, id]);

  async function submit() {
    if (name.trim().length === 0) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    const input = { name: name.trim(), description: description.trim() || null };
    try {
      if (mode === 'create') {
        const created = await api.createProject(input);
        navigate(`/projects/${created.id}`);
      } else if (id) {
        await api.updateProject(id, input);
        navigate(`/projects/${id}`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{mode === 'create' ? 'New project' : 'Edit project'}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Project name"
          placeholderTextColor={colors.faint}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional description"
          placeholderTextColor={colors.faint}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={submit} disabled={saving}>
          <Text style={styles.primaryText}>
            {mode === 'create' ? 'Create project' : 'Save changes'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => navigate(-1)}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 18, maxWidth: 640 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  field: { gap: 6 },
  label: { color: colors.muted, fontFamily: monoStack, fontSize: 12, fontWeight: '800' },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    color: colors.text,
    fontFamily: sansStack,
    fontSize: 14,
    paddingBlock: 10,
    paddingInline: 12
  },
  textarea: { minHeight: 90 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  primary: {
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingBlock: 10,
    paddingInline: 16
  },
  primaryText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  secondary: { paddingBlock: 10, paddingInline: 16 },
  secondaryText: { color: colors.muted, fontFamily: monoStack, fontSize: 13 }
});
