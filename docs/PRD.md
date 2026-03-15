**Execution Tracker**

Status date: 2026-03-15

Completed:

1. Super-admin login flow fixed and verified.
2. Tenant-scoped login through tenant URL fixed and verified.
3. Empty-domain tenant onboarding issue fixed and verified.
4. Super-admin tenant listing and feature-save flow verified.
5. Existing tenant edit UI added to the super-admin console and browser-validated.
6. Tenant admin promote/demote controls added to tenant user management and browser-validated.
7. Super-admin tenant console realigned so it no longer surfaces investor assignment actions.
8. Tenant admins can use the same tenant-linked identity to switch into investor behavior and invest.
9. Tenant deletion is implemented, cleanup-safe, and validated against real tenant-bound records.
10. Super-admin tenant access guidance is now surfaced directly in the console for domain and slug-based entry paths.
11. Tenant-owned onboarding now routes fresh signups into a live onboarding flow and was browser-validated through completion.
12. Tenant wallet surfaces and key tenant admin routes were re-validated with seeded data.
13. A sample payment callback failure path was browser-validated to confirm user-facing recovery behavior.
14. Audit logging for tenant configuration changes and tenant admin promotions and demotions is implemented and browser-validated through the admin reports feed.
15. Tenant launch-readiness indicators are implemented in the super-admin console and browser-validated.
16. A final smoke pass confirmed investor self-serve sign-up, investor sign-in, tenant-admin mode switching and reports, and super-admin landlord console access.

Next up:

1. Validate a real successful payment callback with a live gateway reference, not only the failure path.
2. Tighten production domain-governance policy around what qualifies a tenant as launch-ready.
3. Define the tenant-admin invite and activation flow that begins from super-admin-created tenant setup.

**Validation Snapshot**

Verified in browser with Scout:

1. Global super-admin sign-in at `/auth`.
2. Super-admin tenant management at `/super-admin`.
3. Investor sign-in at `/:tenant/auth/sign-in`.
4. Investor dashboard at `/:tenant/dashboard`.
5. Investor farms browse at `/:tenant/farms`.
6. Tenant admin user promotion and demotion at `/:tenant/admin/investors`.
7. Tenant admin investor-mode investment initiation at `/:tenant/farms/:id?invest=true`.
8. Cleanup-safe tenant deletion, including returned cleanup counts for users, farms, investments, KYC, activities, webhook events, and image assets.
9. Super-admin tenant access guidance and latest cleanup summary display at `/super-admin`.
10. Tenant onboarding guest-entry fallback at `/:tenant/onboarding`.
11. Fresh tenant signup redirect into `/:tenant/onboarding`, including step completion through dashboard entry.
12. Tenant wallet metrics and activity table at `/:tenant/wallet`.
13. Tenant admin farms and investors routes at `/:tenant/admin/farms` and `/:tenant/admin/investors`.
14. Payment callback failure-state handling at `/:tenant/payment/callback` with a sample reference.
15. Audit activity entries for tenant admin promotions and demotions in `/:tenant/admin/reports`.
16. Launch-readiness indicators and readiness statuses in `/super-admin`.
17. Tenant-admin mode switching from investor view and the resulting admin dashboard navigation.

**Current-State Product Readout**
There are effectively two products in one:

1. A global platform console for `super_admin` users.
2. A tenant-branded investor/admin app for each tenant.

The platform console currently lets super admins:

1. Create tenants with `name`, `slug`, `domains`, branding, support fields, hero copy, and feature flags in `index.tsx`.
2. Activate or deactivate tenants from the same screen.
3. Update feature toggles per tenant.
4. View all tenants through `tenant.controller.ts`.
5. Delete tenants with a cleanup summary that reports which tenant-bound records and external assets were removed.
6. See tenant access guidance for preferred domain entry, local demo path, and tenant sign-in route.

The tenant app currently supports:

1. Tenant-branded auth and landing experiences through `tenant.tsx`.
2. Investor sign-in, dashboard, farms browse, investments, wallet, transactions, notifications, and settings routes.
3. Tenant admin-gated areas when `adminPortal` and related features are enabled.
4. Tenant-scoped user, farm, investment, KYC, report, payout, and transaction APIs behind feature flags and role checks.
5. Tenant-specific membership so an investor can belong to multiple tenants independently.

Important current limitation:

1. Tenant creation and lifecycle management are super-admin driven.
2. Tenant deletion is implemented and must remain cleanup-safe for every tenant-bound admin, investor membership, and related record.
3. The super-admin console now explains access entry points, but production domain rollout rules and operator copy guidance still need refinement.
4. Tenant-owned onboarding now exists for open registration, and standard investors are expected to self-serve once they have the tenant link.
5. Payment callback success behavior still needs one live gateway-backed validation pass.
6. Launch readiness is now surfaced, but the exact production-governance rules behind that status may still evolve.

**Draft PRD**
**Title**
Multi-Tenant CropCapital Platform Administration and Tenant Operations

**Problem**
CropCapital needs a reliable way to launch and operate multiple branded tenant investment experiences from one platform, while keeping global platform administration separate from tenant-level administration. The current system has the technical foundations, but the product boundaries and admin workflows are only partially surfaced in UI.

**Goal**
Ship a coherent multi-tenant operating model where:

1. Super admins can create, configure, activate, deactivate, and eventually delete tenants.
2. Tenant admins can operate only within their own tenant.
3. Investors can discover, sign in to, and use the correct tenant experience through branded tenant entry points.
4. Investors can belong to multiple tenants without the super admin mediating those memberships.
5. Tenant routing works consistently by custom domain, subdomain, and local/demo path mode.
6. Tenant admins can switch into investor behavior and invest without needing a separate account for the same tenant.

**Primary Personas**

1. Super Admin: platform operator managing tenants across the whole system.
2. Tenant Admin: operator managing farms, investors, KYC, transactions, and reports within one tenant.
3. Investor: end user who signs into one tenant and invests in farms.
4. Hybrid Tenant Admin Investor: a tenant admin who can switch into investor behavior inside the same tenant context and invest with the same credentials.

**Product Scope**
In scope:

1. Super-admin tenant lifecycle.
2. Tenant branding and domain setup.
3. Tenant feature management.
4. Tenant membership and onboarding.
5. Tenant-scoped admin permissions.
6. Tenant access and login discovery.
7. Investor tenant journeys.

Out of scope for this PRD:

1. Deep payments redesign.
2. Cross-tenant analytics warehousing.
3. Full CMS/editorial tooling.
4. Multi-language localization.

**Functional Requirements**
**A. Super Admin Console**
The super-admin console must allow:

1. Create tenant with required fields:
   `name`, `slug`, `branding.displayName`.
2. Optional tenant configuration:
   `domains`, support contacts, primary color, hero copy, legal name, short name.
3. Feature flag configuration:
   `investments`, `wallet`, `transactions`, `farms`, `news`, `notifications`, `adminPortal`, `adminFarms`, `adminInvestors`, `adminTransactions`, `adminPayouts`, `adminKyc`, `adminReports`.
4. Activate and deactivate tenants.
5. Edit tenant configuration after creation, including branding and domains.
6. View all tenants with status, domains, and enabled features.
7. Delete or archive a tenant when it should no longer operate on the platform.

Current status:

1. Implemented for create, list, activate/deactivate, feature save, edit, and delete.
2. Delete flow is validated and returns cleanup totals for tenant-bound records and assets.
3. Archival is still not implemented if the business later wants reversible tenant retirement.
4. Launch-readiness status is now surfaced in the super-admin console to help operators distinguish production-ready tenants from demo-only tenants.

**B. Tenant Access Model**
Users must be able to access tenants via:

1. Custom domain, if mapped in tenant domains.
2. Platform subdomain, if using a root domain strategy.
3. Local/demo path mode such as `/cropcapital/...`.
4. Tenant-specific entry points where the tenant, not the super admin, owns investor acquisition.

Current status:

1. Domain and subdomain resolution exist in `tenant.middleware.ts`.
2. Path mode now works in the frontend client.
3. CORS now permits tenant headers.
4. The super-admin console now includes a tenant access guide that surfaces preferred entry URL, local demo path, and sign-in path.
5. The super-admin console now also computes a readiness state so operators can see whether a tenant is launch-ready, demo-ready, or still missing setup.

**C. Tenant Authentication**

1. Super admins authenticate globally without tenant binding.
2. Investors and tenant admins authenticate within a tenant context.
3. Tenant sign-in must always send tenant context.
4. Authenticated follow-up requests must remain valid for both global and tenant-bound roles.
5. An investor may have independent memberships in multiple tenants.
6. A tenant admin may also act as an investor within the same tenant using the same tenant-linked credentials.
7. Standard investors should be able to sign up and sign in by themselves once they have the tenant-specific link.
8. Invite-based onboarding is not part of the investor journey.

Current status:

1. Fixed and verified end to end.
2. The data model already supports per-tenant memberships because user uniqueness is tenant-scoped.

**D. Tenant Admin Operations**
Tenant admins should be able to:

1. View investor lists and stats.
2. Manage farms if `adminFarms` is enabled.
3. Review investors if `adminInvestors` is enabled.
4. Review transactions if `adminTransactions` is enabled.
5. Review payouts if `adminPayouts` is enabled.
6. Review KYC if `adminKyc` is enabled.
7. Review reports if `adminReports` is enabled.
8. Promote eligible tenant users to admin.
9. Demote tenant admins back to investor.
10. Switch into investor behavior and make investments without losing admin membership.

Current status:

1. Backend permission model supports this.
2. UI coverage exists for major admin sections.
3. Promote/demote is now surfaced in the tenant admin UI with a self-demotion guard and browser validation.
4. Tenant admin investment behavior is supported by the same tenant-linked identity and should be treated as an investor-capable admin membership.
5. Farms and investor management routes were re-validated in-browser during the latest Scout pass.
6. Promote/demote events now generate audit entries visible in admin reports.

**E. Investor Experience**
Investors should be able to:

1. Discover and join through a tenant-specific URL.
2. Sign up and sign in from tenant-specific access pages without requiring an invite.
3. Land on a tenant-branded dashboard.
4. Browse farms.
5. View farm details.
6. Invest.
7. Access wallet, transactions, notifications, and settings.
8. Participate in multiple tenants without losing separation between tenant experiences.
9. If they are also a tenant admin, switch to investor mode and invest without changing credentials.

Current status:

1. Sign-in, dashboard, farms browse, and investor-mode investment initiation are now verified.
2. Fresh signup now redirects into tenant onboarding, and onboarding completion was validated through dashboard entry.
3. Wallet metrics and recent activity rendering were re-validated with seeded investments.
4. Payment callback failure handling was validated with a sample reference.
5. A real gateway-backed success callback still needs explicit pass coverage.
6. The intended product model is now explicit: once an investor has the tenant link, they self-serve their own signup and sign-in.
7. Investor invite-only onboarding is explicitly out of scope.

**Non-Functional Requirements**

1. Tenant isolation: user, farm, investment, KYC, and admin operations must remain tenant-scoped.
2. Backward-safe onboarding: empty domain lists must not break tenant creation.
3. Routing reliability: tenant access must not depend on a single deployment strategy.
4. Demo readiness: path-based local demos must work without domain setup.
5. Authorization clarity: `super_admin` is global; `admin` is tenant-scoped.

**Permissions Model**

1. `super_admin`
   Can access platform-wide tenant management, all tenant records, and global tenant operations.
2. `admin`
   Tenant-scoped operational admin. Can manage tenant-level features exposed through admin routes.
3. `investor`
   Tenant-scoped end user.

**Key Decisions**

1. Tenant creation remains a super-admin responsibility.
2. Super admins manage tenants, not tenant investors.
3. Tenant admins should not create tenants.
4. Tenant admins should be able to create additional tenant admins, but only within their own tenant and only via explicit UI controls with auditability.
5. The canonical production tenant entry should be domain or subdomain.
6. Path-based access remains supported for local/demo and possibly preview environments.
7. Investor membership is tenant-owned and can exist in more than one tenant.
8. Tenant admin and investor behavior can coexist on the same tenant-linked account.
9. Standard investor onboarding is open registration through the tenant link.
10. Invite-based onboarding is reserved for tenant-side elevated access, such as the first tenant operator or additional tenant admins.

**Open Questions**

1. Should tenant admins be allowed to edit tenant branding, or only super admins?
2. Should tenant admins be allowed to edit feature flags, or are features platform-controlled only?
3. Should tenant admins create additional tenant admins directly, or should that remain a controlled invite flow?
4. Should a tenant be able to exist without any domain configured in production, or should that only be allowed in non-production environments?
5. What should the first tenant-admin activation flow look like after a super admin creates the tenant?

**Recommended Next Product Iteration**

1. Add clearer production-domain governance and publishing rules for tenant go-live.
2. Validate a real payment callback success path against a live gateway reference.
3. Define the tenant-admin invite and activation flow that follows super-admin tenant creation.
4. Consider archival flows if reversible tenant retirement becomes necessary.
5. Expand readiness checks if operational requirements grow beyond the current launch checklist.

**What I’d Do Next After PRD Approval**

1. Validate a successful payment callback against a real gateway reference.
2. Tighten production tenant access rules around domains, previews, and launch readiness.
3. Define the tenant-admin invite and activation flow that follows super-admin tenant creation.
4. Consider whether tenant archival is needed alongside deletion.
5. Extend readiness checks once production launch policy is finalized.

If you want, I can turn this PRD into a tighter one-page product spec next, or I can start implementing the highest-value items in this order:

1. Tenant-owned onboarding UX
2. Payment callback and wallet validation
3. Audit and readiness instrumentation
