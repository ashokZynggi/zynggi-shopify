# Zynggi Phase 5 Audit Fix — Step 2

Base: `zynggi_phase5_audit_fixed_step1.zip`

## Scope

Step 2 focuses on the audit items that can be safely fixed inside the Shopify theme without guessing Supabase database policies:

- accessibility of drawers and business modals
- keyboard focus trapping and focus return
- safer business portal token persistence
- accessible replacement for JavaScript `alert()` calls
- mobile tap-target/safe-area improvements
- consistency of the free-shipping setting default
- preservation of the existing RLS architecture rather than inventing client-side authorization

## Changes

### 1. Drawer accessibility

- Added `aria-hidden` state to the mobile menu, cart drawer and search dialog.
- Added `aria-expanded` and `aria-controls` to drawer-opening buttons.
- Added keyboard focus trapping for open drawers.
- Added focus return to the element that opened the drawer.
- Escape closes the active drawer.
- Added visible keyboard focus styling.

### 2. Business portal session storage

- Access tokens are now stored in `sessionStorage` rather than persistent `localStorage`.
- Existing legacy `localStorage` access tokens are migrated into `sessionStorage` once and removed from `localStorage`.
- Logout/session cleanup clears both stores for compatibility.
- Profile/user display data remains separate from the access-token storage.

This reduces persistent browser exposure, but it does not replace server/database authorization.

### 3. Accessible notifications

- Replaced portal `alert()` calls with a reusable `window.zynggiNotify()` notification using `role="alert"` and `aria-live`.
- This applies to admin and salesman error/success/print messages.

### 4. Business modals

- Salesman order modal now focuses its close control when opened and returns focus to the opener when closed.
- Admin inventory modal now has dialog semantics, `aria-hidden` state and keyboard focus trapping.

### 5. Mobile accessibility

- Mobile navigation links/buttons have a minimum 44px touch target.
- Safe-area padding is applied to the mobile bottom navigation.

### 6. Theme setting consistency

- `free_shipping_threshold` default in `settings_schema.json` is now 499 to match the live theme setting.

## Security boundary intentionally not changed

Supabase publishable credentials may appear in browser code. They are not service-role secrets. The real authorization boundary remains Supabase Auth + Row Level Security (RLS).

This step does **not** invent or overwrite RLS policies because the actual database schema/policies are not available in the Shopify theme export.

## Validation

- JSON validation: 0 errors
- `assets/theme.js`: Node syntax check passed
- Portal `alert()` calls: 0 remaining in audited portal sections
- Dynamic database values in the reviewed admin/salesman templates remain escaped where inserted into HTML.

## Still pending for a later step

- Actual Supabase RLS verification with the live project/schema
- Moving the B2B/admin portal out of the Shopify marketing theme into a separate app/subdomain (strategic/medium-term)
- Larger B2B code consolidation/performance refactor
- Full collection/filter performance optimization and remaining UX refinements
- Final real-device/browser QA
