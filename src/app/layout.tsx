import "../styles/globals.css";
import type { ReactNode } from 'react';
import AppRouter from '@/routes/AppRouter';
import { AuthProvider } from '@/context/AuthContext';

// El AuthProvider envuelve toda la app para manejar la autenticacion :)
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased text-slate-950">
        <AuthProvider>
          <AppRouter>{children}</AppRouter>
        </AuthProvider>
      </body>
    </html>
  );
}
