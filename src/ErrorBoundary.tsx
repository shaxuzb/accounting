import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button, Result } from "antd";
import i18n from "@/config/i18n";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title={i18n.t("error.title")}
          subTitle={this.state.message}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              {i18n.t("error.reload")}
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
