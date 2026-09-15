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
  Users,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Phone
} from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { COLORS } from '../utils/theme';
import { formatMoney, formatDateArabic } from '../utils/formatters';

export const BrothersScreen = () => {
  const {
    brothers,
    transfers,
    currency,
    isCurrentAdmin,
    updateBrotherFields,
    editTransfer,
    deleteTransfer
  } = useFinance();

  // Selected Brother for Commodity Management Modal
  const [selectedBrother, setSelectedBrother] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLimit, setNewFieldLimit] = useState('');

  // Expandable Commodity Requests History State
  const [expandedFieldId, setExpandedFieldId] = useState(null);

  // Edit Transfer State
  const [editingTransferId, setEditingTransferId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');

  // Add new field
  const handleAddField = async () => {
    if (!newFieldName.trim() || !newFieldLimit) return;
    const newField = {
      id: 'f-' + Date.now(),
      name: newFieldName.trim(),
      limit: Number(newFieldLimit) || 0,
      spent: 0
    };
    const updated = [...(selectedBrother.approvedFields || []), newField];
    await updateBrotherFields(selectedBrother.id, updated);
    setSelectedBrother({ ...selectedBrother, approvedFields: updated });
    setNewFieldName('');
    setNewFieldLimit('');
  };

  // Delete commodity field
  const handleDeleteField = async (fieldId, fieldName) => {
    Alert.alert(
      'حذف السلعة',
      هل أنت متأكد من حذف سلعة [] بالكامل للأخ ؟,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updated = (selectedBrother.approvedFields || []).filter((f) => f.id !== fieldId);
            await updateBrotherFields(selectedBrother.id, updated);
            setSelectedBrother({ ...selectedBrother, approvedFields: updated });
          }
        }
      ]
    );
  };

  // Delete single transfer
  const handleDeleteTx = (txId, amount, reason) => {
    Alert.alert(
      'حذف الطلب واسترجاع المبلغ',
      هل تريد حذف هذا الطلب بمبلغ () لحاجة [] واسترجاع المبلغ للصندوق؟,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف واسترجاع',
          style: 'destructive',
          onPress: async () => {
            await deleteTransfer(txId);
          }
        }
      ]
    );
  };

  // Save edited transfer
  const handleSaveEditTx = async (txId) => {
    if (!editAmount || Number(editAmount) <= 0) return;
    await editTransfer(txId, {
      amount: Number(editAmount),
      reason: editReason.trim()
    });
    setEditingTransferId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>بطاقات الإخوة والسلع 👥</Text>
          <Text style={styles.headerSub}>متابعة المخصصات، والسلع المعتمدة، وسجل الطلبات</Text>
        </View>

        {/* Brothers Cards List */}
        {brothers.map((b) => {
          const brotherTransfers = transfers.filter((t) => t.recipientId === b.id);
          const totalReceived = brotherTransfers.reduce((s, t) => s + (Number(t.amount) || 0), 0);

          return (
            <View key={b.id} style={styles.brotherCard}>
              
              {/* Brother Info Header */}
              <View style={styles.brotherHeader}>
                {isCurrentAdmin && (
                  <TouchableOpacity
                    style={styles.manageBtn}
                    onPress={() => {
                      setSelectedBrother(b);
                      setModalVisible(true);
                    }}
                  >
                    <Sliders size={13} color='#6ee7b7' />
                    <Text style={styles.manageBtnText}>إدارة وتعديل السلع</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.brotherInfo}>
                  <View>
                    <Text style={styles.brotherName}>{b.name}</Text>
                    <Text style={styles.brotherPhone}>{b.phone || b.accountNumber}</Text>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: b.avatarColor || '#10b981' }]}>
                    <Text style={styles.avatarText}>{(b.name || 'ع')[0]}</Text>
                  </View>
                </View>
              </View>

              {/* Total Received Summary */}
              <View style={styles.totalRow}>
                <Text style={styles.totalValue}>{formatMoney(totalReceived, currency)}</Text>
                <Text style={styles.totalLabel}>إجمالي ما استلمه هذا الشهر:</Text>
              </View>

              {/* Approved Commodities Section */}
              <View style={styles.commoditiesSection}>
                <Text style={styles.commoditiesTitle}>
                  السلع والحقول المعتمدة ({b.approvedFields?.length || 0}):
                </Text>

                {b.approvedFields?.map((f) => {
                  const spent = f.spent || 0;
                  const limit = f.limit || 0;
                  const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                  const isExpanded = expandedFieldId === f.id;

                  // Get chronological requests for this specific commodity
                  const fieldTxList = brotherTransfers.filter(
                    (t) => t.fieldId === f.id || (t.fieldName && t.fieldName.includes(f.name.split(' ')[0]))
                  );

                  return (
                    <View key={f.id} style={styles.commodityItem}>
                      
                      {/* Commodity Top: Name & Sent Amount */}
                      <View style={styles.commodityHeader}>
                        <View style={styles.commoditySent}>
                          <Text style={styles.sentLabel}>المرسل:</Text>
                          <Text style={styles.sentAmount}>{formatMoney(spent, currency)}</Text>
                          <Text style={styles.limitAmount}>/ {formatMoney(limit, currency)}</Text>
                        </View>

                        <Text style={styles.commodityName}>{f.name}</Text>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: ${percent}%,
                              backgroundColor: percent >= 100 ? '#f43f5e' : percent >= 80 ? '#f59e0b' : '#10b981'
                            }
                          ]}
                        />
                      </View>

                      {/* Expand Requests History Button */}
                      <TouchableOpacity
                        style={styles.expandHistoryBtn}
                        onPress={() => setExpandedFieldId(isExpanded ? null : f.id)}
                      >
                        {isExpanded ? <ChevronUp size={14} color='#94a3b8' /> : <ChevronDown size={14} color='#94a3b8' />}
                        <Text style={styles.expandHistoryText}>
                          سجل طلبات هذه السلعة ({fieldTxList.length} طلبات)
                        </Text>
                      </TouchableOpacity>

                      {/* Itemized Requests Breakdown */}
                      {isExpanded && (
                        <View style={styles.historyDrawer}>
                          {fieldTxList.map((tx, idx) => {
                            const isEditing = editingTransferId === tx.id;

                            return (
                              <View key={tx.id} style={styles.txRow}>
                                {isEditing ? (
                                  <View style={styles.editTxBox}>
                                    <TextInput
                                      value={editAmount}
                                      onChangeText={setEditAmount}
                                      placeholder='المبلغ'
                                      keyboardType='numeric'
                                      style={styles.editInput}
                                    />
                                    <TextInput
                                      value={editReason}
                                      onChangeText={setEditReason}
                                      placeholder='السبب'
                                      style={styles.editInput}
                                    />
                                    <View style={styles.editActions}>
                                      <TouchableOpacity
                                        style={styles.saveEditBtn}
                                        onPress={() => handleSaveEditTx(tx.id)}
                                      >
                                        <Check size={14} color='#ffffff' />
                                        <Text style={styles.saveEditText}>حفظ</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={styles.cancelEditBtn}
                                        onPress={() => setEditingTransferId(null)}
                                      >
                                        <Text style={styles.cancelEditText}>إلغاء</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                ) : (
                                  <View style={styles.txViewRow}>
                                    {isCurrentAdmin && (
                                      <View style={styles.txActions}>
                                        <TouchableOpacity
                                          onPress={() => {
                                            setEditingTransferId(tx.id);
                                            setEditAmount(String(tx.amount));
                                            setEditReason(tx.reason);
                                          }}
                                          style={styles.iconBtn}
                                        >
                                          <Edit2 size={13} color='#38bdf8' />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          onPress={() => handleDeleteTx(tx.id, tx.amount, tx.reason)}
                                          style={styles.iconBtn}
                                        >
                                          <Trash2 size={13} color='#f43f5e' />
                                        </TouchableOpacity>
                                      </View>
                                    )}

                                    <View style={styles.txInfo}>
                                      <Text style={styles.txAmount}>
                                        طلب #{idx + 1}: {formatMoney(tx.amount, currency)}
                                      </Text>
                                      <Text style={styles.txReason}>{tx.reason}</Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                            );
                          })}

                          {fieldTxList.length === 0 && (
                            <Text style={styles.noTxText}>لا توجد طلبات مسجلة لهذه السلعة بعد</Text>
                          )}
                        </View>
                      )}

                    </View>
                  );
                })}

                {(!b.approvedFields || b.approvedFields.length === 0) && (
                  <Text style={styles.noFieldsText}>لا توجد سلع مخصصة لهذا الأخ حالياً</Text>
                )}
              </View>

            </View>
          );
        })}

      </ScrollView>

      {/* Admin Commodity Management Modal */}
      {selectedBrother && (
        <Modal
          visible={modalVisible}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color='#ffffff' />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>إدارة سلع: {selectedBrother.name}</Text>
              </View>

              <ScrollView style={styles.modalScroll}>
                
                {/* Add Commodity Form */}
                <View style={styles.addFieldBox}>
                  <Text style={styles.addSectionTitle}>إضافة سلعة جديدة للأخ:</Text>
                  <TextInput
                    value={newFieldName}
                    onChangeText={setNewFieldName}
                    placeholder='اسم السلعة (مثلاً: بنزين ومواصلات ⛽)'
                    placeholderTextColor='#64748b'
                    style={styles.addInput}
                  />
                  <TextInput
                    value={newFieldLimit}
                    onChangeText={setNewFieldLimit}
                    placeholder={السقف المالي ()}
                    placeholderTextColor='#64748b'
                    keyboardType='numeric'
                    style={styles.addInput}
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddField}>
                    <Plus size={16} color='#ffffff' />
                    <Text style={styles.addBtnText}>إضافة السلعة</Text>
                  </TouchableOpacity>
                </View>

                {/* List of current fields with delete */}
                <Text style={styles.listTitle}>السلع الحالية:</Text>
                {selectedBrother.approvedFields?.map((f) => (
                  <View key={f.id} style={styles.modalFieldRow}>
                    <TouchableOpacity
                      onPress={() => handleDeleteField(f.id, f.name)}
                      style={styles.deleteFieldBtn}
                    >
                      <Trash2 size={16} color='#f43f5e' />
                    </TouchableOpacity>
                    <View style={styles.fieldInfo}>
                      <Text style={styles.modalFieldName}>{f.name}</Text>
                      <Text style={styles.modalFieldLimit}>السقف: {formatMoney(f.limit, currency)}</Text>
                    </View>
                  </View>
                ))}

              </ScrollView>

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
  brotherCard: {
    backgroundColor: '#131f33',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  brotherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brotherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brotherName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right'
  },
  brotherPhone: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
    fontFamily: 'monospace'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4
  },
  manageBtnText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '800'
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700'
  },
  totalValue: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  commoditiesSection: {
    marginTop: 12
  },
  commoditiesTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 8
  },
  commodityItem: {
    backgroundColor: '#0a101d',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  commodityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  commodityName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  commoditySent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  sentLabel: {
    color: '#64748b',
    fontSize: 10
  },
  sentAmount: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  limitAmount: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 5,
    marginVertical: 8,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5
  },
  expandHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4
  },
  expandHistoryText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700'
  },
  historyDrawer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#1e293b'
  },
  txRow: {
    backgroundColor: '#131f33',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6
  },
  txViewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  txInfo: {
    alignItems: 'flex-end',
    flex: 1
  },
  txAmount: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  txReason: {
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 2
  },
  txActions: {
    flexDirection: 'row',
    gap: 6
  },
  iconBtn: {
    padding: 6,
    backgroundColor: '#0a101d',
    borderRadius: 8
  },
  editTxBox: {
    gap: 6
  },
  editInput: {
    backgroundColor: '#0a101d',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 34,
    fontSize: 11,
    textAlign: 'right'
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  saveEditText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  cancelEditBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  cancelEditText: {
    color: '#cbd5e1',
    fontSize: 11
  },
  noTxText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    paddingVertical: 4
  },
  noFieldsText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6
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
    maxHeight: '85%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    paddingBottom: 14,
    marginBottom: 14
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  },
  modalScroll: {
    maxHeight: 400
  },
  addFieldBox: {
    backgroundColor: '#0a101d',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16
  },
  addSectionTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 8
  },
  addInput: {
    backgroundColor: '#131f33',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  addBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    gap: 6
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  listTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 8
  },
  modalFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a101d',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8
  },
  fieldInfo: {
    alignItems: 'flex-end'
  },
  modalFieldName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  modalFieldLimit: {
    color: '#64748b',
    fontSize: 11
  },
  deleteFieldBtn: {
    padding: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 8
  }
});
