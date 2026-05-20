"use client";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

/* renderiza los hijos directo en document.body para que el overlay cubra toda la pantalla */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
