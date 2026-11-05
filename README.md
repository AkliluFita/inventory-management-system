# PrimeStock

PrimeStock is an Expo SDK 57 inventory app for general stock products. It has an Android and web interface for branch inventory, suppliers, receiving, point of sale, customer debts, reports, import purchases, courier arrivals, and bank transfers. The UI uses NativeWind and supports English, Amharic, and Afaan Oromo.

## Run

```bash
nvm use
npm ci
cp -n .env.example .env.local
npm start
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. The configured project in this workspace is `sbptnsywbankfjwvkzqk`. Expo embeds these public values in the app bundle. Never put a service role key in the app. `.env.local` is ignored by Git.

Expo SDK 57 requires Node.js 22.13 or newer; `.nvmrc` selects 24.22.0. `npm start` detects the laptop's LAN address for Android Expo Go. Put the phone and laptop on the same Wi-Fi and scan the fresh QR code with an Expo Go build that supports SDK 57. If LAN detection chooses the wrong interface, run `EXPO_LAN_IP=<laptop-wifi-ip> npm start`. Press `w` for the web preview. [Expo Go compatibility guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

## Accounts and data

Choose **Explore demo** to use in-memory sample data without an account. Demo changes reset when the app reloads. Choose **Sign in** to create an account with a unique phone number and password or to sign in with those credentials. Ethiopian mobile numbers can be entered as `0912345678`, `712345678`, or `+251912345678`; other countries use an international `+` country code. Phone numbers are normalized to international format before Supabase Auth checks uniqueness. Sign-up does not send an SMS or require phone confirmation. A signed-in user gets a private workspace with a default branch. Create suppliers and products first, then receive stock. Sales, debts, reports, imports, arrivals, and transfers use persistent Supabase data. Changing branches loads that branch's products and transactions. An arrival linked to a purchase cannot exceed its remaining quantity. The database updates stock and sales in transactions and limits each user to their own records with row-level security.

The database schema, functions, policies, and private receipt bucket are in `supabase/migrations/202611010001_primestock.sql`. That migration has been applied to the configured Supabase project. For a new project, run:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push --dry-run
supabase db push
```

Use that new project's URL and publishable key in `.env.local`. In **Authentication → Providers → Phone** in the Supabase dashboard, enable phone authentication and disable phone confirmations. No SMS provider is needed for this flow. These settings are active on `sbptnsywbankfjwvkzqk`. The equivalent local config is `[auth.sms] enable_signup = true` and `enable_confirmations = false`. Supabase CLI v2.93.0 warns that it will disable phone login without an SMS provider during `supabase config push`, so review its Auth diff before accepting a push. Without an SMS or email recovery channel, forgotten passwords require an administrator to reset the account; users should retain their passwords. Existing email-only Supabase accounts are separate identities: signing up with a new phone account will create a new private workspace rather than transfer their data.

## Project layout

- `src/app/`: Expo Router screens and five tabs.
- `src/components/`: shared controls, product visuals, and trade status messages.
- `src/context/`: authentication, language, inventory, and trade state.
- `src/data/inventoryApi.ts` and `src/data/tradeApi.ts`: data contracts and demo adapters.
- `src/data/supabase*.ts`: Supabase client and signed-in adapters.
- `supabase/migrations/`: SQL schema, RPC functions, row-level security, and receipt storage.
- `scripts/start-expo-lan.js`: LAN address selection for Expo Go.

## Checks

```bash
npx expo lint
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android --output-dir /tmp/primestock-android-export
npx expo export --platform web --output-dir /tmp/primestock-web-export
```

These checks verify static code and bundles. Complete a signed-in Android walkthrough on a device before release, including phone sign-up, duplicate number rejection, branch switching, stock intake, checkout, and receipt upload. The profile's notification switch currently affects only the current app session; push notifications and multi-user staff roles are not implemented.

## Android client preview

`eas.json` contains a `preview` profile that builds an internally distributed APK with the public Supabase connection values. Build it with `npx eas-cli@latest build --platform android --profile preview`. Expo provides an install link when the cloud build finishes. The preview APK is a standalone app and does not require Expo Go or a running development server.
