
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'global';

interface Settings {
    currency: string;
    taxRate: number;
    packagingCharge: number;
    serviceCharge: number;
    discount: number;
    timezone: string;
    appName: string;
    logoUrl: string;
    upiId: string;
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
    timezone: 'UTC',
    appName: 'Care Billing',
    logoUrl: '',
    upiId: '',
};

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    formatCurrency: (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const firestore = useFirestore();
    const { user } = useUser();
    const [defaultTimezone, setDefaultTimezone] = useState('UTC');

    useEffect(() => {
        // This effect runs only on the client, so window.Intl is safe.
        setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);


    const settingsDocRef = useMemoFirebase(() =>
        (firestore && user) ? doc(firestore, 'settings', SETTINGS_DOC_ID) : null,
        [firestore, user]
    );
    const { data: settingsData, isLoading } = useDoc<Settings>(settingsDocRef);

    const settings = useMemo(() => ({
        currency: settingsData?.currency || defaultSettings.currency,
        taxRate: settingsData?.taxRate ?? defaultSettings.taxRate,
        packagingCharge: settingsData?.packagingCharge ?? defaultSettings.packagingCharge,
        serviceCharge: settingsData?.serviceCharge ?? defaultSettings.serviceCharge,
        discount: settingsData?.discount ?? defaultSettings.discount,
        timezone: settingsData?.timezone || defaultTimezone,
        appName: settingsData?.appName || defaultSettings.appName,
        logoUrl: settingsData?.logoUrl || defaultSettings.logoUrl,
        upiId: settingsData?.upiId || defaultSettings.upiId,
    }), [settingsData, defaultTimezone]);

    const formatCurrency = useCallback((amount: number) => {
        // Use 'en-IN' locale for INR to ensure correct symbol and formatting.
        // Default to 'en-US' for other currencies.
        const locale = settings.currency === 'INR' ? 'en-IN' : 'en-US';
        return new Intl.NumberFormat(locale, {
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
