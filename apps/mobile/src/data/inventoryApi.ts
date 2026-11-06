import type { Activity, Branch, Debt, Intake, InventoryApi, InventorySnapshot, Product, PurchaseOrder, Sale, Supplier } from "@primestock/domain";
import { money } from "@primestock/domain";
export { money, stockStatus } from "@primestock/domain";
export type { Category, StockStatus, IntakeStatus, Product, Branch, Supplier, Intake, Debt, Activity, Sale, PurchaseOrder, CartLine, SalePayment, ReportPeriod, ReportTotals, InventorySnapshot, InventoryApi } from "@primestock/domain";

const seed: InventorySnapshot = {
  products: [
    { id: "p1", name: "Wireless Barcode Scanner", sku: "EL-SCN-001", category: "Electronics", brand: "ScanPro", unit: "pcs", stock: 84, minStock: 20, price: 4850, cost: 3350, icon: "barcode-outline", tint: "#DDEBFF", description: "Handheld scanner with USB and Bluetooth connection." },
    { id: "p2", name: "Ceramic Coffee Mugs", sku: "HM-MUG-014", category: "Home", brand: "Casa", unit: "sets", stock: 12, minStock: 18, price: 690, cost: 420, icon: "cafe-outline", tint: "#FFF0DC", description: "Set of four durable ceramic mugs." },
    { id: "p3", name: "Organic Coffee Beans 1kg", sku: "GR-COF-008", category: "Groceries", brand: "Highland", unit: "bags", stock: 156, minStock: 40, price: 1250, cost: 840, icon: "leaf-outline", tint: "#E0F7EC", description: "Fresh roasted coffee beans in a sealed 1kg bag." },
    { id: "p4", name: "Safety Gloves Box", sku: "SU-GLV-023", category: "Supplies", brand: "SafeHand", unit: "boxes", stock: 0, minStock: 24, price: 540, cost: 310, icon: "hand-left-outline", tint: "#FFE7E9", description: "Protective work gloves, 50 pairs per box." },
    { id: "p5", name: "Office Notebook A5", sku: "ST-NBK-032", category: "Stationery", brand: "Paperline", unit: "pcs", stock: 220, minStock: 50, price: 160, cost: 85, icon: "book-outline", tint: "#EAE8FF", description: "Hardcover ruled notebook for everyday notes." },
    { id: "p6", name: "LED Desk Lamp", sku: "HM-LMP-012", category: "Home", brand: "Luma", unit: "pcs", stock: 46, minStock: 15, price: 2100, cost: 1420, icon: "bulb-outline", tint: "#E2F3FF", description: "Adjustable desk light with three brightness modes." },
    { id: "p7", name: "Canvas Tote Bag", sku: "AP-BAG-006", category: "Apparel", brand: "Everyday", unit: "pcs", stock: 93, minStock: 30, price: 420, cost: 230, icon: "bag-handle-outline", tint: "#FDEAF2", description: "Reusable cotton canvas tote bag." },
    { id: "p8", name: "Bluetooth Speaker", sku: "EL-SPK-021", category: "Electronics", brand: "Sonic", unit: "pcs", stock: 17, minStock: 20, price: 3850, cost: 2540, icon: "volume-high-outline", tint: "#E7EDFF", description: "Portable speaker with long battery life." },
    { id: "p9", name: "Industrial Cleaner 5L", sku: "SU-CLN-009", category: "Supplies", brand: "PureWorks", unit: "bottles", stock: 64, minStock: 20, price: 780, cost: 460, icon: "flask-outline", tint: "#E1F8F6", description: "Concentrated multipurpose cleaner for workplaces." },
  ],
  branches: [
    { id: "b1", name: "Addis Ababa · Bole", city: "Addis Ababa", items: 2480, staff: 8, status: "Active" },
    { id: "b2", name: "Adama Branch", city: "Adama", items: 1820, staff: 5, status: "Active" },
    { id: "b3", name: "Hawassa Branch", city: "Hawassa", items: 960, staff: 4, status: "Active" },
    { id: "b4", name: "Dire Dawa Branch", city: "Dire Dawa", items: 620, staff: 3, status: "Pending" },
    { id: "b5", name: "Mekelle Branch", city: "Mekelle", items: 450, staff: 2, status: "Offline" },
  ],
  suppliers: [
    { id: "s1", name: "Blue Nile Wholesale", category: "Electronics & equipment", phone: "+251 911 240 112", orders: 18, rating: 4.9 },
    { id: "s2", name: "Highland Trading", category: "Groceries & essentials", phone: "+251 911 604 208", orders: 12, rating: 4.8 },
    { id: "s3", name: "Abay General Supply", category: "Home & office", phone: "+251 922 331 004", orders: 9, rating: 4.7 },
    { id: "s4", name: "SafeWork Distributors", category: "Industrial supplies", phone: "+251 911 673 711", orders: 6, rating: 4.6 },
  ],
  intakes: [
    { id: "IN-2501", productId: "p1", batch: "BCH-2025-001", quantity: 50, unitCost: 3350, supplierId: "s1", date: "2026-10-24", status: "Received" },
    { id: "IN-2502", productId: "p3", batch: "BCH-2025-002", quantity: 80, unitCost: 840, supplierId: "s2", date: "2026-10-22", status: "Received" },
    { id: "IN-2503", productId: "p6", batch: "BCH-2025-003", quantity: 30, unitCost: 1420, supplierId: "s3", date: "2026-10-20", status: "In transit" },
    { id: "IN-2504", productId: "p5", batch: "BCH-2025-004", quantity: 120, unitCost: 85, supplierId: "s3", date: "2026-10-18", status: "Received" },
    { id: "IN-2505", productId: "p8", batch: "BCH-2025-005", quantity: 20, unitCost: 2540, supplierId: "s1", date: "2026-10-17", status: "Pending" },
  ],
  debts: [
    { id: "d1", customer: "Ahmed Mohammed", initials: "AM", amount: 25000, daysOverdue: 6, dueDate: "2026-10-19", paid: false },
    { id: "d2", customer: "Kebede Tadesse", initials: "KT", amount: 18750, daysOverdue: 2, dueDate: "2026-10-23", paid: false },
    { id: "d3", customer: "Zinabu Worku", initials: "ZW", amount: 12500, daysOverdue: 1, dueDate: "2026-10-24", paid: false },
    { id: "d4", customer: "Hana Bekele", initials: "HB", amount: 8200, daysOverdue: -3, dueDate: "2026-10-28", paid: false },
    { id: "d5", customer: "Selam Trading", initials: "ST", amount: 14300, daysOverdue: -5, dueDate: "2026-10-30", paid: false },
  ],
  activities: [
    { id: "a1", title: "New stock intake registered", detail: "Wireless Barcode Scanner · 50 pcs", time: "2m ago", kind: "stock" },
    { id: "a2", title: "Sale completed", detail: "3 items · ETB 7,350", time: "14m ago", kind: "sale" },
    { id: "a3", title: "Low stock alert", detail: "Ceramic Coffee Mugs · 12 sets left", time: "1h ago", kind: "alert" },
  ],
  sales: [
    { id: "SL-1038", total: 7350, date: "2026-10-25", method: "Full payment", items: 3 },
    { id: "SL-1037", total: 12500, date: "2026-10-25", method: "Full payment", items: 5 },
    { id: "SL-1036", total: 4200, date: "2026-10-24", method: "Partial credit", items: 2 },
  ],
  orders: [],
  todaySalesBase: 248750,
  monthlyRevenueBase: 1248750,
};

let database: InventorySnapshot = seed;
let serial = 2600;

export const initialInventorySnapshot = seed;
export const emptyInventorySnapshot: InventorySnapshot = {
  products: [], branches: [], suppliers: [], intakes: [], debts: [],
  activities: [], sales: [], orders: [], todaySalesBase: 0, monthlyRevenueBase: 0,
};

const activity = (title: string, detail: string, kind: Activity["kind"]): Activity => ({
  id: `a${++serial}`, title, detail, kind, time: "Just now",
});

export const mockInventoryApi: InventoryApi = {
  async getSnapshot() {
    return {
      ...database,
      products: [...database.products], branches: [...database.branches], suppliers: [...database.suppliers],
      intakes: [...database.intakes], debts: [...database.debts], activities: [...database.activities],
      sales: [...database.sales], orders: [...database.orders],
    };
  },
  async createBranch(name, city) {
    const branch: Branch = { id: `b${++serial}`, name, city, items: 0, staff: 1, status: "Active" };
    database = { ...database, branches: [...database.branches, branch] };
    return branch;
  },
  async createSupplier(name, category, phone) {
    const supplier: Supplier = { id: `s${++serial}`, name, category, phone, orders: 0, rating: 0 };
    database = { ...database, suppliers: [...database.suppliers, supplier] };
    return supplier;
  },
  async createProduct(input) {
    const product: Product = { ...input, id: `p${++serial}`, stock: 0, icon: "cube-outline", tint: "#E8F1FF" };
    database = { ...database, products: [...database.products, product] };
    return product;
  },
  async createIntake(input) {
    const entry: Intake = { ...input, id: `IN-${++serial}`, date: new Date().toISOString().slice(0, 10), status: "Received" };
    const product = database.products.find((item) => item.id === input.productId);
    database = {
      ...database,
      intakes: [entry, ...database.intakes],
      products: database.products.map((item) => item.id === input.productId ? { ...item, stock: item.stock + input.quantity } : item),
      activities: [activity("New stock intake registered", `${product?.name ?? "Product"} · ${input.quantity} units`, "stock"), ...database.activities],
    };
    return entry;
  },
  async createIntakes(inputs) {
    const entries: Intake[] = [];
    for (const input of inputs) entries.push(await this.createIntake(input));
    return entries;
  },
  async createPurchaseOrder(productId, quantity) {
    const product = database.products.find((item) => item.id === productId);
    if (!product || quantity < 1) throw new Error("Choose a valid product and quantity.");
    const order: PurchaseOrder = { id: `PO-${++serial}`, productId, quantity, cost: quantity * product.cost, date: new Date().toISOString().slice(0, 10), status: "Draft" };
    database = { ...database, orders: [order, ...database.orders], activities: [activity("Purchase order created", `${product.name} · ${quantity} ${product.unit}`, "order"), ...database.activities] };
    return order;
  },
  async completeSale(lines, method, payment) {
    if (lines.length === 0) throw new Error("Add an item to the cart first.");
    const total = lines.reduce((sum, line) => {
      const product = database.products.find((item) => item.id === line.productId);
      if (!product || line.quantity < 1 || line.quantity > product.stock) throw new Error(`${product?.name ?? "An item"} has insufficient stock.`);
      return sum + product.price * line.quantity;
    }, 0);
    const amountPaid = payment?.amountPaid;
    if (payment?.saleDate && (!/^\d{4}-\d{2}-\d{2}$/.test(payment.saleDate) || Number.isNaN(Date.parse(payment.saleDate)))) throw new Error("Enter a valid sale date.");
    if (method === "Partial credit" && (!payment?.customerName?.trim() || amountPaid === undefined || !Number.isFinite(amountPaid) || amountPaid <= 0 || amountPaid >= total)) {
      throw new Error("Enter a customer and an amount paid between zero and the sale total.");
    }
    if (method === "Overpayment" && (amountPaid === undefined || !Number.isFinite(amountPaid) || amountPaid <= total)) {
      throw new Error("Enter an amount tendered above the sale total.");
    }
    const sale: Sale = { id: `SL-${++serial}`, total, date: payment?.saleDate ?? new Date().toISOString().slice(0, 10), method, items: lines.reduce((sum, line) => sum + line.quantity, 0), customer: payment?.customerName?.trim() || "Walk-in customer", tendered: amountPaid ?? total };
    const newDebt: Debt | null = method === "Partial credit" && amountPaid !== undefined ? {
      id: `d${++serial}`,
      customer: payment?.customerName?.trim() ?? "Customer",
      initials: (payment?.customerName?.trim() ?? "CU").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
      amount: total - amountPaid,
      daysOverdue: -7,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paid: false,
    } : null;
    database = {
      ...database,
      sales: [sale, ...database.sales],
      debts: newDebt ? [newDebt, ...database.debts] : database.debts,
      products: database.products.map((product) => {
        const sold = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
        return sold ? { ...product, stock: product.stock - sold } : product;
      }),
      activities: [activity("Sale completed", `${sale.items} items · ${money(total)}`, "sale"), ...database.activities],
      todaySalesBase: database.todaySalesBase + total,
      monthlyRevenueBase: database.monthlyRevenueBase + total,
    };
    return sale;
  },
  async settleDebt(id) {
    const debt = database.debts.find((item) => item.id === id);
    if (!debt) throw new Error("Customer debt not found.");
    database = {
      ...database,
      debts: database.debts.map((item) => item.id === id ? { ...item, paid: true } : item),
      activities: [activity("Customer payment received", `${debt.customer} · ${money(debt.amount)}`, "sale"), ...database.activities],
    };
  },
};
