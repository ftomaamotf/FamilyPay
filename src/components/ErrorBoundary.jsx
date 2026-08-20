import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-black text-white">
              جاري تحديث واجهة الصندوق والحسابات
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              تم تحديث نظام الصندوق، اضغط على الزر أدناه لتحديث الذاكرة المؤقتة والتشغيل المباشر.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-rose-400 text-left font-mono overflow-x-auto max-h-28" dir="ltr">
                {this.state.error?.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>تحديث وتشغيل البرنامج الآن 🚀</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
