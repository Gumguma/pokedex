import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary tangkap crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-line shadow-[0_1px_2px_rgba(17,24,39,.03)] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center text-xl">
              ⚠️
            </div>
            <h2 className="text-base font-extrabold m-0">Terjadi Kendala Tampilan</h2>
            <p className="text-xs text-slate-500 m-0 leading-relaxed">
              {this.state.error?.message || 'Terjadi error tidak terduga pada komponen UI.'}
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-2.5 rounded-xl border border-line hover:bg-indigo-50 hover:text-indigo-700 text-xs font-bold cursor-pointer"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 py-2.5"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
