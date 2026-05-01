"use client";

type LoadingProps = {
    label?: string;
};

// Componente de carga reutilizable con mucho estilo!!! 
export function Loading({ label = "Cargando..." }: LoadingProps) {
    return (
        <div className="app-atmosphere flex min-h-[55vh] items-center justify-center px-4 py-10">
            <div className="glass-card flex flex-col items-center gap-3 rounded-3xl px-8 py-7 shadow-xl" role="status" aria-live="polite">
                <span className="loading loading-ring loading-md text-slate-700" aria-label={label} />
                <p className="text-sm font-semibold tracking-wide text-white">{label}</p>
            </div>
        </div>
    );
}

export default Loading;
