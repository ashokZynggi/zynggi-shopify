# Zynggi Phase 5 — Step 4 Note

## Fixed in theme
- Fixed the Liquid SearchAction syntax error in `snippets/meta-tags.liquid`.
- Fixed the live announcement message to `Free shipping on orders above ₹499`.
- Updated `templates/page.private-label.json` so the dedicated Private Label section is the primary page content and the generic Page content section is disabled to prevent a duplicate H1.

## Important Shopify Admin step
If the existing Shopify page is still assigned to **Default page**, Shopify will not automatically switch that existing page to `page.private-label.json` just because the template file exists.

For the existing Private Label page:
1. Shopify Admin → Online Store → Pages.
2. Open the Private Label page.
3. In the Theme template selector, choose **private-label** (or the template corresponding to `page.private-label.json`).
4. Save.
5. Re-open the page in the theme editor and verify the dedicated Private Label section appears.

This is a Shopify page-to-template assignment, not a missing Liquid section.
