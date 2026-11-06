export type Category = string;
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export type IntakeStatus = "Received" | "In transit" | "Pending";
export type ReportPeriod = "Daily" | "Weekly" | "Monthly" | "Annual";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: Category;
  brand: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  icon: string;
  tint: string;
  description: string;
};
export type Branch = { id: string; name: string; city: string; items: number; staff: number; status: "Active" | "Pending" | "Offline" };
export type Supplier = { id: string; name: string; category: string; phone: string; orders: number; rating: number };
export type Intake = { id: string; productId: string; batch: string; quantity: number; unitCost: number; supplierId: string; date: string; status: IntakeStatus };
export type Debt = { id: string; customer: string; initials: string; amount: number; daysOverdue: number; dueDate: string; paid: boolean };
export type Activity = { id: string; title: string; detail: string; time: string; kind: "stock" | "sale" | "alert" | "order" };
export type Sale = { id: string; total: number; date: string; method: "Full payment" | "Partial credit" | "Overpayment"; items: number; customer?: string; tendered?: number };
export type PurchaseOrder = { id: string; productId: string; quantity: number; cost: number; date: string; status: "Draft" | "Sent" };
export type CartLine = { productId: string; quantity: number };
export type SalePayment = { customerName?: string; amountPaid?: number; saleDate?: string };
export type ReportTotals = Record<ReportPeriod, { revenue: number; cost: number }>;
export type InventorySnapshot = {
  products: Product[]; branches: Branch[]; suppliers: Supplier[]; intakes: Intake[];
  debts: Debt[]; activities: Activity[]; sales: Sale[]; orders: PurchaseOrder[];
  todaySalesBase: number; monthlyRevenueBase: number; reportTotals?: ReportTotals;
};
export interface InventoryApi {
  getSnapshot(branchId?: string): Promise<InventorySnapshot>;
  createBranch(name: string, city: string): Promise<Branch>;
  createSupplier(name: string, category: string, phone: string): Promise<Supplier>;
  createProduct(input: Omit<Product, "id" | "stock" | "icon" | "tint">, branchId: string): Promise<Product>;
  createIntake(input: Omit<Intake, "id" | "date" | "status">): Promise<Intake>;
  createIntakes(inputs: Omit<Intake, "id" | "date" | "status">[]): Promise<Intake[]>;
  createPurchaseOrder(productId: string, quantity: number): Promise<PurchaseOrder>;
  completeSale(lines: CartLine[], method: Sale["method"], payment?: SalePayment): Promise<Sale>;
  settleDebt(id: string): Promise<void>;
}

export type ImportPurchase = { id: string; date: string; productId: string; quantity: number; unitPriceUsd: number; usdRateEtb: number; freightEtb: number; supplier: string };
export type CourierArrival = { id: string; date: string; productId: string; quantity: number; courier: string; purchaseId?: string };
export type Receipt = { name: string; uri: string; size: number; mimeType?: string };
export type BankTransfer = { id: string; date: string; amountEtb: number; bank: string; usdRate: number; aedRate: number; remitter: string; receipt?: Receipt };
export type TradeSnapshot = { purchases: ImportPurchase[]; arrivals: CourierArrival[]; transfers: BankTransfer[] };
export interface TradeApi {
  getSnapshot(branchId?: string): Promise<TradeSnapshot>;
  createPurchase(input: Omit<ImportPurchase, "id">, branchId?: string): Promise<ImportPurchase>;
  createArrival(input: Omit<CourierArrival, "id">, branchId?: string): Promise<CourierArrival>;
  createTransfer(input: Omit<BankTransfer, "id">, branchId?: string): Promise<BankTransfer>;
}

export const stockStatus = (product: Product): StockStatus => product.stock === 0 ? "out-of-stock" : product.stock <= product.minStock ? "low-stock" : "in-stock";
export const money = (value: number) => `ETB ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
export const landedUnitCost = (purchase: Pick<ImportPurchase, "unitPriceUsd" | "usdRateEtb" | "freightEtb">) => purchase.unitPriceUsd * purchase.usdRateEtb + purchase.freightEtb;
export const totalImportCost = (purchase: Pick<ImportPurchase, "quantity" | "unitPriceUsd" | "usdRateEtb" | "freightEtb">) => landedUnitCost(purchase) * purchase.quantity;
export const transferEquivalent = (amountEtb: number, rate: number) => rate > 0 ? amountEtb / rate : 0;
export const ethiopianBanks = [
  "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "Bank of Abyssinia", "Dashen Bank",
  "Oromia Bank", "Hibret Bank", "Nib International Bank", "Addis International Bank",
  "Abay Bank", "Amhara Bank", "Bunna Bank", "Zemen Bank", "ZamZam Bank",
  "Hijra Bank", "Wegagen Bank",
];
export const today = () => new Date().toISOString().slice(0, 10);
export const positiveNumber = (value: string) => Number(value.replace(/,/g, ""));
export const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(/[\s().-]/g, "");
  const ethiopian = compact.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  if (ethiopian) return `+251${ethiopian[1]}`;
  return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
}

export { languages, translations, translate } from "./i18n";
export type { Language } from "./i18n";
