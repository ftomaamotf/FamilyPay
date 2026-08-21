import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView
} from 'react-native';
import {
  Inbox,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  CreditCard,
  Send
} from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { COLORS } from '../utils/theme';
import { formatMoney, formatDateArabic } from '../utils/formatters';

export const RequestsScreen = () => {
  const {
    currentUser,
    isCurrentAdmin,
    fundRequests,
    currency,
    submitMoneyRequest,
    approveMoneyRequest,
    rejectMoneyRequest
  } = useFinance();

  // Create Request Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');

  // Approve Modal State (Admin)
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [securityPin, setSecurityPin] = useState('');

  // Reject Modal State (Admin)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Quick category suggestions
  const presetCategories = [
    'بنزين ومواصلات ⛽',
    'حليب ومواد غذائية 🥛',
    'صيدلية وأطباء 🩺',
    'فواتير وانترنت ⚡',
    'صيانة منزلية 🔧',
    'أولاد وتعليم 📚'
  ];

  const handleCreateRequest = async () => {
    if (!reqAmount || Number(reqAmount) <= 0 || !reqReason.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة المبلغ والسبب بوضوح');
      return;
    }
    const res = await submitMoneyRequest({
      amount: reqAmount,
      reason: reqReason
    });
    if (res.success) {
      setCreateModalVisible(false);
      setReqAmount('');
      setReqReason('');
      Alert.alert('نجاح', 'تم إرسال طلبك إلى الأدمن بنجاح');
    } else {
      Alert.alert('خطأ', res.message);
    }
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    const res = await approveMoneyRequest(selectedReq.id, selectedReq.fieldId, securityPin || '9988');
    if (res.success) {
      setApproveModalVisible(false);
      setSelectedReq(null);
      setSecurityPin('');
      Alert.alert('نجاح', res.message);
    } else {
      Alert.alert('خطأ', res.message);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    const res = await rejectMoneyRequest(selectedReq.id, rejectReason || 'تم الرفض من قبل الأدمن');
    if (res.success) {
      setRejectModalVisible(false);
      setSelectedReq(null);
      setRejectReason('');
      Alert.alert('تم الرفض', res.message);
    } else {
      Alert.alert('خطأ', res.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Screen Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.newRequestBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={16} color='#ffffff' />
            <Text style={styles.newRequestText}>طلب مال جديد</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>طلبات الأموال 📩</Text>
            <Text style={styles.headerSub}>تقديم ومتابعة طلبات السلع والمصروفات</Text>
          </View>
        </View>

        {/* Requests List */}
        {fundRequests.map((r) => {
          const isPending = r.status === 'pending';
          const isApproved = r.status === 'approved';

          return (
            <View key={r.id} style={styles.requestCard}>
              <View style={styles.reqTop}>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isPending ? styles.pendingBadge : isApproved ? styles.approvedBadge : styles.rejectedBadge
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isPending ? styles.pendingText : isApproved ? styles.approvedText : styles.rejectedText
                    ]}
                  >
                    {isPending ? '⏳ بانتظار الموافقة' : isApproved ? '✅ تمت الموافقة والتحويل' : '❌ تم الرفض'}
                  </Text>
                </View>

                {/* Request Info */}
                <View style={styles.reqInfo}>
                  <Text style={styles.reqAmount}>{formatMoney(r.amount, currency)}</Text>
                  <Text style={styles.reqSender}>مقدم الطلب: {r.brotherName}</Text>
                </View>
              </View>

              <View style={styles.reqBody}>
                <Text style={styles.reqReason}>الحاجة: {r.reason}</Text>
                <Text style={styles.reqDate}>{formatDateArabic(r.createdAt)}</Text>
              </View>

              {/* Admin Actions on Pending Requests */}
              {isCurrentAdmin && isPending && (
                <View style={styles.adminActionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => {
                      setSelectedReq(r);
                      setApproveModalVisible(true);
                    }}
                  >
                    <Check size={14} color='#ffffff' />
                    <Text style={styles.actionBtnText}>موافقة وتحويل فوراً</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => {
                      setSelectedReq(r);
                      setRejectModalVisible(true);
                    }}
                  >
                    <X size={14} color='#f43f5e' />
                    <Text style={styles.rejectBtnText}>رفض</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {fundRequests.length === 0 && (
          <View style={styles.emptyBox}>
            <Inbox size={48} color='#334155' />
            <Text style={styles.emptyText}>لا توجد طلبات أموال حتى الآن</Text>
          </View>
        )}

      </ScrollView>

      {/* Create Request Modal */}
      <Modal
        visible={createModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color='#ffffff' />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تقديم طلب مال من الصندوق 💰</Text>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>المبلغ المطلوب ({currency})</Text>
              <TextInput
                value={reqAmount}
                onChangeText={setReqAmount}
                placeholder='مثلاً: 50,000'
                placeholderTextColor='#64748b'
                keyboardType='numeric'
                style={styles.modalInput}
              />

              <Text style={styles.inputLabel}>سبب الحاجة أو السلعة</Text>
              <TextInput
                value={reqReason}
                onChangeText={setReqReason}
                placeholder='مثلاً: بنزين للسيارة، مسواك طعام...'
                placeholderTextColor='#64748b'
                style={styles.modalInput}
              />

              {/* Quick Suggestion Chips */}
              <Text style={styles.chipLabel}>اقتراحات سريعة للسلع:</Text>
              <View style={styles.chipsRow}>
                {presetCategories.map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => setReqReason(cat)}
                  >
                    <Text style={styles.chipText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitReqBtn} onPress={handleCreateRequest}>
                <Send size={16} color='#ffffff' />
                <Text style={styles.submitReqText}>إرسال الطلب للأدمن 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Admin Approve Modal */}
      {selectedReq && (
        <Modal
          visible={approveModalVisible}
          animationType='fade'
          transparent={true}
          onRequestClose={() => setApproveModalVisible(false)}
        >
          <View style={styles.modalOverlayCenter}>
            <View style={styles.centerModalCard}>
              <Text style={styles.centerModalTitle}>تأكيد تحويل المال للأخ ✅</Text>
              <Text style={styles.centerModalSub}>
                سيتم خصم {formatMoney(selectedReq.amount, currency)} من بطاقة الصندوق وإرسالها إلى ({selectedReq.brotherName})
              </Text>

              <Text style={styles.inputLabel}>الرمز السري للصندوق (Fund PIN)</Text>
              <TextInput
                value={securityPin}
                onChangeText={setSecurityPin}
                placeholder='9988'
                placeholderTextColor='#64748b'
                secureTextEntry
                keyboardType='numeric'
                style={styles.modalInput}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.confirmApproveBtn} onPress={handleApprove}>
                  <Text style={styles.confirmApproveText}>تأكيد الإرسال 🚀</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setApproveModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6
  },
  newRequestText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  requestCard: {
    backgroundColor: '#131f33',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reqInfo: {
    alignItems: 'flex-end'
  },
  reqAmount: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  reqSender: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)'
  },
  pendingText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800'
  },
  approvedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  approvedText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800'
  },
  rejectedBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)'
  },
  rejectedText: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: '800'
  },
  reqBody: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#1e293b'
  },
  reqReason: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right'
  },
  reqDate: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  rejectBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4
  },
  rejectBtnText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '800'
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#131f33',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6
  },
  modalInput: {
    backgroundColor: '#0a101d',
    color: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  chipLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  chip: {
    backgroundColor: '#0a101d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  chipText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '700'
  },
  submitReqBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 8
  },
  submitReqText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900'
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  centerModalCard: {
    backgroundColor: '#131f33',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  centerModalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6
  },
  centerModalSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  confirmApproveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmApproveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900'
  },
  cancelBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontSize: 13
  }
});
