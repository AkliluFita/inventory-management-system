import { BankTransfer, CourierArrival, ImportPurchase, TradeApi } from "@/data/tradeApi";
import { getDefaultBranchId } from "@/data/supabaseInventoryApi";
import { supabase } from "@/data/supabase";
import { File } from "expo-file-system";
import { Platform } from "react-native";

type Row = Record<string, string | number | boolean | null>;
const value = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("No data returned by Supabase.");
  return result.data;
};
const rows = (result: { data: unknown[] | null; error: { message: string } | null }): Row[] => value(result) as Row[];
const s = (v: Row, k: string) => String(v[k] ?? "");
const n = (v: Row, k: string) => Number(v[k] ?? 0);
const purchase = (v: Row): ImportPurchase => ({
  id: s(v, "id"), date: s(v, "date"), productId: s(v, "product_id"), quantity: n(v, "quantity"),
  unitPriceUsd: n(v, "unit_price_usd"), usdRateEtb: n(v, "usd_rate_etb"),
  freightEtb: n(v, "freight_etb"), supplier: s(v, "supplier"),
});
const arrival = (v: Row): CourierArrival => ({
  id: s(v, "id"), date: s(v, "date"), productId: s(v, "product_id"),
  quantity: n(v, "quantity"), courier: s(v, "courier"), purchaseId: s(v, "purchase_id") || undefined,
});
const transfer = (v: Row): BankTransfer => ({
  id: s(v, "id"), date: s(v, "date"), amountEtb: n(v, "amount_etb"), bank: s(v, "bank"),
  usdRate: n(v, "usd_rate"), aedRate: n(v, "aed_rate"), remitter: s(v, "remitter"),
  receipt: v.receipt_path ? {
    name: s(v, "receipt_name"), uri: s(v, "receipt_path"), size: n(v, "receipt_size"),
    mimeType: s(v, "receipt_mime_type"),
  } : undefined,
});
const getBranch = async (branchId?: string) => branchId || await getDefaultBranchId();

export const supabaseTradeApi: TradeApi = {
  async getSnapshot(branchId) {
    const id = await getBranch(branchId);
    const [purchases, arrivals, transfers] = await Promise.all([
      supabase.from("ps_import_purchases").select("*").eq("branch_id", id).order("created_at", { ascending: false }).limit(500),
      supabase.from("ps_courier_arrivals").select("*").eq("branch_id", id).order("created_at", { ascending: false }).limit(500),
      supabase.from("ps_bank_transfers").select("*").eq("branch_id", id).order("created_at", { ascending: false }).limit(500),
    ]);
    return {
      purchases: rows(purchases).map(purchase),
      arrivals: rows(arrivals).map(arrival),
      transfers: rows(transfers).map(transfer),
    };
  },
  async createPurchase(input, branchId) {
    const id = await getBranch(branchId);
    return purchase(value(await supabase.rpc("ps_create_purchase", {
      p_branch_id: id, p_date: input.date, p_product_id: input.productId, p_quantity: input.quantity,
      p_unit_price_usd: input.unitPriceUsd, p_usd_rate_etb: input.usdRateEtb,
      p_freight_etb: input.freightEtb, p_supplier: input.supplier,
    })) as Row);
  },
  async createArrival(input, branchId) {
    const id = await getBranch(branchId);
    return arrival(value(await supabase.rpc("ps_create_arrival", {
      p_branch_id: id, p_date: input.date, p_product_id: input.productId,
      p_quantity: input.quantity, p_courier: input.courier, p_purchase_id: input.purchaseId || null,
    })) as Row);
  },
  async createTransfer(input, branchId) {
    const id = await getBranch(branchId);
    let path: string | null = null;
    if (input.receipt) {
      if (input.receipt.size <= 0 || input.receipt.size > 10 * 1024 * 1024) throw new Error("Receipt must be smaller than 10 MB.");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Sign in to upload a receipt.");
      const extension = (input.receipt.name.split(".").pop()?.toLowerCase() || "").replace(/[^a-z0-9]/g, "").slice(0, 8);
      const contentType = input.receipt.mimeType || (extension === "pdf" ? "application/pdf" : ["jpg", "jpeg", "png", "webp", "heic"].includes(extension) ? `image/${extension === "jpg" ? "jpeg" : extension}` : "");
      if (!contentType || (contentType !== "application/pdf" && !contentType.startsWith("image/"))) throw new Error("Choose a PDF or image receipt.");
      path = `${userData.user.id}/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const body = Platform.OS === "web"
        ? await (await fetch(input.receipt.uri)).arrayBuffer()
        : await new File(input.receipt.uri).arrayBuffer();
      const { error } = await supabase.storage.from("ps-receipts").upload(path, body, {
        contentType, upsert: false,
      });
      if (error) throw new Error(error.message);
    }
    try {
      return transfer(value(await supabase.rpc("ps_create_transfer", {
        p_branch_id: id, p_date: input.date, p_amount_etb: input.amountEtb,
        p_bank: input.bank, p_usd_rate: input.usdRate, p_aed_rate: input.aedRate,
        p_remitter: input.remitter, p_receipt_path: path,
        p_receipt_name: input.receipt?.name || null, p_receipt_size: input.receipt?.size || null,
        p_receipt_mime_type: input.receipt?.mimeType || null,
      })) as Row);
    } catch (error) {
      if (path) await supabase.storage.from("ps-receipts").remove([path]);
      throw error;
    }
  },
};
