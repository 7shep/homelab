import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COMPONENT_KINDS, type ComponentKind, type HealthState } from '../../shared/types';
import type { ComponentInput } from '../api/client';
import { colors, monoStack, sansStack } from '../theme';

const STATUSES: HealthState[] = ['healthy', 'warning', 'critical'];

export function ComponentForm({
  initial,
  onSubmit,
  onCancel
}: {
  initial?: ComponentInput;
  onSubmit: (input: ComponentInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<ComponentKind>(initial?.kind ?? 'service');
  const [status, setStatus] = useState<HealthState>(initial?.status ?? 'healthy');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length === 0) {
      setError('Name is required');
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      kind,
      status,
      target: target.trim() || null,
      notes: null
    });
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Component name"
        placeholderTextColor={colors.faint}
        value={name}
        onChangeText={setName}
      />
      <View style={styles.chips}>
        {COMPONENT_KINDS.map((k) => (
          <Pressable
            key={k}
            style={[styles.chip, kind === k && styles.chipActive]}
            onPress={() => setKind(k)}
          >
            <Text style={[styles.chipText, kind === k && styles.chipTextActive]}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, status === s && styles.chipActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Target (url / host / domain)"
        placeholderTextColor={colors.faint}
        value={target}
        onChangeText={setTarget}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={submit}>
          <Text style={styles.primaryText}>Save component</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={onCancel}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 10,
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: 14
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    color: colors.text,
    fontFamily: sansStack,
    fontSize: 14,
    paddingBlock: 9,
    paddingInline: 12
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingBlock: 5,
    paddingInline: 12
  },
  chipActive: { backgroundColor: colors.panel, borderColor: colors.accent },
  chipText: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  chipTextActive: { color: colors.accent, fontWeight: '800' },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12 },
  primary: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingBlock: 9,
    paddingInline: 14
  },
  primaryText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  secondary: { paddingBlock: 9, paddingInline: 14 },
  secondaryText: { color: colors.muted, fontFamily: monoStack, fontSize: 13 }
});
