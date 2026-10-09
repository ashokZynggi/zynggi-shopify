# Zynggi Phase 5 Audit Fix — Step 3

Base: `zynggi_phase5_audit_fixed_step2.zip`

This step addresses the remaining non-Supabase-RLS items that could be safely changed without requiring live Shopify Admin data or guessing database permissions.

## Completed

### Mobile navigation
- Removed duplicate Search item when customer accounts are disabled.
- Added a conditional `mnav--no-account` class so the mobile nav uses four equal columns instead of leaving an empty fifth column.
- Preserved the Account item only when Shopify customer accounts are enabled.

### Cart drawer performance
- Limited empty-cart product scan to 12 products.
- Limited upsell collection scan to 12 products.
- Replaced the nested cart-items loop with a single `map: 'product_id'` lookup, removing the avoidable O(n²) membership check.

### Collection UX
- Added an active-filter summary showing how many filters are applied and a clear-filters link.
- Preserved the existing Section Rendering API filtering flow.

### Free shipping setting
- Changed the theme setting default from 0/off to ₹499, matching the currently stored theme setting.

### Contact data
- Corrected the contact-page address formatting.
- Replaced the incorrect `24 Hours Open` text with `Monday – Saturday | 10:00 AM – 6:00 PM`.

### FAQ editor hygiene
- Removed literal `[ANSWER FROM CLIENT]` defaults from the FAQ/product template data.
- Changed the FAQ section's default answer to blank.
- Existing runtime/schema guards remain so blank placeholder answers are not published as FAQ structured data.

### Locale foundation
- Added a useful `locales/en.default.json` starter structure for common UI strings. Existing hard-coded strings were not globally replaced in this step because doing a blind global replacement could alter section-specific copy.

## Validation

- JSON validation: 0 errors.
- `assets/theme.js`: JavaScript syntax check passed.
- No remaining live `[ANSWER FROM CLIENT]`, `24 Hours Open`, old dev-store URL, or bestseller-editor-placeholder strings were found in storefront template data. The FAQ section still contains its defensive placeholder comparison and documentation default guard by design.

## Deliberately not changed

- Supabase RLS/database policies — requires the actual Supabase schema/policies and account testing.
- Large B2B section consolidation — risky to perform blindly because the five sections are used by different page templates and have different settings/UX.
- Full locale migration — requires replacing hundreds of hard-coded strings deliberately, not just adding a locale file.
- Shopify Admin store name (`My Store`) — controlled by Shopify store settings, not theme Liquid.
- Live recipe destinations — require confirming the actual intended recipe handles/pages before replacing URLs.
