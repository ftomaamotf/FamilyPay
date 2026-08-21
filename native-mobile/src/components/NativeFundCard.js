import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Eye, EyeOff, ShieldCheck, Lock, Sparkles } from 'lucide-react-native';
import { COLORS } from '../utils/theme';
import { formatMoney } from '../utils/formatters';

export const NativeFundCard = ({ card, currency, isFrozen, onToggleHideBalance }) => {
  const [showBalance, setShowBalance] = useState(true);

  if (!card) return null;

  const balance = card.balance || 0;

  return (
    <LinearGradient
      colors={['#064e3b', '#047857', '#022c22']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardContainer}
    >
      {/* Top Row: Bank Name & Freeze/Active Status */}
      <View style={styles.topRow}>
        <View style={styles.bankBadge}>
          <CreditCard size={14} color='#6ee7b7' />
          <Text style={styles.bankName}>{card.bankName || 'ماستر كي / Qi Card'}</Text>
        </View>

        {isFrozen ? (
          <View style={[styles.statusBadge, styles.frozenBadge]}>
            <Lock size={12} color='#fecdd3' />
            <Text style={styles.frozenText}>مجمدة أمنياً</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <ShieldCheck size={12} color='#a7f3d0' />
            <Text style={styles.activeText}>نشطة للإرسال</Text>
          </View>
        )}
      </View>

      {/* Center: Available Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>رصيد الصندوق المشترك المتاح</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {showBalance ? formatMoney(balance, currency) : '•••••••• د.ع'}
          </Text>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowBalance(!showBalance)}
          >
            {showBalance ? (
              <EyeOff size={18} color='#a7f3d0' />
            ) : (
              <Eye size={18} color='#a7f3d0' />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom: Card Holder & Account Number */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.holderLabel}>صاحب الحساب</Text>
          <Text style={styles.holderName}>{card.cardHolder || 'صندوق العائلة المشترك'}</Text>
        </View>

        <View style={styles.accountCol}>
          <Text style={styles.accountLabel}>رقم البطاقة</Text>
          <Text style={styles.accountNumber}>
            •••• {String(card.accountNumber || '').slice(-4) || '6981'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6
  },
  bankName: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)'
  },
  activeText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '700'
  },
  frozenBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.3)'
  },
  frozenText: {
    color: '#fda4af',
    fontSize: 10,
    fontWeight: '700'
  },
  balanceSection: {
    marginVertical: 18
  },
  balanceLabel: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right'
  },
  balanceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  eyeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12
  },
  holderLabel: {
    color: '#6ee7b7',
    fontSize: 9,
    fontWeight: '600'
  },
  holderName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  accountCol: {
    alignItems: 'flex-end'
  },
  accountLabel: {
    color: '#6ee7b7',
    fontSize: 9,
    fontWeight: '600'
  },
  accountNumber: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace'
  }
});
