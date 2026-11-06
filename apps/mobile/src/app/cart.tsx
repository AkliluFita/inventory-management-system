import { Button, CartSummary, Chip, EmptyState, Icon, InputField, Page, ProductArt, SectionTitle, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Sale, money } from "@/data/inventoryApi";
import { today, validDate } from "@/data/formUtils";
import { goBackOrHome } from "@/data/navigation";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

const paymentMethods: Sale["method"][] = ["Full payment", "Partial credit", "Overpayment"];

export default function CartScreen() {
  const { data, cart, changeQuantity, clearCart, completeSale } = useInventory();
  const [payment, setPayment] = useState<Sale["method"]>("Full payment");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(today());
  const [amountPaid, setAmountPaid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const lines = cart.map((line) => ({ ...line, product: data.products.find((item) => item.id === line.productId) })).filter((line) => !!line.product);
  const subtotal = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  const checkout = async () => {
    if (!lines.length || lines.length !== cart.length) { setError("Your cart has an unavailable product. Return to sales and add it again."); return; }
    if (!validDate(saleDate)) { setError("Enter a valid sale date."); return; }
    const paid = Number(amountPaid);
    if (payment === "Partial credit" && (!customerName.trim() || !amountPaid.trim() || !Number.isFinite(paid) || paid <= 0 || paid >= subtotal)) {
      setError("Enter a customer and an amount paid between zero and the total."); return;
    }
    if (payment === "Overpayment" && (!amountPaid.trim() || !Number.isFinite(paid) || paid <= subtotal)) {
      setError("Enter an amount tendered greater than the total."); return;
    }
    setBusy(true); setError("");
    try { setReceipt(await completeSale(payment, { customerName: customerName.trim(), saleDate, amountPaid: payment === "Full payment" ? subtotal : paid })); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete sale."); }
    finally { setBusy(false); }
  };

  if (receipt) return (
    <Page>
      <View className="min-h-[75vh] items-center justify-center">
        <View className="h-20 w-20 items-center justify-center rounded-[26px] bg-[#DFF8EC]"><Icon name="checkmark-circle" size={48} color="#08AD7D" /></View>
        <Text className="mt-6 text-[25px] font-extrabold text-ink">Sale completed</Text>
        <Text className="mt-2 text-center text-[12px] leading-5 text-muted">Your inventory and dashboard have been updated.</Text>
        <Surface className="mt-8 w-full p-5"><Text className="text-[11px] text-muted">Receipt number</Text><Text className="mt-1 text-[17px] font-bold text-ink">{receipt.id}</Text><View className="mt-4 flex-row justify-between border-t border-line pt-4"><Text className="text-[12px] text-muted">Sale total</Text><Text className="text-[16px] font-extrabold text-brand">{money(receipt.total)}</Text></View><View className="mt-2 flex-row justify-between"><Text className="text-[12px] text-muted">Amount received</Text><Text className="text-[13px] font-bold text-ink">{money(receipt.tendered ?? receipt.total)}</Text></View></Surface>
        <View className="mt-7 w-full"><Button title="Start another sale" onPress={() => router.replace("/sales")} /></View>
      </View>
    </Page>
  );

  return (
    <Page>
      <TopBar title={`Current cart (${count})`} subtitle="Review items and take payment" right={cart.length ? <Pressable onPress={clearCart}><Text className="text-[11px] font-bold text-danger">Clear cart</Text></Pressable> : null} />
      {lines.length === 0 ? <EmptyState icon="cart-outline" title="Your cart is empty" detail="Find products in the point of sale to start a transaction." action="Browse products" onAction={() => router.replace("/sales")} /> : <>
        <Surface className="px-4 py-1">
          {lines.map(({ product, quantity }) => product && <View key={product.id} className="flex-row items-center gap-3 border-b border-line py-4 last:border-b-0">
            <ProductArt product={product} size="small" />
            <View className="flex-1"><Text className="text-[11px] font-bold text-ink" numberOfLines={2}>{product.name}</Text><Text className="mt-1 text-[10px] text-muted">{money(product.price)} each</Text><Text className="mt-2 text-[12px] font-bold text-brand">{money(product.price * quantity)}</Text></View>
            <View className="items-center gap-2"><Pressable onPress={() => changeQuantity(product.id, quantity + 1)} className="h-7 w-7 items-center justify-center rounded-lg border border-line"><Icon name="add" size={15} color="#0869F2" /></Pressable><Text className="text-[12px] font-bold text-ink">{quantity}</Text><Pressable onPress={() => changeQuantity(product.id, quantity - 1)} className="h-7 w-7 items-center justify-center rounded-lg border border-line"><Icon name="remove" size={15} color="#0869F2" /></Pressable></View>
          </View>)}
        </Surface>
        <SectionTitle title="Order summary" />
        <CartSummary subtotal={subtotal} />
        <SectionTitle title="Payment method" />
        <View className="flex-row flex-wrap gap-2">{paymentMethods.map((method) => <Chip key={method} title={method} selected={payment === method} onPress={() => setPayment(method)} />)}</View>
        <View className="mt-4"><InputField label="Sale date (YYYY-MM-DD)" value={saleDate} onChangeText={setSaleDate} required /><InputField label="Buyer / customer" required={payment === "Partial credit"} value={customerName} onChangeText={setCustomerName} placeholder="Walk-in customer" /></View>
        {payment === "Full payment" ? <View className="flex-row justify-between rounded-xl bg-[#E0F8EE] p-3"><Text className="text-[11px] text-[#078759]">Amount paid</Text><Text className="text-[11px] font-bold text-[#078759]">{money(subtotal)}</Text></View> : null}
        {payment === "Partial credit" ? <View><InputField label="Amount paid (ETB)" required value={amountPaid} onChangeText={setAmountPaid} placeholder="0" keyboardType="decimal-pad" /><View className="flex-row justify-between rounded-xl bg-[#FFF2DE] p-3"><Text className="text-[11px] text-[#8B6500]">Remaining credit</Text><Text className="text-[11px] font-bold text-[#8B6500]">{money(Math.max(subtotal - (Number(amountPaid) || 0), 0))}</Text></View></View> : null}
        {payment === "Overpayment" ? <View className="mt-4"><InputField label="Amount tendered (ETB)" required value={amountPaid} onChangeText={setAmountPaid} placeholder="0" keyboardType="decimal-pad" /><View className="flex-row justify-between rounded-xl bg-[#E8F1FF] p-3"><Text className="text-[11px] text-brand">Change due</Text><Text className="text-[11px] font-bold text-brand">{money(Math.max((Number(amountPaid) || 0) - subtotal, 0))}</Text></View></View> : null}
        {error ? <Text className="mt-4 text-[11px] font-semibold text-danger">{error}</Text> : null}
        <View className="mt-8"><Button title={busy ? "Completing sale..." : `Complete sale · ${money(subtotal)}`} onPress={() => void checkout()} disabled={busy} /></View>
        <Pressable onPress={goBackOrHome} className="mt-3 items-center py-3"><Text className="text-[12px] font-semibold text-muted">Continue shopping</Text></Pressable>
      </>}
    </Page>
  );
}
