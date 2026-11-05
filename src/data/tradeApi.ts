export type ImportPurchase = {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  unitPriceUsd: number;
  usdRateEtb: number;
  freightEtb: number;
  supplier: string;
};

export type CourierArrival = {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  courier: string;
  purchaseId?: string;
};

export type BankTransfer = {
  id: string;
  date: string;
  amountEtb: number;
  bank: string;
  usdRate: number;
  aedRate: number;
  remitter: string;
  receipt?: { name: string; uri: string; size: number; mimeType?: string };
};

export type TradeSnapshot = {
  purchases: ImportPurchase[];
  arrivals: CourierArrival[];
  transfers: BankTransfer[];
};

export interface TradeApi {
  getSnapshot(branchId?: string): Promise<TradeSnapshot>;
  createPurchase(input: Omit<ImportPurchase, "id">, branchId?: string): Promise<ImportPurchase>;
  createArrival(input: Omit<CourierArrival, "id">, branchId?: string): Promise<CourierArrival>;
  createTransfer(input: Omit<BankTransfer, "id">, branchId?: string): Promise<BankTransfer>;
}

export const landedUnitCost = (purchase: Pick<ImportPurchase, "unitPriceUsd" | "usdRateEtb" | "freightEtb">) =>
  purchase.unitPriceUsd * purchase.usdRateEtb + purchase.freightEtb;
export const totalImportCost = (purchase: Pick<ImportPurchase, "quantity" | "unitPriceUsd" | "usdRateEtb" | "freightEtb">) =>
  landedUnitCost(purchase) * purchase.quantity;
export const transferEquivalent = (amountEtb: number, rate: number) => rate > 0 ? amountEtb / rate : 0;
const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;

export const ethiopianBanks = [
  "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "Bank of Abyssinia", "Dashen Bank",
  "Oromia Bank", "Hibret Bank", "Nib International Bank", "Addis International Bank",
  "Abay Bank", "Amhara Bank", "Bunna Bank", "Zemen Bank", "ZamZam Bank",
  "Hijra Bank", "Wegagen Bank",
];

export const initialTradeSnapshot: TradeSnapshot = {
  purchases: [
    { id: "IMP-2601", date: "2026-10-21", productId: "p1", quantity: 50, unitPriceUsd: 18, usdRateEtb: 155, freightEtb: 560, supplier: "Blue Nile Wholesale" },
    { id: "IMP-2602", date: "2026-10-19", productId: "p8", quantity: 20, unitPriceUsd: 14, usdRateEtb: 155, freightEtb: 370, supplier: "Blue Nile Wholesale" },
  ],
  arrivals: [
    { id: "ARR-2601", date: "2026-10-24", productId: "p1", quantity: 50, courier: "Ethio Express", purchaseId: "IMP-2601" },
  ],
  transfers: [
    { id: "TR-2601", date: "2026-10-23", amountEtb: 250000, bank: "Commercial Bank of Ethiopia (CBE)", usdRate: 155, aedRate: 42.2, remitter: "Aklilu Jemal" },
  ],
};

let database: TradeSnapshot = initialTradeSnapshot;
let serial = 2601;

export const mockTradeApi: TradeApi = {
  async getSnapshot() {
    return { purchases: [...database.purchases], arrivals: [...database.arrivals], transfers: [...database.transfers] };
  },
  async createPurchase(input) {
    if (!validDate(input.date) || !input.productId || !input.supplier.trim() || !Number.isInteger(input.quantity) || input.quantity <= 0 || !Number.isFinite(input.unitPriceUsd) || input.unitPriceUsd <= 0 || !Number.isFinite(input.usdRateEtb) || input.usdRateEtb <= 0 || !Number.isFinite(input.freightEtb) || input.freightEtb < 0) throw new Error("Complete the required purchase fields.");
    const entry = { ...input, id: `IMP-${++serial}` };
    database = { ...database, purchases: [entry, ...database.purchases] };
    return entry;
  },
  async createArrival(input) {
    if (!validDate(input.date) || !input.productId || !input.courier.trim() || !Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("Complete the required arrival fields.");
    if (input.purchaseId) {
      const purchase = database.purchases.find((item) => item.id === input.purchaseId);
      const alreadyArrived = database.arrivals.filter((item) => item.purchaseId === input.purchaseId).reduce((sum, item) => sum + item.quantity, 0);
      if (!purchase || purchase.productId !== input.productId || alreadyArrived + input.quantity > purchase.quantity) throw new Error("Arrival must match the linked purchase and its remaining quantity.");
    }
    const entry = { ...input, id: `ARR-${++serial}` };
    database = { ...database, arrivals: [entry, ...database.arrivals] };
    return entry;
  },
  async createTransfer(input) {
    if (!validDate(input.date) || !input.bank || !input.remitter.trim() || !Number.isFinite(input.amountEtb) || input.amountEtb <= 0 || !Number.isFinite(input.usdRate) || input.usdRate <= 0 || !Number.isFinite(input.aedRate) || input.aedRate <= 0) throw new Error("Complete the required transfer fields.");
    if (input.receipt && (input.receipt.size <= 0 || input.receipt.size > 10 * 1024 * 1024)) throw new Error("Receipt must be smaller than 10 MB.");
    const entry = { ...input, id: `TR-${++serial}` };
    database = { ...database, transfers: [entry, ...database.transfers] };
    return entry;
  },
};
