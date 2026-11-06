# PrimeStock

PrimeStock is an npm workspace with a separate Expo SDK 57 mobile app in `apps/mobile` and a Next.js web app in `apps/web`. Both apps handle branch inventory, suppliers, receiving, point of sale, customer debts, reports, import purchases, courier arrivals, and bank transfers. The mobile UI uses NativeWind and supports English, Amharic, and Afaan Oromo.

The repository also contains a desktop-first Next.js workspace in `apps/web`. It uses the same Supabase project, phone/password accounts, stock records, and database functions as the mobile app. Shared types, calculations, phone normalization, and translations live in `packages/domain`.

## Install and run

```bash
nvm use
npm ci
cp -n apps/mobile/.env.example apps/mobile/.env.local
cp -n apps/web/.env.example apps/web/.env.local
# Fill in the public Supabase URL and publishable key in each app's .env.local.
npm run mobile
```

From another terminal, run `npm run web` for the Next.js app at `http://localhost:3000`. Install once at the repository root; the root `package-lock.json` covers both apps and `packages/domain`. Do not run a separate `npm ci` inside either app.

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env.local`, and their `NEXT_PUBLIC_` equivalents in `apps/web/.env.local`. The configured project in this workspace is `sbptnsywbankfjwvkzqk`. Both values are public and embedded in client bundles; never put a service role key in an app. Local env files are ignored by Git.

Expo SDK 57 requires Node.js 22.13 or newer; `.nvmrc` selects 24.22.0. `npm run mobile` detects the laptop's LAN address for Android Expo Go. Put the phone and laptop on the same Wi-Fi and scan the fresh QR code with an Expo Go build that supports SDK 57. If LAN detection chooses the wrong interface, run `EXPO_LAN_IP=<laptop-wifi-ip> npm run mobile`. Use `npm run mobile:web` for the Expo web preview; `npm run web` starts the separate Next.js app. [Expo Go compatibility guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

| Goal | Root command |
| --- | --- |
| Start mobile for Expo Go | `npm run mobile` |
| Start mobile on Android or iOS | `npm run mobile:android` or `npm run mobile:ios` |
| Build the Android preview APK with EAS | `npm run mobile:build:apk` |
| Start Next.js web | `npm run web` |
| Build Next.js web | `npm run web:build` |
| Check both apps | `npm run check` |

## Accounts and data

Choose **Explore demo** to use in-memory sample data without an account. Demo changes reset when the app reloads. Choose **Sign in** to create an account with a unique phone number and password or to sign in with those credentials. Ethiopian mobile numbers can be entered as `0912345678`, `712345678`, or `+251912345678`; other countries use an international `+` country code. Phone numbers are normalized to international format before Supabase Auth checks uniqueness. Sign-up does not send an SMS or require phone confirmation. A signed-in user gets a private workspace with a default branch. Create suppliers and products first, then receive stock. Sales, debts, reports, imports, arrivals, and transfers use persistent Supabase data. Changing branches loads that branch's products and transactions. An arrival linked to a purchase cannot exceed its remaining quantity. The database updates stock and sales in transactions and limits each user to their own records with row-level security.

The database schema, functions, policies, and private receipt bucket are in `supabase/migrations/202611010001_primestock.sql`. That migration has been applied to the configured Supabase project. For a new project, run:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push --dry-run
supabase db push
```

Use that new project's URL and publishable key in both apps' `.env.local` files. In **Authentication → Providers → Phone** in the Supabase dashboard, enable phone authentication and disable phone confirmations. No SMS provider is needed for this flow. These settings are active on `sbptnsywbankfjwvkzqk`. The equivalent local config is `[auth.sms] enable_signup = true` and `enable_confirmations = false`. Supabase CLI v2.93.0 warns that it will disable phone login without an SMS provider during `supabase config push`, so review its Auth diff before accepting a push. Without an SMS or email recovery channel, forgotten passwords require an administrator to reset the account; users should retain their passwords. Existing email-only Supabase accounts are separate identities: signing up with a new phone account will create a new private workspace rather than transfer their data.

## Project layout

- `apps/mobile/src/app/`: Expo Router screens and five tabs.
- `apps/mobile/assets/`, `apps/mobile/app.json`, `apps/mobile/eas.json`: mobile assets and native build configuration.
- `apps/web/src/app/`: Next.js landing, sign-in, and protected workspace routes.
- `apps/web/src/components/screens/`: desktop inventory, sales, procurement, debts, imports, transfers, reports, and branches.
- `packages/domain/`: shared inventory and trade types, calculations, phone normalization, and translations.
- `apps/mobile/src/components/`: mobile controls, product visuals, and trade status messages.
- `apps/mobile/src/context/`: authentication, language, inventory, and trade state.
- `apps/mobile/src/data/`: mobile demo and Supabase adapters.
- `apps/web/src/lib/api.ts`: web Supabase adapter for the same database functions.
- `supabase/migrations/`: SQL schema, RPC functions, row-level security, and receipt storage.
- `apps/mobile/scripts/start-expo-lan.js`: LAN address selection for Expo Go.

## Desktop web app

After the one-time root install, run `npm run web`. The web app reads `apps/web/.env.local`.

Open `http://localhost:3000`. The root landing page leads to phone/password sign-in. Signed-in routes are `/dashboard`, `/inventory`, `/sales`, `/procurement`, `/debts`, `/imports`, `/transfers`, `/reports`, and `/branches`. The selected branch is saved in the browser. Use the same account on Android and web to see the same records. Supabase SSR cookies protect the web routes; all database writes use the existing Supabase functions and row-level policies. No secret or service-role key belongs in either app.

The language selector is available on the landing page, sign-in page, and inside the workspace. The browser remembers English, Amharic, or Afaan Oromo. Some data-driven text and Supabase error messages may still appear in English.

The current database isolates data by **account owner** (`user_id`). Separate staff accounts do not yet share a company workspace, and the branch `staff` count is not a permission system. Add organization memberships and database policies before inviting employees under separate logins. Phone sign-up has no SMS confirmation or self-service password recovery; arrange an administrator recovery process before a wider client rollout.

Build and check the web app with `npm run web:build` and `npm run web:check`. This app requires a Next.js runtime host; the Expo web preview remains available through `npm run mobile:web`.

## Checks

```bash
npm run check
npm run mobile:doctor
npm run mobile:export:android
npm run web:build
```

These checks verify static code and bundles. Complete a signed-in Android walkthrough on a device before release, including phone sign-up, duplicate number rejection, branch switching, stock intake, checkout, and receipt upload. The profile's notification switch currently affects only the current app session; push notifications and multi-user staff roles are not implemented.

## Android client preview

`apps/mobile/eas.json` contains a `preview` profile that builds an internally distributed APK with the public Supabase connection values. Run `npm run mobile:build:apk` from the repository root. Expo provides an install link when the cloud build finishes. The preview APK is a standalone app and does not require Expo Go or a running development server.
