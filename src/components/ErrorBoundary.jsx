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
            return (
                <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h1 className="text-3xl font-black text-charcoal-950 mb-4 tracking-tight">System Interrupted</h1>
                        <p className="text-charcoal-600 mb-8 font-medium">
                            An unexpected error occurred in the command center. Our engineers have been notified.
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
