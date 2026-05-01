"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    
    // Redireciona al dashboard si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <div className='flex min-h-screen items-center justify-center'>
            Pagina de LOGIN!!!! :))
        </div>
    );
}
