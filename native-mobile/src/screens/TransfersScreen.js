import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { TrendingUp, Search, Calendar, User, Tag, ArrowUpRight } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { COLORS } from '../utils/theme';
import { formatMoney, formatDateArabic } from '../utils/formatters';

export const TransfersScreen = () => {
  const { transfers, currency } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = transfers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      (t.recipientName && t.recipientName.toLowerCase().includes(q)) ||
      (t.reason && t.reason.toLowerCase().includes(q)) ||
      (t.fieldName && t.fieldName.toLowerCase().includes(q)) ||
      (String(t.amount).includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سجل التحويلات والعمليات 📋</Text>
        <Text style={styles.headerSub}>كشف حساب تفصيلي لجميع مصروفات الصندوق</Text>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Search size={16} color='#64748b' />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder='بحث باسم الأخ، السلعة، أو المبلغ...'
            placeholderTextColor='#64748b'
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredTransfers.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txTop}>
              <Text style={styles.txAmount}>{formatMoney(tx.amount, currency)}</Text>
              <View style={styles.recipientBadge}>
                <Text style={styles.recipientName}>{tx.recipientName}</Text>
                <ArrowUpRight size={14} color='#10b981' />
              </View>
            </View>

            <View style={styles.txBottom}>
              <Text style={styles.txReason}>الحاجة: {tx.reason}</Text>
              <View style={styles.txMeta}>
                {tx.fieldName && (
                  <View style={styles.fieldBadge}>
                    <Text style={styles.fieldText}>{tx.fieldName}</Text>
                  </View>
                )}
                <Text style={styles.txDate}>{formatDateArabic(tx.timestamp || tx.date)}</Text>
              </View>
            </View>
          </View>
        ))}

        {filteredTransfers.length === 0 && (
          <View style={styles.emptyBox}>
            <TrendingUp size={44} color='#334155' />
            <Text style={styles.emptyText}>لا توجد تحويلات مطابقة للبحث</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1320'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
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
    textAlign: 'right',
    marginBottom: 12
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131f33',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'right',
    marginLeft: 8
  },
  scroll: {
    padding: 16,
    paddingBottom: 40
  },
  txCard: {
    backgroundColor: '#131f33',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  txAmount: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  recipientName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  txBottom: {
    borderTopWidth: 1,
    borderColor: '#1e293b',
    paddingTop: 8
  },
  txReason: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right'
  },
  txMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  txDate: {
    color: '#64748b',
    fontSize: 10
  },
  fieldBadge: {
    backgroundColor: '#0a101d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  fieldText: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '700'
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700'
  }
});
