import { StyleSheet, Text, View } from 'react-native';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Boxes,
  Clock3,
  LayoutDashboard,
  Server,
  Settings,
  SlidersHorizontal,
  SquareTerminal
} from 'lucide-react';
import { StatusDot } from './StatusPill';
import { colors, brandStack, monoStack } from '../theme';

const NAV: { label: string; to: string; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: Boxes },
  { label: 'Timeline', to: '/timeline', icon: Clock3 },
  { label: 'Alerts', to: '/alerts', icon: Bell },
  { label: 'Servers', to: '/servers', icon: Server },
  { label: 'Config', to: '/config', icon: SlidersHorizontal },
  { label: 'Settings', to: '/settings', icon: Settings }
];

function isActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/projects') return pathname.startsWith('/projects');
  return pathname === to;
}

export function Sidebar() {
  const location = useLocation();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}>
          <SquareTerminal color={colors.text} size={18} strokeWidth={2} />
        </View>
        <Text style={styles.brand}>homelab</Text>
      </View>

      <View style={styles.navList}>
        {NAV.map(({ label, to, icon: NavIcon }) => {
          const active = isActive(location.pathname, to);

          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <View style={[styles.navItem, active && styles.navItemActive]}>
                <NavIcon color={active ? colors.accent : colors.muted} size={18} strokeWidth={2} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
              </View>
            </Link>
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

const styles = StyleSheet.create({
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
  navText: {
    color: colors.muted,
    fontFamily: monoStack,
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
  }
});
