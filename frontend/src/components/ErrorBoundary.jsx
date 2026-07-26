import { Component } from "react";

// Global error boundary: catches render/lifecycle errors anywhere in the tree and
// shows a friendly fallback instead of a blank white screen.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught UI error:", error, info);
  }

  handleReload = () => {
    // Reset and send the user back to a known-good page.
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f5f5f3] px-6 text-center text-black"
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/60">Aveniq</p>
          <h1 className="text-2xl font-light uppercase tracking-[0.2em] sm:text-3xl">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-black/70">
            An unexpected error occurred. You can return to the homepage and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="border border-black bg-black px-8 py-3 text-[11px] font-medium uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Return home
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
