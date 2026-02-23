import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
        this.setState({ errorInfo });
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

            const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown error';
            const errorStack = this.state.errorInfo?.componentStack || this.state.error?.stack || '';

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
                    <div className="max-w-2xl w-full">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Application Error</h1>
                        </div>

                        {/* ERROR MESSAGE - Large and readable */}
                        <div className="bg-red-600 text-white rounded-xl p-4 mb-4">
                            <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-75">Error Message:</div>
                            <div className="text-base font-bold break-words">{errorMessage}</div>
                        </div>

                        {/* COMPONENT STACK - Where in the tree */}
                        {errorStack && (
                            <div className="bg-gray-900 text-green-400 rounded-xl p-4 mb-6 overflow-auto max-h-64">
                                <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">Component Stack:</div>
                                <pre className="text-xs whitespace-pre-wrap font-mono">{errorStack}</pre>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl uppercase tracking-widest transition-all"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
