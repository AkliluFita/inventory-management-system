# PrimeStock

PrimeStock is an Expo Router inventory app prototype for general stock products. It includes a welcome screen, dashboard, inventory search and filters, procurement and suppliers, stock intake, point of sale, cart and checkout, customer debts, purchase order drafts, reports, branches, and profile. The import workflow also includes purchase costing, courier arrivals, and bank transfers with receipt selection.

The UI uses NativeWind and Expo SDK 57. It runs with in-memory mock APIs, so no backend or account is needed to explore the flows. Demo transactions reset when the app reloads. English, Amharic, and Afaan Oromo can be selected on the welcome screen or in Profile; the language choice persists on the device.

## Run

```bash
nvm use
npm ci
npm start
```

Expo SDK 57 requires Node.js 20.19 or newer; `.nvmrc` selects 20.20.2. `npm start` detects the laptop's LAN address and passes it to Expo, so the Android manifest and QR code point to an address the phone can reach. Keep the phone and laptop on the same Wi-Fi, stop any old Expo server, then scan the **new** QR code in an Expo Go build for SDK 57. If port 8081 is occupied, stop the old server or run `npm start -- --port 8082` and scan that new QR code. Press `w` in the Expo CLI to preview the web version.

If LAN detection selects the wrong network interface, run `EXPO_LAN_IP=<laptop-wifi-ip> npm start`. A manifest pointing to `127.0.0.1` cannot be loaded by a physical phone: on the phone that address points back to the phone. See [Expo Go version mismatch guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/) if the installed Android Expo Go build does not match SDK 57.

## Project structure

- `src/app/` contains Expo Router screens and the five main tabs.
- `src/components/ui.tsx` contains shared cards, controls, and product visuals.
- `src/data/inventoryApi.ts` defines product, sale, debt, intake, and branch types plus the `InventoryApi` contract and in-memory implementation.
- `src/data/tradeApi.ts` defines import purchases, courier arrivals, bank transfers, cost calculations, and a separate `TradeApi` contract.
- `src/context/InventoryContext.tsx` holds the current snapshot, selected branch, cart, and actions used by the screens.
- `src/context/TradeContext.tsx` holds import workflow data and updates inventory when a courier arrival is saved.
- `src/context/LanguageContext.tsx` stores the selected language and provides English, Amharic, and Afaan Oromo UI translations.
- `scripts/start-expo-lan.js` selects a reachable local address for Expo Go.
- `tailwind.config.js`, `babel.config.js`, `metro.config.js`, and `global.css` configure NativeWind.

## Connect a backend

Create adapters implementing `InventoryApi` and `TradeApi` in `src/data/`, then pass them to `InventoryProvider` and `TradeProvider` in `src/app/_layout.tsx`. The screens consume context, so they do not need to know whether data comes from mock adapters or HTTP endpoints. The adapters cover loading snapshots, receiving stock, creating purchase order drafts, completing sales, settling debts, recording import purchases, logging courier arrivals, and recording bank transfers.

The mock adapters are process memory only and share one catalog across branches. The receipt picker stores a local cache URI in a mock transfer record; production receipt upload, durable storage, authentication, file import, supplier order delivery, and branch-specific stock require backend services. Language preference is stored locally with AsyncStorage.

## Checks

```bash
npx expo lint
npx tsc --noEmit
npx expo-doctor
```
