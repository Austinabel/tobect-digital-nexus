# Running the website and its admin

This website is a shop and company site for a solar and energy business. Everything a business owner normally changes (prices, products, banners, contact details, policies) is edited in the **admin** at `/admin`. Code changes are only needed for new features.

This guide has three parts:

1. **[Day-to-day](#1-day-to-day-for-the-owner-and-staff)** — for the owner and staff.
2. **[Setting up a new copy](#2-setting-up-a-new-copy-for-a-developer)** — for a developer installing the site for a business (including reusing it for a different business).
3. **[Reference](#3-reference)** — roles, data, backups, safety.

---

## 1. Day-to-day (for the owner and staff)

Sign in at **`/account/login`**, then open **`/admin`**. The dashboard shows what needs attention and, for the owner and admins, a **Getting started** checklist that ticks itself off as the site is set up.

| I want to… | Go to |
|---|---|
| Change phone, WhatsApp, email, address, branches, opening hours, logo text, social links | **Site settings** |
| Add or edit a product, its price, photos and stock | **Products** → Add product (on a phone: **Scan product with camera**) |
| Split a category into types (e.g. Inverters → Hybrid inverters) | **Categories & brands** → Add → “Put it under” |
| Put a product on sale | Product → set **Previous price** (it then shows “Save X%” and appears in Sale & Deals) |
| Add a solar kit or change what’s in one | **Solar kits** (prices add up automatically from the products) |
| Choose “Popular” or “New arrivals” products | **Collections** |
| Run a promotion banner with start and end dates | **Banners & slides** → New banner |
| Change the homepage background photos | **Banners & slides** → Homepage slideshow |
| Confirm, dispatch or cancel an order; record a payment | **Orders** (confirming deducts tracked stock; cancelling returns it) |
| Answer a quote request | **Quote requests** → open it → Reply (saves it and opens WhatsApp) |
| Edit About, FAQs, projects, testimonials, warranty, returns, terms, privacy | **Pages** |
| Change the appliances in the solar calculator | **Calculator settings** |
| See sales, top sellers and quote win rate | **Reports** |
| Give someone a login and a role | **Team & roles** (they must first create an account at `/account/register`) |
| Download a copy of everything | **Backup & export** (owner only) |

### Writing pages
Policy pages and FAQ answers use a small, safe format, with no HTML:

```
## A heading
A paragraph. Leave a blank line between paragraphs.

- a bullet point
1. a numbered step
**bold text** and [a link](/support) or [an outside link](https://example.com)
```

These placeholders fill in automatically from Site settings, so a policy stays correct when your details change: `{email}` `{phone}` `{whatsapp}` `{legalName}` `{name}` `{shortName}` `{hours}` `{branches}` `{address}`.

### Rules the site enforces for you
- **Prices are never made up.** Kit prices are the sum of the product prices. “Save X%” only appears with a genuine previous price.
- **Promotions end on time.** A banner with an end date disappears by itself. “Always-on” banners cannot carry an offer or dates.
- **No product is listed twice.** The same barcode, SKU, or brand + model number can't be saved twice (even if the first is in the trash), and very similar names must be confirmed. The same photo file is never stored twice.
- **Testimonials need consent.** A review can’t be saved without ticking that the customer agreed.
- **Images in use can’t be deleted** from the media library until they’re replaced where they’re used.
- **Every admin change is logged** in the Activity log, with who did it and when.

---

## 2. Setting up a new copy (for a developer)

You need: Node.js 20 or newer, a [Supabase](https://supabase.com) project, and somewhere to host a Next.js app (for example Vercel).

### 2.1 Configure
1. Copy `.env.example` to `.env.local` and fill it in. Each line says where to find the value in the Supabase dashboard. **Never commit `.env.local` or share the secret key.**
2. Set `ADMIN_SETUP_TOKEN` to a long random secret (16+ characters). It’s used once to claim the admin.
3. In Supabase → **Authentication → Providers → Email**, turn **off** “Confirm email” (the shop’s sign-up is designed to work without it), and set up SMTP under **Authentication → Emails** so password-reset emails come from your own address.
4. In Supabase → **Authentication → URL Configuration**, set the **Site URL** to your web address and add `https://YOUR-DOMAIN/account/reset-password/confirm` to the **Redirect URLs**.

### 2.2 Create the database
Run these in order:

```bash
npm install
npm run db -- migrate        # creates every table, rule and function (supabase/migrations)
npm run media:migrate        # creates the public "media" storage bucket and uploads the starter photos
npm run db -- seed           # starter categories, sample products, kits, banners and slides
npm run db:check             # security check: every line must say PASS
npm test                     # unit tests
```

`npm run db -- status` shows which migrations have run. Each migration has a matching `.down.sql` for undoing it during development.

> The seed is for a **fresh** database. It never overwrites edits, but on a live site it can bring back starter rows you deliberately deleted, so don’t re-run it there.

### 2.3 Claim the admin
1. Start the site (`npm run dev`, or deploy it).
2. Create an account at `/account/register` with the owner’s email.
3. While signed in, open `/admin/setup` and enter the `ADMIN_SETUP_TOKEN`. That account becomes the **Owner**. The setup page stops working once an owner exists; you can remove the token afterwards.

### 2.4 Make it the new business’s site
Everything below is done in the admin, and the dashboard checklist tracks it:

1. **Site settings:** name, short name (used in “Hello …” WhatsApp greetings), legal name, web address, contacts, address, branches, logo text or logo image, social links.
2. **Products:** add the real products, then **Products → Samples → Move all samples to trash**. While samples remain, the shop shows an “indicative prices” notice.
3. **Banners & slides** and **Solar kits:** replace the starter photos and kits.
4. **Pages:** About, FAQs, Warranty, **Returns** (hidden until written), Terms and Privacy. Have a lawyer review the legal pages.
5. **Team & roles:** add staff.

**Still in the code:** a few things aren’t editable in the admin yet, and a developer changes them:
- the homepage headline and “why choose us” points (`src/app/(marketing)/page.tsx`);
- the Solutions and Installation pages (`src/lib/data/solutions.ts`, `src/app/(marketing)/installation/page.tsx`);
- the menu links (`src/components/marketing/site-header.tsx`, `site-footer.tsx`);
- the colour theme (`src/app/globals.css`);
- the solar calculator’s engineering factors (`src/lib/calculator.ts`, `src/lib/solar-design.ts`). These are kept out of the admin on purpose, because a wrong value would produce unsafe designs.

### 2.5 Card payments (optional)
Add `PAYSTACK_SECRET_KEY` to the server’s environment (use a `sk_test_…` key first). Checkout then offers card payment; customers return to `/checkout/paystack/callback`, where the payment is verified with Paystack (amount, currency and status) before the order is marked paid. Without the key, checkout offers “pay on confirmation” only.

### 2.6 Product scanning (optional)
Add `ANTHROPIC_API_KEY` (from the Anthropic Console) to the server's environment. On **Products → Add product**, staff can then tap **Scan product with camera**:
1. the photos are saved to the product;
2. any barcode is read;
3. the brand, model, category, key specs and label values are filled in for them to check.

It only reads what is visible. It never fills in prices, stock or warranty. Without the key, staff still get camera upload, barcode reading (on phones that support it) and duplicate checks.

### 2.7 Deploy
Set the same environment variables on the host, **except `DATABASE_URL`** (only needed on a developer’s machine for migrations). Run `npm run build` to check the build before going live.

---

## 3. Reference

### Roles
Roles are bundles of permissions, stored in the `admin_roles` table:

| Role | Can |
|---|---|
| **Owner** | everything, including Team & roles and Backup & export |
| **Admin** | everything except managing the team and backups |
| **Shop manager** | products, categories, kits, collections, media |
| **Product lister** | add and edit products, upload media |
| **Sales / orders** | orders, quote requests, customers, reports |
| **Content editor** | banners, slides, pages, media |

Every action is checked on the server; hiding a button is never the only protection. The database also has row-level security, so the public website key can only read published content.

### Backups
- **Backup & export** (owner): a full JSON backup of all business data, plus CSV spreadsheets of products, customers and orders.
  - The JSON backup leaves out passwords and private order links.
  - Images stay in Supabase Storage; the backup lists their addresses.
  - Store backups safely, because they contain customers’ personal details. Every download is logged.
- **Restoring** isn’t a button, because it overwrites live data. A developer restores by loading the JSON `tables` into an empty copy of the schema (after `npm run db -- migrate`), table by table in the order they appear in the file, using the Supabase secret key or a SQL client. Test on a separate project first.
- Supabase also keeps its own database backups, depending on the plan. Check the Supabase dashboard.

### Where things live
| What | Where |
|---|---|
| Business details | table `site_settings` (validated by `src/lib/site.ts`) |
| Pages, FAQs, testimonials, projects, policies, calculator appliances | table `page_content` (schemas in `src/lib/content.ts`) |
| Products, categories, kits, banners, slides, collections | their own tables (see `supabase/migrations`) |
| Orders and quotes | `orders`, `order_items`, `order_events`, `quote_requests`, … |
| Staff and permissions | `staff_members`, `admin_roles` |
| Images | Supabase Storage bucket `media`, listed in `media_assets` |

If the database can’t be reached, pages fall back to the launch content and details in the code instead of breaking.

### Safety checklist for developers
- Keep `SUPABASE_SECRET_KEY`, `DATABASE_URL` and `PAYSTACK_SECRET_KEY` server-side only. **Rotate them** if they were ever shared.
- Run `npm run db:check` after any database change. It tries the things a stranger might attempt with the public key, and every line must say PASS.
- Add database changes as new files in `supabase/migrations`, each with a `.down.sql`. Never edit one that has already run.
