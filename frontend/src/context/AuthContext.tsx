"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
    name: string;
    email: string;
    role: string;
    token?: string;
    _id: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (session?.user) {
            setUser(session.user as User);
        } else {
            setUser(null);
        }
    }, [session]);

    return (
        <AuthContext.Provider value={{ user, loading: status === 'loading' }}>
            {children}
        </AuthContext.Provider>
    );
};
