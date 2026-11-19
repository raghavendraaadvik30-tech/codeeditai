// StartupErrorBoundary.tsx
// PURPOSE: If any screen crashes while rendering, show the error message
// and a "Reload" button instead of a blank white page. This matters most in
// the mobile app, where there is no browser console to look at.

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class StartupErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <StartupErrorScreen message={this.state.error.message} />
  }
}

export function StartupErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#EEF7FF] p-6 text-[#172033]">
      <div className="w-full max-w-md rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          The app hit an error. Please reload. If it keeps happening, send this
          message to support:
        </p>
        <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-[#F1F5F9] p-3 text-xs break-words whitespace-pre-wrap">
          {message || "Unknown error"}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 h-11 w-full rounded-xl bg-[#324480] text-sm font-semibold text-white"
        >
          Reload
        </button>
      </div>
    </div>
  )
}
