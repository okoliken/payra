import AsyncStorage from "@react-native-async-storage/async-storage";
import { UnistylesRuntime } from "react-native-unistyles";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as mock from "@/data/mock";
import type { Card, Notification, Transaction } from "@/data/mock";

type ThemeName = "light" | "dark";

export type AppState = {
  onboarded: boolean;
  signedIn: boolean;
  user: typeof mock.user;
  balance: number;
  hideBalance: boolean;
  transactions: Transaction[];
  notifications: Notification[];
  cards: Card[];
  fingerprint: boolean;
  checkedInToday: boolean;
  /** Dial code chosen on the country picker (Getting Started). */
  countryCode: string;
  theme: ThemeName;
};

export type AppActions = {
  completeOnboarding: () => void;
  signIn: () => void;
  signOut: () => void;
  toggleBalance: () => void;
  /** Records a money movement and returns the created transaction. */
  addTransaction: (
    tx: Omit<Transaction, "id" | "at" | "status">,
  ) => Transaction;
  readNotifications: () => void;
  deleteNotification: (id: string) => void;
  addCard: (card: Card) => void;
  updateUser: (patch: Partial<typeof mock.user>) => void;
  toggleFingerprint: () => void;
  checkIn: () => void;
  setCountry: (code: string) => void;
  setTheme: (name: ThemeName) => void;
};

const initialState: AppState = {
  onboarded: false,
  signedIn: false,
  user: mock.user,
  balance: 15_500,
  hideBalance: false,
  transactions: mock.transactions,
  notifications: mock.notifications,
  cards: mock.cards,
  fingerprint: true,
  checkedInToday: false,
  countryCode: "+62",
  theme: "light",
};

/**
 * App state lives in a single Zustand store persisted to AsyncStorage, so onboarding, sign-in,
 * balance and history survive relaunches. Read with selectors (`useStore((s) => s.balance)`) so a
 * component only re-renders for the slices it uses.
 */
export const useStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: () => set({ onboarded: true }),
      signIn: () => set({ signedIn: true, onboarded: true }),
      signOut: () => set({ signedIn: false }),
      toggleBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),

      addTransaction: (tx) => {
        const full: Transaction = {
          ...tx,
          id: `t${Date.now()}`,
          at: new Date().toISOString(),
          status: "Completed",
        };
        set((s) => ({
          balance: Math.round((s.balance + full.amount) * 100) / 100,
          transactions: [full, ...s.transactions],
        }));
        return full;
      },

      readNotifications: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
      addCard: (card) => set((s) => ({ cards: [card, ...s.cards] })),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      toggleFingerprint: () => set((s) => ({ fingerprint: !s.fingerprint })),
      checkIn: () => {
        if (get().checkedInToday) return;
        set((s) => ({
          checkedInToday: true,
          user: { ...s.user, points: s.user.points + 5 },
        }));
      },
      setCountry: (code) => set({ countryCode: code }),
      setTheme: (name) => {
        UnistylesRuntime.setTheme(name);
        set({ theme: name });
      },
    }),
    {
      name: "payra-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump when persisted mock data changes shape/order; migrate resets that slice only.
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        return version < 2 ? { ...state, cards: mock.cards } : state;
      },
      // Persist durable state only; derived/UI bits are recomputed.
      partialize: (s) => ({
        onboarded: s.onboarded,
        signedIn: s.signedIn,
        user: s.user,
        balance: s.balance,
        hideBalance: s.hideBalance,
        transactions: s.transactions,
        notifications: s.notifications,
        cards: s.cards,
        fingerprint: s.fingerprint,
        checkedInToday: s.checkedInToday,
        countryCode: s.countryCode,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) UnistylesRuntime.setTheme(state.theme);
      },
    },
  ),
);

/** Number of unread notifications (derived). */
export const selectUnreadCount = (s: AppState) =>
  s.notifications.filter((n) => !n.read).length;
