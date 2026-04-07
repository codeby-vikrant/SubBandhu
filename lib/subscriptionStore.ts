import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface SubscriptionStore {
    subscriptions: Subscription[];
    balance: number;
    nextRenewalDate: string | null;

    fetchData: (userId: string) => Promise<void>;
    addSubscription: (sub: Subscription, userId: string) => Promise<void>;
    updateBalance: (
        data: { balance: number; nextRenewalDate: string },
        userId: string
    ) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
    subscriptions: [],
    balance: 0,
    nextRenewalDate: null,

    fetchData: async (userId) => {
        const data = await AsyncStorage.getItem(`data-${userId}`);
        if (data) {
            set(JSON.parse(data));
        }
    },

    addSubscription: async (sub, userId) => {
        const current = get();
        const updated = {
            ...current,
            subscriptions: [sub, ...current.subscriptions],
        };

        await AsyncStorage.setItem(`data-${userId}`, JSON.stringify(updated));
        set(updated);
    },

    updateBalance: async (data, userId) => {
        const current = get();
        const updated = { ...current, ...data };

        await AsyncStorage.setItem(`data-${userId}`, JSON.stringify(updated));
        set(updated);
    },
}));