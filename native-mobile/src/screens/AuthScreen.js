import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Mail, Lock, Fingerprint, Sparkles, ArrowRight } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { COLORS } from '../utils/theme';

export const AuthScreen = () => {
  const { login, authenticateBiometrics } = useFinance();
  const [identifier, setIdentifier] = useState('abduallh_ajmi@yahoo.com');
  const [password, setPassword] = useState('1988');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('يرجى كتابة البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    const res = await authenticateBiometrics();
    if (!res.success && res.message) {
      setErrorMsg(res.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#022c22', '#0b1320', '#0b1320']}
        style={styles.gradientBg}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* App Header & Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBadge}>
              <ShieldCheck size={36} color='#10b981' />
            </View>
            <Text style={styles.appName}>FamilyPay</Text>
            <Text style={styles.appTagline}>الصندوق المالي والحساب المشترك للعائلة</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>تسجيل الدخول للنظام 🔐</Text>
            <Text style={styles.cardSub}>أدخل بريدك الإلكتروني أو رقم الهاتف المسجل</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Email / Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني أو رقم الهاتف</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color='#64748b' style={styles.inputIcon} />
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder='abduallh_ajmi@yahoo.com'
                  placeholderTextColor='#475569'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color='#64748b' style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='••••••'
                  placeholderTextColor='#475569'
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color='#ffffff' />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>دخول إلى الصندوق 🚀</Text>
                    <ArrowRight size={18} color='#ffffff' />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Biometric / Fingerprint Button */}
            <TouchableOpacity
              style={styles.bioBtn}
              onPress={handleBiometricLogin}
            >
              <Fingerprint size={22} color='#10b981' />
              <Text style={styles.bioBtnText}>دخول سريع بالبصمة / Face ID</Text>
            </TouchableOpacity>

          </View>

          {/* Footer Note */}
          <Text style={styles.footerText}>
            FamilyPay Cloud FinTech • سيرفر سحابي مشفر 24/7
          </Text>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradientBg: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  appTagline: {
    fontSize: 13,
    color: '#6ee7b7',
    fontWeight: '600',
    marginTop: 4
  },
  card: {
    backgroundColor: '#131f33',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'right'
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 18,
    textAlign: 'right'
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    color: '#fda4af',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a101d',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right'
  },
  loginBtn: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden'
  },
  btnGradient: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900'
  },
  bioBtn: {
    marginTop: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8
  },
  bioBtnText: {
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: '700'
  },
  footerText: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 24
  }
});
