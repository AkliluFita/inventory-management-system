import {
  Activity, Branch, Debt, Intake, InventoryApi, InventorySnapshot, Product,
  PurchaseOrder, ReportTotals, Sale, Supplier,
} from "@/data/inventoryApi";
import { supabase } from "@/data/supabase";

type Row = Record<string, string | number | boolean | null>;
const value = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("No data returned by Supabase.");
  return result.data;
};
const n = (v: Row, k: string) => Number(v[k] ?? 0);
const s = (v: Row, k: string) => String(v[k] ?? "");
const rows = (result: { data: unknown[] | null; error: { message: string } | null }): Row[] => value(result) as Row[];
const branch = (v: Row, items = 0): Branch => ({
  id: s(v, "id"), name: s(v, "name"), city: s(v, "city"),
  items, staff: n(v, "staff"), status: s(v, "status") as Branch["status"],
});
const supplier = (v: Row): Supplier => ({
  id: s(v, "id"), name: s(v, "name"), category: s(v, "category"), phone: s(v, "phone"), orders: 0, rating: 0,
});
const product = (v: Row): Product => ({
  id: s(v, "id"), name: s(v, "name"), sku: s(v, "sku"), category: s(v, "category"), brand: s(v, "brand"),
  unit: s(v, "unit"), stock: n(v, "stock"), minStock: n(v, "min_stock"), price: n(v, "price"),
  cost: n(v, "cost"), icon: s(v, "icon"), tint: s(v, "tint"), description: s(v, "description"),
});
const intake = (v: Row): Intake => ({
  id: s(v, "id"), productId: s(v, "product_id"), supplierId: s(v, "supplier_id"),
  batch: s(v, "batch"), quantity: n(v, "quantity"), unitCost: n(v, "unit_cost"),
  date: s(v, "date"), status: s(v, "status") as Intake["status"],
});
const sale = (v: Row): Sale => ({
  id: s(v, "id"), total: n(v, "total"), date: s(v, "date"), method: s(v, "method") as Sale["method"],
  items: n(v, "items"), customer: s(v, "customer"), tendered: n(v, "tendered"),
});
const debt = (v: Row): Debt => {
  const customer = s(v, "customer");
  const dueDate = s(v, "due_date");
  return {
    id: s(v, "id"), customer, initials: customer.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
    amount: n(v, "amount"), daysOverdue: Math.floor((Date.now() - new Date(`${dueDate}T00:00:00`).getTime()) / 86400000),
    dueDate, paid: Boolean(v.paid),
  };
};
const order = (v: Row): PurchaseOrder => ({
  id: s(v, "id"), productId: s(v, "product_id"), quantity: n(v, "quantity"),
  cost: n(v, "cost"), date: s(v, "date"), status: s(v, "status") as PurchaseOrder["status"],
});
const activity = (v: Row): Activity => ({
  id: s(v, "id"), title: s(v, "title"), detail: s(v, "detail"), kind: s(v, "kind") as Activity["kind"],
  time: new Date(s(v, "created_at")).toLocaleDateString(),
});

async function fetchProducts(branchId: string): Promise<Row[]> {
  const all: Row[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const page = rows(await supabase.from("ps_products").select("*")
      .eq("branch_id", branchId).order("name").order("id").range(from, from + pageSize - 1));
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

async function countProducts(branchId: string): Promise<number> {
  const { count, error } = await supabase.from("ps_products")
    .select("id", { count: "exact", head: true }).eq("branch_id", branchId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getDefaultBranchId() {
  return String(value(await supabase.rpc("ps_bootstrap")));
}

export const supabaseInventoryApi: InventoryApi = {
  async getSnapshot(branchId) {
    const defaultBranchId = await getDefaultBranchId();
    const branchRows = rows(await supabase.from("ps_branches").select("*").order("created_at"));
    const selectedId = branchRows.some((item) => item.id === branchId) ? branchId! : defaultBranchId;
    const [productRows, branchCounts, supplierResult, intakeResult, debtResult, activityResult, saleResult, orderResult, summaryResult] = await Promise.all([
      fetchProducts(selectedId),
      Promise.all(branchRows.map((item) => countProducts(String(item.id)))),
      supabase.from("ps_suppliers").select("*").order("name"),
      supabase.from("ps_intakes").select("*").eq("branch_id", selectedId).order("created_at", { ascending: false }).limit(200),
      supabase.from("ps_debts").select("*").eq("branch_id", selectedId).order("created_at", { ascending: false }).limit(200),
      supabase.from("ps_activities").select("*").eq("branch_id", selectedId).order("created_at", { ascending: false }).limit(100),
      supabase.from("ps_sales").select("*").eq("branch_id", selectedId).order("created_at", { ascending: false }).limit(500),
      supabase.from("ps_orders").select("*").eq("branch_id", selectedId).order("created_at", { ascending: false }).limit(200),
      supabase.rpc("ps_sales_summary", { p_branch_id: selectedId }),
    ]);
    const products = productRows.map(product);
    const sales = rows(saleResult);
    const reportTotals = value(summaryResult) as ReportTotals;
    const snapshot: InventorySnapshot = {
      products,
      branches: branchRows.map((item, index) => branch(item, branchCounts[index])),
      suppliers: rows(supplierResult).map(supplier),
      intakes: rows(intakeResult).map(intake),
      debts: rows(debtResult).map(debt),
      activities: rows(activityResult).map(activity),
      sales: sales.map(sale),
      orders: rows(orderResult).map(order),
      todaySalesBase: Number(reportTotals.Daily.revenue),
      monthlyRevenueBase: Number(reportTotals.Monthly.revenue),
      reportTotals,
    };
    return snapshot;
  },
  async createBranch(name, city) {
    const result = value(await supabase.rpc("ps_create_branch", { p_name: name, p_city: city }));
    return branch(result as Row);
  },
  async createSupplier(name, category, phone) {
    const result = value(await supabase.rpc("ps_create_supplier", { p_name: name, p_category: category, p_phone: phone }));
    return supplier(result as Row);
  },
  async createProduct(input, branchId) {
    const result = value(await supabase.rpc("ps_create_product", {
      p_branch_id: branchId, p_name: input.name, p_sku: input.sku, p_category: input.category,
      p_brand: input.brand, p_unit: input.unit, p_min_stock: input.minStock,
      p_price: input.price, p_cost: input.cost, p_description: input.description,
    }));
    return product(result as Row);
  },
  async createIntake(input) {
    return intake(value(await supabase.rpc("ps_receive", {
      p_product_id: input.productId, p_supplier_id: input.supplierId, p_batch: input.batch,
      p_quantity: input.quantity, p_unit_cost: input.unitCost,
    })) as Row);
  },
  async createIntakes(inputs) {
    const result = value(await supabase.rpc("ps_receive_batch", { p_items: inputs })) as Row[];
    return result.map(intake);
  },
  async createPurchaseOrder(productId, quantity) {
    return order(value(await supabase.rpc("ps_create_order", { p_product_id: productId, p_quantity: quantity })) as Row);
  },
  async completeSale(lines, method, payment) {
    if (!lines.length) throw new Error("Add an item to the cart first.");
    const productRow = value(await supabase.from("ps_products").select("branch_id").eq("id", lines[0].productId).single()) as { branch_id: string };
    const result = value(await supabase.rpc("ps_complete_sale", {
      p_branch_id: productRow.branch_id, p_lines: lines, p_method: method,
      p_customer: payment?.customerName || null, p_paid: payment?.amountPaid ?? null,
      p_date: payment?.saleDate ?? new Date().toISOString().slice(0, 10),
    }));
    return sale(result as Row);
  },
  async settleDebt(id) {
    const { error } = await supabase.rpc("ps_settle_debt", { p_debt_id: id });
    if (error) throw new Error(error.message);
  },
};
