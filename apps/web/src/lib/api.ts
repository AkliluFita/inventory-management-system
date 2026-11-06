import type {
  Activity, BankTransfer, Branch, CourierArrival, Debt, ImportPurchase, Intake, InventorySnapshot,
  Product, PurchaseOrder, ReportTotals, Sale, Supplier, TradeSnapshot, CartLine,
} from "@primestock/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;
type Result<T> = { data: T | null; error: { message: string } | null };
function value<T>(result: Result<T>): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("Supabase returned no data.");
  return result.data;
}
const rows = (result: Result<unknown[]>) => value(result) as Row[];
const s = (row: Row, key: string) => String(row[key] ?? "");
const n = (row: Row, key: string) => Number(row[key] ?? 0);
const branch = (r: Row, items = 0): Branch => ({ id: s(r,"id"), name: s(r,"name"), city: s(r,"city"), items, staff: n(r,"staff"), status: s(r,"status") as Branch["status"] });
const product = (r: Row): Product => ({ id: s(r,"id"), name: s(r,"name"), sku: s(r,"sku"), category: s(r,"category"), brand: s(r,"brand"), unit: s(r,"unit"), stock: n(r,"stock"), minStock: n(r,"min_stock"), price: n(r,"price"), cost: n(r,"cost"), icon: s(r,"icon"), tint: s(r,"tint"), description: s(r,"description") });
const supplier = (r: Row): Supplier => ({ id: s(r,"id"), name: s(r,"name"), category: s(r,"category"), phone: s(r,"phone"), orders: 0, rating: 0 });
const intake = (r: Row): Intake => ({ id: s(r,"id"), productId: s(r,"product_id"), supplierId: s(r,"supplier_id"), batch: s(r,"batch"), quantity: n(r,"quantity"), unitCost: n(r,"unit_cost"), date: s(r,"date"), status: s(r,"status") as Intake["status"] });
const sale = (r: Row): Sale => ({ id: s(r,"id"), total: n(r,"total"), date: s(r,"date"), method: s(r,"method") as Sale["method"], items: n(r,"items"), customer: s(r,"customer"), tendered: n(r,"tendered") });
const debt = (r: Row): Debt => {
  const customer = s(r,"customer"), dueDate = s(r,"due_date");
  return { id: s(r,"id"), customer, initials: customer.split(/\s+/).map(part => part[0]).slice(0,2).join("").toUpperCase(), amount: n(r,"amount"), daysOverdue: Math.floor((Date.now() - new Date(`${dueDate}T00:00:00`).getTime()) / 86400000), dueDate, paid: Boolean(r.paid) };
};
const order = (r: Row): PurchaseOrder => ({ id: s(r,"id"), productId: s(r,"product_id"), quantity: n(r,"quantity"), cost: n(r,"cost"), date: s(r,"date"), status: s(r,"status") as PurchaseOrder["status"] });
const activity = (r: Row): Activity => ({ id: s(r,"id"), title: s(r,"title"), detail: s(r,"detail"), kind: s(r,"kind") as Activity["kind"], time: new Date(s(r,"created_at")).toLocaleDateString() });
const purchase = (r: Row): ImportPurchase => ({ id: s(r,"id"), date: s(r,"date"), productId: s(r,"product_id"), quantity: n(r,"quantity"), unitPriceUsd: n(r,"unit_price_usd"), usdRateEtb: n(r,"usd_rate_etb"), freightEtb: n(r,"freight_etb"), supplier: s(r,"supplier") });
const arrival = (r: Row): CourierArrival => ({ id: s(r,"id"), date: s(r,"date"), productId: s(r,"product_id"), quantity: n(r,"quantity"), courier: s(r,"courier"), purchaseId: s(r,"purchase_id") || undefined });
const transfer = (r: Row): BankTransfer => ({ id: s(r,"id"), date: s(r,"date"), amountEtb: n(r,"amount_etb"), bank: s(r,"bank"), usdRate: n(r,"usd_rate"), aedRate: n(r,"aed_rate"), remitter: s(r,"remitter"), receipt: r.receipt_path ? { name: s(r,"receipt_name"), uri: s(r,"receipt_path"), size: n(r,"receipt_size"), mimeType: s(r,"receipt_mime_type") } : undefined });

async function allProducts(client: SupabaseClient, branchId: string) {
  const result: Row[] = [];
  for (let from = 0; ; from += 500) {
    const page = rows(await client.from("ps_products").select("*").eq("branch_id", branchId).order("name").order("id").range(from, from + 499));
    result.push(...page);
    if (page.length < 500) return result;
  }
}

export async function getWorkspace(client: SupabaseClient, requestedBranchId?: string): Promise<{ inventory: InventorySnapshot; trade: TradeSnapshot; branchId: string }> {
  const defaultBranchId = String(value(await client.rpc("ps_bootstrap")));
  const branchRows = rows(await client.from("ps_branches").select("*").order("created_at"));
  const branchId = branchRows.some(r => r.id === requestedBranchId) ? requestedBranchId! : defaultBranchId;
  const [products, counts, suppliers, intakes, debts, activities, sales, orders, summary, purchases, arrivals, transfers] = await Promise.all([
    allProducts(client, branchId),
    Promise.all(branchRows.map(async r => {
      const result = await client.from("ps_products").select("id", { count: "exact", head: true }).eq("branch_id", s(r,"id"));
      if (result.error) throw new Error(result.error.message);
      return result.count ?? 0;
    })),
    client.from("ps_suppliers").select("*").order("name"),
    client.from("ps_intakes").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(200),
    client.from("ps_debts").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(200),
    client.from("ps_activities").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(100),
    client.from("ps_sales").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(500),
    client.from("ps_orders").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(200),
    client.rpc("ps_sales_summary",{p_branch_id:branchId}),
    client.from("ps_import_purchases").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(500),
    client.from("ps_courier_arrivals").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(500),
    client.from("ps_bank_transfers").select("*").eq("branch_id",branchId).order("created_at",{ascending:false}).limit(500),
  ]);
  const reportTotals = value(summary) as ReportTotals;
  return {
    branchId,
    inventory: { products: products.map(product), branches: branchRows.map((r,i)=>branch(r,counts[i])), suppliers: rows(suppliers).map(supplier), intakes: rows(intakes).map(intake), debts: rows(debts).map(debt), activities: rows(activities).map(activity), sales: rows(sales).map(sale), orders: rows(orders).map(order), todaySalesBase: Number(reportTotals.Daily.revenue), monthlyRevenueBase: Number(reportTotals.Monthly.revenue), reportTotals },
    trade: { purchases: rows(purchases).map(purchase), arrivals: rows(arrivals).map(arrival), transfers: rows(transfers).map(transfer) },
  };
}

export const mutations = {
  createBranch: async (c: SupabaseClient, name: string, city: string) => branch(value(await c.rpc("ps_create_branch", { p_name: name, p_city: city })) as Row),
  createSupplier: async (c: SupabaseClient, name: string, category: string, phone: string) => supplier(value(await c.rpc("ps_create_supplier", { p_name: name, p_category: category, p_phone: phone })) as Row),
  createProduct: async (c: SupabaseClient, input: Omit<Product,"id"|"stock"|"icon"|"tint">, branchId: string) => product(value(await c.rpc("ps_create_product", { p_branch_id: branchId, p_name: input.name, p_sku: input.sku, p_category: input.category, p_brand: input.brand, p_unit: input.unit, p_min_stock: input.minStock, p_price: input.price, p_cost: input.cost, p_description: input.description })) as Row),
  receive: async (c: SupabaseClient, input: { productId:string; supplierId?:string; batch:string; quantity:number; unitCost:number }) => intake(value(await c.rpc("ps_receive", { p_product_id: input.productId, p_supplier_id: input.supplierId || null, p_batch: input.batch, p_quantity: input.quantity, p_unit_cost: input.unitCost })) as Row),
  createOrder: async (c: SupabaseClient, productId:string, quantity:number) => order(value(await c.rpc("ps_create_order", { p_product_id: productId, p_quantity: quantity })) as Row),
  completeSale: async (c: SupabaseClient, branchId:string, lines:CartLine[], method:Sale["method"], customer:string, paid:number|null, date:string) => sale(value(await c.rpc("ps_complete_sale", { p_branch_id: branchId, p_lines: lines, p_method: method, p_customer: customer || null, p_paid: paid, p_date: date })) as Row),
  settleDebt: async (c: SupabaseClient, debtId:string) => { const {error}=await c.rpc("ps_settle_debt",{p_debt_id:debtId}); if(error) throw new Error(error.message); },
  createPurchase: async (c:SupabaseClient, branchId:string, input:Omit<ImportPurchase,"id">) => purchase(value(await c.rpc("ps_create_purchase", { p_branch_id: branchId, p_date: input.date, p_product_id: input.productId, p_quantity: input.quantity, p_unit_price_usd: input.unitPriceUsd, p_usd_rate_etb: input.usdRateEtb, p_freight_etb: input.freightEtb, p_supplier: input.supplier })) as Row),
  createArrival: async (c:SupabaseClient, branchId:string, input:Omit<CourierArrival,"id">) => arrival(value(await c.rpc("ps_create_arrival", { p_branch_id: branchId, p_date: input.date, p_product_id: input.productId, p_quantity: input.quantity, p_courier: input.courier, p_purchase_id: input.purchaseId || null })) as Row),
  createTransfer: async (c:SupabaseClient, branchId:string, input:Omit<BankTransfer,"id">, file?:File) => {
    let path:string|null = null;
    if (file) {
      if (file.size <= 0 || file.size > 10*1024*1024 || (file.type !== "application/pdf" && !file.type.startsWith("image/"))) throw new Error("Choose a PDF or image receipt smaller than 10 MB.");
      const {data,error} = await c.auth.getUser();
      if (error || !data.user) throw new Error("Sign in to upload a receipt.");
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,8) || "bin";
      path = `${data.user.id}/${branchId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const upload = await c.storage.from("ps-receipts").upload(path, file, { contentType:file.type, upsert:false });
      if (upload.error) throw new Error(upload.error.message);
    }
    try {
      return transfer(value(await c.rpc("ps_create_transfer", { p_branch_id:branchId, p_date:input.date, p_amount_etb:input.amountEtb, p_bank:input.bank, p_usd_rate:input.usdRate, p_aed_rate:input.aedRate, p_remitter:input.remitter, p_receipt_path:path, p_receipt_name:file?.name || null, p_receipt_size:file?.size || null, p_receipt_mime_type:file?.type || null })) as Row);
    } catch (error) {
      if (path) await c.storage.from("ps-receipts").remove([path]);
      throw error;
    }
  },
};

export async function receiptUrl(client:SupabaseClient, path:string) {
  const {data,error}=await client.storage.from("ps-receipts").createSignedUrl(path,60);
  if(error) throw new Error(error.message);
  return data.signedUrl;
}
