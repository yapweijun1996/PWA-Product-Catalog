export type Notice = { tone: 'success' | 'error' | 'info'; message: string } | null;

interface ToastProps {
  notice: Notice;
}

export function Toast({ notice }: ToastProps) {
  if (!notice) return null;
  return (
    <div className={`toast toast-${notice.tone}`} role="status">
      {notice.message}
    </div>
  );
}
