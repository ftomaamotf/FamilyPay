import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import {
  Send,
  Inbox,
  Share2,
  Sliders,
  LogOut,
  TrendingUp,
  CreditCard,
  Users,
  AlertCircle
} from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { NativeFundCard } from '../components/NativeFundCard';
import { COLORS } from '../utils/theme';
import { formatMoney } from '../utils/formatters';

export const DashboardScreen = ({ navigation }) => {
  const {
    currentUser,
    isCurrentAdmin,
    sendingCard,
    currency,
    brothers,
    transfers,
    fundRequests,
    monthlyFundAmount,
    refreshing,
    fetchFundState,
    logout,
    security
  } = useFinance();

  const totalSpentMonth = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const remainingBudget = Math.max(0, monthlyFundAmount - totalSpentMonth);
  const pendingRequestsCount = fundRequests.filter((r) => r.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchFundState}
            tintColor='#10b981'
          />
        }
      >
        {/* Top User Welcome & Logout Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut size={16} color='#f43f5e' />
            <Text style={styles.logoutText}>خروج</Text>
          </TouchableOpacity>

          <View style={styles.userProfile}>
            <View>
              <Text style={styles.greetingText}>مرحباً بك،</Text>
              <Text style={styles.userName}>{currentUser?.name || 'عبدالله عجمي'}</Text>
            </View>
            <View
              style={[
                styles.userAvatar,
                { backgroundColor: currentUser?.avatarColor || '#10b981' }
              ]}
            >
              <Text style={styles.avatarLetter}>
                {(currentUser?.name || 'ع')[0]}
              </Text>
            </View>
          </View>
        </View>

        {/* Pending Requests Alert Banner (For Admin) */}
        {isCurrentAdmin && pendingRequestsCount > 0 && (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => navigation.navigate('Requests')}
          >
            <AlertCircle size={20} color='#fbbf24' />
            <Text style={styles.pendingText}>
              يوجد {pendingRequestsCount} طلبات أموال جديدة بانتظار موافقتك
            </Text>
          </TouchableOpacity>
        )}

        {/* The Native Fund Card */}
        <NativeFundCard
          card={sendingCard}
          currency={currency}
          isFrozen={security.isCardFrozen}
        />

        {/* Real-time 4 Stats Counters */}
        <View style={styles.countersGrid}>
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>الميزانية الشهرية</Text>
            <Text style={[styles.counterValue, { color: '#38bdf8' }]}>
              {formatMoney(monthlyFundAmount, currency)}
            </Text>
          </View>

          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>إجمالي المصروف</Text>
            <Text style={[styles.counterValue, { color: '#f43f5e' }]}>
              {formatMoney(totalSpentMonth, currency)}
            </Text>
          </View>

          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>المتبقي من الصندوق</Text>
            <Text style={[styles.counterValue, { color: '#10b981' }]}>
              {formatMoney(remainingBudget, currency)}
            </Text>
          </View>

          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>عدد الإخوة المسجلين</Text>
            <Text style={[styles.counterValue, { color: '#fbbf24' }]}>
              {brothers.length} إخوة
            </Text>
          </View>
        </View>

        {/* Quick Action Navigation Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>العمليات السريعة ⚡</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#059669' }]}
              onPress={() => navigation.navigate('Brothers')}
            >
              <Users size={22} color='#ffffff' />
              <Text style={styles.actionBtnText}>بطاقات الإخوة والسلع</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
              onPress={() => navigation.navigate('Requests')}
            >
              <Inbox size={22} color='#ffffff' />
              <Text style={styles.actionBtnText}>طلبات الأموال</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#475569' }]}
              onPress={() => navigation.navigate('Transfers')}
            >
              <TrendingUp size={22} color='#ffffff' />
              <Text style={styles.actionBtnText}>سجل العمليات والتحويلات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#334155' }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Sliders size={22} color='#ffffff' />
              <Text style={styles.actionBtnText}>إعدادات وأمان الصندوق</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1320'
  },
  scroll: {
    paddingBottom: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  greetingText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right'
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right'
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6
  },
  logoutText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '800'
  },
  pendingAlert: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10
  },
  pendingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right'
  },
  countersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginVertical: 6
  },
  counterCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#131f33',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  counterLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 4
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    fontFamily: 'monospace'
  },
  actionsSection: {
    marginTop: 14,
    paddingHorizontal: 16
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 10
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  actionBtn: {
    flex: 1,
    height: 72,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center'
  }
});
