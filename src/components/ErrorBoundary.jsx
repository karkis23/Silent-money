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
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.compact) {
                return (
                    <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Module Offline</h3>
                        <p className="text-[10px] text-red-700 font-bold mb-4 uppercase tracking-wider">This intel sector is temporarily unavailable</p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-4 py-2 bg-red-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all"
                        >
                            Retry Uplink
                        </button>
                    </div>
                );
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h1 className="text-3xl font-black text-charcoal-950 mb-4 tracking-tight">System Interrupted</h1>
                        <p className="text-charcoal-600 mb-8 font-medium">
                            An unexpected deviation occurred in the command center. Our engineers have been notified.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-full py-4 text-sm shadow-xl shadow-primary-200"
                        >
                            Re-initialize Command
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
