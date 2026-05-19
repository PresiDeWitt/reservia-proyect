import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="container"
          style={{ padding: '120px 24px', textAlign: 'center' }}
        >
          <span className="mat" style={{ fontSize: 56, color: 'var(--ink-40)', display: 'block', marginBottom: 16 }}>
            error_outline
          </span>
          <h1 className="editorial" style={{ fontSize: 40, fontWeight: 300 }}>
            Algo salió mal
          </h1>
          <p style={{ color: 'var(--ink-55)', marginTop: 12 }}>
            Ha ocurrido un error inesperado en esta página.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 28 }}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
