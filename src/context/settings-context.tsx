
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'global';

interface Settings {
    currency: string;
    taxRate: number;
    packagingCharge: number;
    serviceCharge: number;
    discount: number;
}

interface SettingsContextType {
    settings: Settings | null;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

const defaultSettings: Settings = {
    currency: 'USD',
    taxRate: 10,
    packagingCharge: 0,
    serviceCharge: 0,
    discount: 0,
};

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    formatCurrency: (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() =>
        firestore ? doc(firestore, 'settings', SETTINGS_DOC_ID) : null,
        [firestore]
    );
    const { data: settingsData, isLoading } = useDoc<Settings>(settingsDocRef);

    const settings = useMemo(() => ({
        currency: settingsData?.currency || defaultSettings.currency,
        taxRate: settingsData?.taxRate ?? defaultSettings.taxRate,
        packagingCharge: settingsData?.packagingCharge ?? defaultSettings.packagingCharge,
        serviceCharge: settingsData?.serviceCharge ?? defaultSettings.serviceCharge,
        discount: settingsData?.discount ?? defaultSettings.discount,
    }), [settingsData]);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: settings.currency,
        }).format(amount);
    }, [settings.currency]);
    
    const value = { settings, isLoading, formatCurrency };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
