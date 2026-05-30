"use client";

type SpinnerProps = {
    /** Tamaño del spinner: "sm" para usos inline, "md"/"lg" para áreas de carga */
    size?: "sm" | "md" | "lg";
    /** Si es true, centra el spinner en un área alta (carga de página/sección) */
    fullArea?: boolean;
    className?: string;
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
};

// Spinner giratorio simple (sin diálogo de texto). Reemplaza los antiguos
// recuadros "Loading [módulo]..." mientras se cargan datos desde el backend.
export function Spinner({ size = "lg", fullArea = true, className = "" }: SpinnerProps) {
    const spinner = (
        <span
            className={`inline-block animate-spin rounded-full border-slate-300 border-t-indigo-600 ${sizeClasses[size]}`}
            role="status"
            aria-label="Cargando"
        />
    );

    if (!fullArea) return spinner;

    return (
        <div
            className={`flex min-h-[55vh] items-center justify-center px-4 py-10 ${className}`}
            aria-live="polite"
        >
            {spinner}
        </div>
    );
}

export default Spinner;
