import React from 'react';
import { Button } from '../ui/Button.jsx';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
              <p className="text-xs text-slate-500">
                An unexpected user interface exception occurred. You can reload the page or return to the dashboard.
              </p>
            </div>
            {this.state.error?.message && (
              <pre className="text-[11px] bg-slate-50 p-2.5 rounded-lg text-slate-600 font-mono text-left overflow-x-auto max-h-28 border border-slate-200">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                leftIcon={RotateCcw}
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

