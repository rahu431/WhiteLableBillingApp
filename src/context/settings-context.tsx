'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
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
    address: string;
    gstNumber: string;
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
    address: '',
    gstNumber: '',
};

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    formatCurrency: (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [defaultTimezone, setDefaultTimezone] = useState('UTC');

    useEffect(() => {
        // This effect runs only on the client, so window.Intl is safe.
        setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);


    const settingsDocRef = useMemoFirebase(() =>
        (firestore && user) ? doc(firestore, 'settings', SETTINGS_DOC_ID) : null,
        [firestore, user]
    );
    const { data: settingsData, isLoading: isLoadingSettings } = useDoc<Settings>(settingsDocRef);
    
    const isLoading = isUserLoading || isLoadingSettings;

    const settings = useMemo(() => {
        if (!user) return null; // Don't provide settings if there's no user
        return {
            currency: settingsData?.currency || defaultSettings.currency,
            taxRate: settingsData?.taxRate ?? defaultSettings.taxRate,
            packagingCharge: settingsData?.packagingCharge ?? defaultSettings.packagingCharge,
            serviceCharge: settingsData?.serviceCharge ?? defaultSettings.serviceCharge,
            discount: settingsData?.discount ?? defaultSettings.discount,
            timezone: settingsData?.timezone || defaultTimezone,
            appName: settingsData?.appName || defaultSettings.appName,
            logoUrl: settingsData?.logoUrl || defaultSettings.logoUrl,
            upiId: settingsData?.upiId || defaultSettings.upiId,
            address: settingsData?.address || defaultSettings.address,
            gstNumber: settingsData?.gstNumber || defaultSettings.gstNumber,
        }
    }, [settingsData, defaultTimezone, user]);

    const formatCurrency = useCallback((amount: number) => {
        const activeCurrency = settings?.currency || defaultSettings.currency;
        // Use 'en-IN' locale for INR to ensure correct symbol and formatting.
        // Default to 'en-US' for other currencies.
        const locale = activeCurrency === 'INR' ? 'en-IN' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: activeCurrency,
            }).format(amount);
        } catch (e) {
            console.warn(`Could not format currency for ${activeCurrency}. Falling back to USD.`);
            return new Intl.NumberFormat('en-US', {
                style: "currency",
                currency: 'USD',
            }).format(amount);
        }
    }, [settings?.currency]);
    
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
