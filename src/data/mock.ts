export type TransactionKind = 'received' | 'sent' | 'subscription' | 'topup' | 'bill';

export type Transaction = {
  id: string;
  title: string;
  kind: TransactionKind;
  amount: number; // positive = money in, negative = money out
  status: 'Completed' | 'Pending' | 'Failed';
  category: string;
  at: string; // ISO
  /** Receipt extras for transfers made in the app. */
  detail?: string; // e.g. "BCA · 1234567890"
  method?: string; // Payra Users, Bank, E-Wallet, Virtual Account, My Wallet
  contactId?: string;
};

export type Contact = { id: string; name: string; phone: string; bank?: string; account?: string };

export type Notification = {
  id: string;
  title: string;
  body: string;
  kind: 'security' | 'payment' | 'reminder';
  at: string;
  read: boolean;
};

export type Card = {
  id: string;
  brand: 'visa' | 'mastercard';
  type: 'Debit Card' | 'Credit Card';
  last4: string;
  expiry: string;
  balance: number;
  tone: 'dark' | 'yellow';
};

export type Promo = {
  id: string;
  tag: 'savings' | 'online';
  title: string;
  subtitle: string;
  cta: string;
  headline: string;
  description: string;
  tone: 'dark' | 'yellow';
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const todayAt = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const daysAgo = (d: number, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, 10, 0, 0);
  return date.toISOString();
};

export const user = {
  name: 'John Doe',
  dob: { dd: '01', mm: '01', yyyy: '1991' } as { dd: string; mm: string; yyyy: string } | undefined,
  email: 'johndoe@gmail.com',
  phone: '+62 812 3456 7890',
  address: '340 West End Avenue, New York, NY 10024',
  points: 700,
  tier: 'Premium',
};

export const transactions: Transaction[] = [
  // The first two match the Figma Home frame's "Recent Transaction" cards.
  { id: 't1', title: 'Transfer', kind: 'sent', amount: -150, status: 'Completed', category: 'BCA****0190', at: todayAt(19, 19) },
  { id: 't2', title: 'Mobile Money Top-up', kind: 'topup', amount: 150, status: 'Completed', category: 'GoPay', at: todayAt(11, 20) },
  { id: 't3', title: 'Netflix Payment', kind: 'subscription', amount: -10, status: 'Completed', category: 'Subscriptions', at: daysAgo(1, 14) },
  { id: 't4', title: 'Spotify Payment', kind: 'subscription', amount: -15, status: 'Completed', category: 'Subscriptions', at: daysAgo(9, 9) },
  { id: 't5', title: 'Salary', kind: 'received', amount: 4200, status: 'Completed', category: 'Payroll', at: daysAgo(12, 8) },
  { id: 't6', title: 'Electricity Bill', kind: 'bill', amount: -64.52, status: 'Completed', category: 'Prepaid', at: daysAgo(20, 19) },
  { id: 't7', title: 'Transfer', kind: 'received', amount: 80, status: 'Completed', category: 'Bima Andika', at: daysAgo(31, 11) },
];

export const contacts: Contact[] = [
  { id: 'c1', name: 'Aaliyah Putri', phone: '+62 812 3456 7812' },
  { id: 'c2', name: 'Abigail Sari', phone: '+62 814 5678 9034' },
  { id: 'c3', name: 'Ava Bella', phone: '+62 816 7890 1256' },
  { id: 'c4', name: 'Bima Andika', phone: '+62 817 8901 2367' },
  { id: 'c5', name: 'Bella Amanda', phone: '+62 818 9012 3478' },
  { id: 'c6', name: 'Brandon Arya', phone: '+62 819 0123 4589' },
  { id: 'c7', name: 'Brianna Citra', phone: '+62 821 2345 5690' },
  { id: 'c8', name: 'Brillia Aresta', phone: '+62 831 4347 7680' },
  { id: 'c9', name: 'Chandra Wijaya', phone: '+62 838 1122 3344' },
  { id: 'c10', name: 'Dewi Lestari', phone: '+62 852 9988 7766' },
];

export const frequentTransfers: Contact[] = [
  { id: 'f1', name: 'John Doe', phone: '', bank: 'Mandiri', account: '1122334455667' },
];

/** Anyone money can be sent to: the contact list plus frequent transfers. */
export const findContact = (id?: string) =>
  [...contacts, ...frequentTransfers].find((c) => c.id === id) ?? contacts[0]!;

export const notifications: Notification[] = [
  { id: 'n1', title: 'New Login Detected', body: 'We noticed a login from a new device.', kind: 'security', at: hoursAgo(0.2), read: false },
  { id: 'n2', title: 'Payment Successful', body: 'Your transaction has been processed securely.', kind: 'payment', at: hoursAgo(1), read: false },
  { id: 'n3', title: 'Complete Your Payment', body: 'Please complete your payment before it expires.', kind: 'reminder', at: hoursAgo(3), read: true },
];

// Order matters: index 0 is the front card on My Wallet (Figma shows the Visa in front, Mastercard peeking behind).
export const cards: Card[] = [
  { id: 'k2', brand: 'visa', type: 'Debit Card', last4: '2026', expiry: '06 / 26', balance: 80, tone: 'dark' },
  { id: 'k1', brand: 'mastercard', type: 'Credit Card', last4: '4421', expiry: '09 / 27', balance: 1250, tone: 'yellow' },
];

export const promos: Promo[] = [
  {
    id: 'p1',
    tag: 'savings',
    title: 'Savings Made Simple',
    subtitle: 'Store your money securely and watch your balance grow.',
    cta: 'Start Saving',
    headline: 'Digital Savings',
    description: 'Manage and grow your money with smart saving features.',
    tone: 'yellow',
  },
  {
    id: 'p2',
    tag: 'online',
    title: 'Online Deals Await',
    subtitle: 'Enjoy exclusive offers and promotions for your daily transactions.',
    cta: 'Explore Deals',
    headline: 'Exclusive Online Discounts',
    description: 'Save more when you pay online. Enjoy special discounts from selected partners.',
    tone: 'dark',
  },
  {
    id: 'p3',
    tag: 'online',
    title: 'More Deals, More Value',
    subtitle: 'Get the best online promotions and save more on every transaction.',
    cta: 'See Offers',
    headline: 'Limited Time Online Offers',
    description: "Don't miss out on exclusive online deals available for a limited time only.",
    tone: 'yellow',
  },
];

export const homeBanners = [
  { id: 'b1', title: '50% OFF', subtitle: 'Black friday deal', body: 'Get discount for every top up and payment' },
  { id: 'b2', title: 'Cashback 10%', subtitle: 'Electricity bills', body: 'Pay your prepaid token and earn cashback' },
  { id: 'b3', title: 'Free transfer', subtitle: 'All month long', body: 'Send money to any bank with zero fees' },
];

export const otherPayments = [
  { key: 'electricity', label: 'Electricity' },
  { key: 'water', label: 'Water' },
  { key: 'internet', label: 'Internet' },
  { key: 'more', label: 'More' },
] as const;

export const topUpBanks = [
  ['Debit Card', 'BCA OneKlik', 'Mandiri Virtual Account', 'BRI Direct Debit'],
  ['BRI', 'BCA', 'Mandiri', 'BNI'],
];

export const prepaidAmounts = [
  { price: 6.45, token: 6.25 },
  { price: 12.9, token: 12.5 },
  { price: 32.26, token: 32.0 },
  { price: 64.52, token: 64.52 },
  { price: 322.58, token: 322.58 },
  { price: 645.16, token: 645.16 },
];

export const pointHistory = {
  earned: [
    { id: 'e1', title: 'Daily Check-in', at: daysAgo(0, 9), delta: 5 },
    { id: 'e2', title: 'Electricity Payment', at: daysAgo(3, 18), delta: 200 },
    { id: 'e3', title: 'Referral Bonus', at: daysAgo(10, 12), delta: 200 },
  ],
  redeemed: [
    { id: 'r1', title: 'Coffee Purchase', at: daysAgo(0, 9), delta: -250 },
    { id: 'r2', title: 'Grocery Shopping', at: daysAgo(4, 19), delta: -50 },
  ],
};

export const countries = [
  { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+354', name: 'Iceland', flag: '🇮🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
];

export type Provider = { id: string; name: string; logo: number };

/** Logos exported from the Figma Top Up frame ("Via bank" and the e-wallet row). */
export const providers: Record<"Bank" | "E-Wallet", Provider[]> = {
  Bank: [
    { id: "bca", name: "BCA", logo: require("@/../assets/images/providers/bca.png") },
    { id: "mandiri", name: "Mandiri", logo: require("@/../assets/images/providers/mandiri.png") },
    { id: "bri", name: "BRI", logo: require("@/../assets/images/providers/bri.png") },
    { id: "bni", name: "BNI", logo: require("@/../assets/images/providers/bni.png") },
  ],
  "E-Wallet": [
    { id: "dana", name: "DANA", logo: require("@/../assets/images/providers/dana.png") },
    { id: "jago", name: "Jago", logo: require("@/../assets/images/providers/jago.png") },
    { id: "blu", name: "blu", logo: require("@/../assets/images/providers/blu.png") },
  ],
};

const accountHolders = ["Rizky Pratama", "Nadia Kusuma", "Fajar Nugroho", "Sekar Ayu", "Dimas Saputra", "Laras Wulandari"];

/** Fake "account name lookup": the same number always resolves to the same holder. */
export const lookupAccount = (number: string) => {
  let hash = 0;
  for (const ch of number) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return accountHolders[hash % accountHolders.length]!;
};
