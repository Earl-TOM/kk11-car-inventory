import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          border: '2px solid #1A1A1A',
          borderRadius: '0px',
          color: '#1A1A1A',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        },
      }}
    />
  );
}