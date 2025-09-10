# CryptoBali — Архитектурная карта

Дата: 2025-09-10

## Флоу/дерево (Mermaid)
```mermaid
flowchart TD
  _verify["/verify"]
  _pin["/pin"]
  _home["/home"]
_verify --> _pin
_pin --> _home
  _actions_exchange["/actions/exchange"]
_home --> _actions_exchange
  _actions_qr["/actions/qr"]
_home --> _actions_qr
  _actions_send["/actions/send"]
_home --> _actions_send
  _actions_topup["/actions/topup"]
_home --> _actions_topup
  _history["/history"]
_home --> _history
  _kyc["/kyc"]
_home --> _kyc
  _referrals["/referrals"]
_home --> _referrals
  _settings["/settings"]
_home --> _settings
  _support["/support"]
_home --> _support
  subgraph APIs
    _api_aml["/api/aml"]
    _api_auth_verify["/api/auth/verify"]
    _api_new_pairs["/api/new-pairs"]
    _api_payment_notify["/api/payment/notify"]
    _api_referral_link["/api/referral/link"]
    _api_user_verify_level["/api/user/verify-level"]
    _api_wallet_balance["/api/wallet/balance"]
  end
  classDef miss stroke-dasharray: 5 5,stroke:#f59e0b,color:#f59e0b;
```

## Роуты (pages)
- ✅ `/`
- ✅ `/actions/exchange`
- ✅ `/actions/qr`
- ✅ `/actions/send`
- ✅ `/actions/topup`
- ✅ `/history`
- ✅ `/home`
- ✅ `/kyc`
- ✅ `/pin`
- ✅ `/referrals`
- ✅ `/settings`
- ✅ `/support`
- ✅ `/verify`


## API (app/api)
- ✅ `/api/aml`
- ✅ `/api/auth/verify`
- ✅ `/api/new-pairs`
- ✅ `/api/payment/notify`
- ✅ `/api/referral/link`
- ✅ `/api/user/verify-level`
- ✅ `/api/wallet/balance`


## Дерево файлов (срез)

```text
web
├─ .gitignore
├─ .vercel
│  ├─ README.txt
│  └─ project.json
├─ README.md
├─ app
│  ├─ (auth)
│  │  └─ pin
│  │     └─ page.tsx
│  ├─ (onboarding)
│  │  └─ verify
│  │     └─ page.tsx
│  ├─ actions
│  │  ├─ exchange
│  │  │  └─ page.tsx
│  │  ├─ qr
│  │  │  └─ page.tsx
│  │  ├─ send
│  │  │  └─ page.tsx
│  │  └─ topup
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ aml
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  └─ verify
│  │  ├─ new-pairs
│  │  │  └─ route.ts
│  │  ├─ payment
│  │  │  └─ notify
│  │  ├─ referral
│  │  │  └─ link
│  │  ├─ user
│  │  │  └─ verify-level
│  │  └─ wallet
│  │     └─ balance
│  ├─ error.tsx
│  ├─ globals.css
│  ├─ history
│  │  └─ page.tsx
│  ├─ home
│  │  └─ page.tsx
│  ├─ kyc
│  │  └─ page.tsx
│  ├─ layout.tsx
│  ├─ not-found.tsx
│  ├─ page.backup.txt
│  ├─ page.keep.txt
│  ├─ page.tsx
│  ├─ providers.tsx
│  ├─ referrals
│  │  └─ page.tsx
│  ├─ settings
│  │  └─ page.tsx
│  └─ support
│     └─ page.tsx
├─ components
│  ├─ providers
│  │  └─ TonConnectProvider.tsx
│  └─ wallet
│     ├─ Connect.tsx
│     ├─ JettonUtils.ts
│     ├─ QRScanner.tsx
│     ├─ RequestPayment.tsx
│     ├─ SendJettonForm.tsx
│     └─ SendTonForm.tsx
├─ docs
│  └─ ARCHITECTURE.md
├─ lib
│  ├─ aml
│  │  └─ providers
│  │     ├─ hapi.ts
│  │     ├─ tonapi.ts
│  │     └─ trm.ts
│  ├─ deeplink.ts
│  ├─ memdb.ts
│  └─ tg.ts
├─ next-env.d.ts
├─ next.config.js
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ public
│  └─ tonconnect-manifest.json
├─ scripts
│  ├─ gen-arch.mjs
│  └─ scaffold.mjs
└─ tsconfig.json
```

> Файл сгенерирован автоматически: `scripts/gen-arch.mjs`.
