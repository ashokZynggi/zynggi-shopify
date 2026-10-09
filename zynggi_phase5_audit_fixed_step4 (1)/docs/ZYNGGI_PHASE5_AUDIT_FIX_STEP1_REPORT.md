# Zynggi Phase-5 Audit Fix Report — Step 1/2

Base: `zynggi_theme_phase5_corrected_original_based`

## Fixed in this pass

### Critical functionality / CRO
- Cart section IDs now use `{{ section.id }}` so the cart page uses its real template section ID.
- Cart mutations send `sections_url: window.location.pathname`.
- Cart item count is updated from Shopify mutation responses instead of an unconditional extra `/cart.js` request.
- Cart add errors use an accessible `role="alert"` toast instead of `alert()`.
- Empty cart now provides product suggestions.
- Mobile cart button opens the cart drawer when drawer mode is enabled.
- Mobile Account link is hidden when Shopify customer accounts are disabled.

### Homepage / UX
- Homepage has a meaningful hidden H1 fallback: `Pure Indian Spices, Ground Fresh` when the hero heading is blank.
- Hero autoplay changed from 3s to 6s.
- Hero pause/play control added; autoplay pauses on hover/focus.
- Empty quality-step content replaced with the intended five quality stages.
- Testimonial editor hint is now shown only inside Shopify theme editor.
- Homepage dish links no longer use dev-store URLs or invalid metaobject URLs. Known recipe links remain relative; unverified dish destinations use safe search URLs instead of broken links.

### 404
- Replaced B2B wholesale 404 layout with the actual 404 section plus a popular-products section.

### FAQ / trust
- `[ANSWER FROM CLIENT]` and blank FAQ answers are excluded from storefront markup.
- Placeholder FAQ answers are also excluded from FAQPage JSON-LD.
- Footer navigation blocks re-enabled.
- Footer address/hours/FSSAI formatting corrected.

### SEO
- Homepage meta description fallback added.
- Search/cart pages marked `noindex, follow`.
- Collection canonical explicitly uses the collection URL without filter parameters.
- Social share image setting added.
- Twitter image metadata added.
- Organization JSON-LD now includes social `sameAs` links and logo fallback.
- Homepage WebSite/SearchAction JSON-LD added.
- Product JSON-LD now emits offers for product variants and avoids blank review counts.
- Breadcrumb JSON-LD now includes item URLs.
- Collection/page/dish/product-usage image alt text improved.
- Recipe JSON-LD extended with existing prep/cook/nutrition/article content fields when available.
- Return & Replacement Policy title changed to H1.

### PDP / CRO
- Variant JSON now includes compare-at price, unit price, measurement and featured media ID.
- Variant switching updates compare price, savings, unit price, availability and featured media.
- Buy Now visibility is synchronized with selected variant availability.
- Optional Shopify dynamic checkout button setting added.
- Product WhatsApp enquiry CTA added using existing WhatsApp setting.
- Product gallery uses each media item's own alt text with product-title fallback.

### Collection UX
- Collection filtering/sorting now uses Shopify Section Rendering API with graceful full-page fallback.
- Collection section is marked with its real section ID.
- First four collection-card images are eager-loaded; later cards remain lazy.
- Stray disabled product section removed from `collection.json`.

### Search / performance
- Predictive search requires at least 2 characters.
- Previous predictive-search requests are aborted when a new request starts.
- Recent-search localStorage writes are guarded for restricted/private browsing.
- Dead hero-slider code in `theme.js` was removed because the actual hero section owns its slider logic.
- `responsive-pages.css` is no longer requested on the homepage.
- Product-carousel has a fallback to all products if its selected collection is missing, preventing the empty "Select a collection" state.

## Validation
- JSON parse errors: 0
- `theme.js` syntax errors: 0

## Still requiring real Shopify/Supabase data or a later pass

1. Supabase RLS must be verified against the real database policies; the theme cannot safely invent these policies.
2. B2B/admin code should eventually move out of the storefront theme into a dedicated app/backend.
3. Actual recipe page handles should be confirmed in Shopify Admin for Chaat/Chicken/Biryani/Rajma instead of the current safe search fallbacks.
4. Footer/menu configuration should be confirmed in Shopify Navigation.
5. Store name shown as `My Store` is Shopify store metadata, not a theme-code problem; update Store details in Shopify Admin.
6. Large B2B section consolidation, inline-style cleanup, drawer focus trapping, deeper performance work and locale extraction remain for the next step.
