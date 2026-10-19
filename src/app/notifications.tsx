import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Clock, ShieldCheck, CircleCheck, Trash2, X } from 'lucide-react-native';
import { AppText, Card, Header, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

const icons = { security: ShieldCheck, payment: CircleCheck, reminder: Clock } as const;

const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export default function NotificationsScreen() {
  const { theme } = useUnistyles();
  const { notifications, readNotifications, deleteNotification } = useStore();

  useEffect(() => {
    const t = setTimeout(() => readNotifications(), 800);
    return () => clearTimeout(t);
  }, [readNotifications]);

  return (
    <Screen scroll>
      <Header title="Notification" />
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyArt}>
            <X size={56} color={theme.colors.brandDark} strokeWidth={3} />
          </View>
          <AppText variant="h5" weight="semiBold" align="center">
            No Notifications
          </AppText>
          <AppText variant="body" tone="secondary" align="center" style={styles.emptyBody}>
            Stay informed with instant notifications about any updates or changes to your transactions plan
          </AppText>
        </View>
      ) : (
        <>
          <AppText variant="body" weight="semiBold" style={styles.day}>
            Today
          </AppText>
          {notifications.map((n) => {
            const Icon = icons[n.kind];
            return (
              <Card key={n.id} style={[styles.item, !n.read && styles.unread]}>
                <View style={styles.icon}>
                  <Icon size={18} color={theme.colors.text} />
                </View>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <AppText variant="body" weight="semiBold" style={styles.title}>
                      {n.title}
                    </AppText>
                    <AppText variant="captionL" tone="secondary">
                      {ago(n.at)}
                    </AppText>
                  </View>
                  <AppText variant="captionL" tone="secondary">
                    {n.body}
                  </AppText>
                </View>
                <Pressable hitSlop={8} onPress={() => deleteNotification(n.id)} style={styles.delete}>
                  <Trash2 size={16} color={theme.colors.danger} />
                </Pressable>
              </Card>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  day: { marginBottom: theme.spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  unread: { backgroundColor: theme.colors.brand },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.stroke.soft },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm },
  title: { flex: 1 },
  delete: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyArt: { width: 160, height: 160, borderRadius: 80, backgroundColor: theme.colors.brand, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xxl },
  emptyBody: { marginTop: theme.spacing.sm, maxWidth: 300 },
}));
