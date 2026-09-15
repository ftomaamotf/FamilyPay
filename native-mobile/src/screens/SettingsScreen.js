import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import {
  Sliders,
  ShieldCheck,
  Lock,
  DollarSign,
  Users,
  LogOut,
  KeyRound,
  Info
} from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { COLORS } from '../utils/theme';
import { formatMoney } from '../utils/formatters';

export const SettingsScreen = () => {
  const {
    currentUser,
    isCurrentAdmin,
    security,
    currency,
    monthlyFundAmount,
    logout
  } = useFinance();

  const [isFrozen, setIsFrozen] = useState(security.isCardFrozen);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إعدادات وأمان الصندوق ⚙️</Text>
          <Text style={styles.headerSub}>التحكم في الأذونات، رمز الحماية، والبطاقة</Text>
        </View>

        {/* Current User Info Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>الحساب الحالي</Text>
          <View style={styles.row}>
            <Text style={styles.valText}>{currentUser?.name}</Text>
            <Text style={styles.lblText}>اسم المستخدم:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.valText}>{currentUser?.email || currentUser?.phone}</Text>
            <Text style={styles.lblText}>البريد / الهاتف:</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.valText, { color: isCurrentAdmin ? '#fbbf24' : '#10b981' }]}>
              {isCurrentAdmin ? '👑 أدمن رئيسي للصندوق' : 'عضو في الصندوق'}
            </Text>
            <Text style={styles.lblText}>الصلاحية:</Text>
          </View>
        </View>

        {/* Security & Fund Protection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>الأمان والتحكم المالي 🔒</Text>

          <View style={styles.row}>
            <Text style={styles.valText}>•••• ({security.fundPin || '9988'})</Text>
            <Text style={styles.lblText}>الرمز السري للصندوق (PIN):</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.valText}>{formatMoney(monthlyFundAmount, currency)}</Text>
            <Text style={styles.lblText}>الميزانية الشهرية المعتمدة:</Text>
          </View>
        </View>

        {/* Server & Cloud Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>معلومات السيرفر السحابي ☁️</Text>
          <View style={styles.row}>
            <Text style={[styles.valText, { color: '#10b981' }]}>متصل 24/7 (Live 🟢)</Text>
            <Text style={styles.lblText}>حالة السيرفر:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.valText}>familypay-aw26.onrender.com</Text>
            <Text style={styles.lblText}>الرابط السحابي:</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color='#ffffff' />
          <Text style={styles.logoutText}>تسجيل الخروج من الحساب</Text>
        </TouchableOpacity>

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
    padding: 16,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'right'
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right'
  },
  sectionCard: {
    backgroundColor: '#131f33',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  lblText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700'
  },
  valText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace'
  },
  logoutBtn: {
    backgroundColor: '#e11d48',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 14
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900'
  }
});
