import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
        <span className="rounded-full bg-red-500/10 p-3 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-red-700 dark:text-red-300">
            Something went wrong
          </h2>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {this.state.error?.message || "An unexpected error occurred while rendering this view."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={this.reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }
}
