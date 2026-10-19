/** formatMoney for the UI thread (animated values): "$15,500.00". */
export function formatMoneyWorklet(amount: number) {
  "worklet";
  const [whole, cents] = Math.abs(amount).toFixed(2).split(".");
  return `${amount < 0 ? "-" : ""}$${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
}

export const formatMoney = (amount: number, opts: { sign?: boolean } = {}) => {
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = opts.sign ? (amount < 0 ? '- ' : '+ ') : amount < 0 ? '-' : '';
  return `${sign}$${abs}`;
};

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

export const maskPhone = (phone: string) => phone.replace(/(\+\d{2} \d{3}).+(\d)$/, '$1 **** ***$2');

export const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  if (sameDay) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
