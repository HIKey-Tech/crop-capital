# CropCapital Roadmap

**From Agricultural Investment Platform to Digital Infrastructure for African Agriculture**

_Prepared by HiKey Limited — March 2026_

---

## Where We Are Today

CropCapital is a working multi-tenant web application. The core product allows platform operators to create branded investment experiences where investors browse agricultural farm projects, invest money through Paystack, and earn returns when crop cycles mature.

What is already built and functional:

- Multi-tenant architecture — each tenant (e.g. a cooperative, an agribusiness, a fund manager) gets their own branded experience with custom colours, logos, and feature toggles.
- Investor journeys — sign up, browse farms, view farm details, invest through Paystack, track portfolio, manage a watchlist.
- Admin operations — create and manage farm listings, review investors, process KYC documents, monitor transactions and payouts, view audit reports.
- Super-admin console — create tenants, configure branding and features, manage tenant lifecycle (activate, deactivate, delete), assess launch readiness.
- Identity and access — role-based permissions (super admin, tenant admin, investor), tenant-scoped authentication, admin-to-investor mode switching.
- Payment integration — Paystack for investment payments, webhook-driven verification, ROI transfer infrastructure.
- KYC verification — document upload through Cloudinary, admin review and approval/rejection workflow.
- Activity logging — 16 event types covering user actions, farm operations, investments, KYC, and tenant changes.

What is partially built or still needed:

- The investment checkout flow (amount selection, payment method, confirmation) needs completion.
- Notifications are generated from investment data, but there is no dedicated notification inbox or push system.
- Farm analytics and admin reporting are limited — no investor breakdown charts, no data export (CSV/PDF).
- Real-time features (live funding progress, push notifications) do not exist.
- The platform handles four currencies (NGN, USD, GHS, KES) but cross-currency aggregation is unresolved.
- Email infrastructure is configured but not robustly used for transactional or marketing communication.
- Offline or low-bandwidth usage is not supported.
- There are no mobile applications.
- There is no field agent or aggregator interface.
- There is no supply chain traceability or crop monitoring module.

---

## Where We Need to Go

The letter to AGRA describes CropCapital as **digital infrastructure** that enables:

1. Structured registration and management of farmers and field operations
2. Real-time tracking of production cycles and activities
3. Transparent aggregation and supply chain monitoring
4. End-to-end traceability of agricultural outputs
5. Comprehensive analytics and reporting for program evaluation

Today, CropCapital is an **investment platform**. The AGRA vision requires it to become an **agricultural operations platform** — one that tracks what happens on the ground, not just how money moves. This is a significant expansion. The investment engine remains valuable (especially to attract capital into AGRA-supported programs), but it must sit alongside new capabilities for farmer management, field operations, aggregation, and traceability.

The partnership with AGRA is expected to bring access to their network of farmers and aggregators — the demand side of the equation. CropCapital needs to supply the digital infrastructure that makes those relationships visible, trackable, and reportable.

---

## The Roadmap

The roadmap is structured in five phases, each building on the previous one. The phases are designed to deliver value early and often, while progressively expanding the platform's capabilities toward the full AGRA vision.

### Overall Progress

- [ ] **Phase 1 — Finish the Foundation**
- [ ] **Phase 2 — Introduce the Farmer**
- [ ] **Phase 3 — Track Production and Aggregation**
- [ ] **Phase 4 — Traceability and Analytics**
- [ ] **Phase 5 — Scale and Sustain**

---

### Phase 1: Finish the Foundation

**Goal:** Make the existing platform production-ready and reliable enough to demo confidently to AGRA.

This phase is about completing what is already started. Nothing new is added — the focus is on closing gaps in the current product so that a live demonstration does not hit dead ends.

- [x] **1.1 — Complete the Investment Checkout Flow**

Right now, an investor can browse farms but the actual payment journey (select amount, choose payment method, confirm, receive receipt) has gaps. This must work end-to-end before any serious demo. An investor should be able to go from "Invest Now" to "Payment Confirmed" without confusion.

- [ ] **1.2 — Validate Payment Success Against a Live Gateway**

The failure path for payment callbacks has been tested, but a successful payment using a real Paystack transaction has not been verified against the live gateway. This must be done before any money changes hands on the platform.

- [x] **1.3 — Build a Notification Inbox**

Investors need to see meaningful notifications — "Your investment in Maize Farm Kaduna was confirmed", "ROI payment of ₦45,000 has been processed", "Farm ABC posted a new update." This is not optional for a production platform; users expect it.

- [x] **1.4 — Add Data Export for Admins**

Tenant admins and super admins need to download reports — investor lists, transaction histories, farm performance — as CSV or PDF. This is especially important for AGRA, where program officers need to report to donors and stakeholders using data they can share outside the platform.

- [x] **1.5 — Define Tenant Admin Activation**

When a super admin creates a new tenant (say, for an AGRA country program), there needs to be a clear flow for how the first tenant admin gets access. Right now, this path is undefined. The flow should be: super admin creates tenant → invites tenant admin via email → tenant admin sets password → tenant admin begins operating.

- [ ] **1.6 — Harden Error Handling and Empty States**

Every page must handle errors gracefully and show useful empty states. A programme officer in Nairobi reviewing a newly created tenant should see helpful guidance ("No farms have been added yet"), not a blank screen or a crash.

**When this phase is done:** CropCapital can be demonstrated to AGRA as a working, multi-tenant agricultural investment platform where money flows, data is visible, and the experience feels polished.

---

### Phase 2: Introduce the Farmer

**Goal:** Extend the platform from tracking investments to tracking the people who grow the crops.

This is the critical expansion. Today, CropCapital knows about farms (as investment vehicles) and investors (as people who put money in). It does not know about **farmers** (as people who do the work). AGRA's value proposition is their network of smallholder farmers and aggregators. CropCapital needs a way to register, profile, and track them.

- [ ] **2.1 — Farmer Registration Module**

Build a new module for farmer profiles. A farmer record should capture:

- Name, phone number, location (GPS coordinates and human-readable address)
- Farm size (in hectares), crops grown, farming experience
- Group or cooperative membership
- Photo (for identification)
- Registration source (e.g. "AGRA Enumerator, Kaduna State")

Farmers are not investors and they do not log in. Their data is entered by field agents or aggregators through the platform. In AGRA's model, farmers are participants in a programme, not platform users.

- [ ] **2.2 — Field Agent Interface**

AGRA works through field agents — people on the ground who visit farmers, collect data, and coordinate activities. These agents need a lightweight, mobile-friendly interface where they can:

- Register new farmers
- Update farmer profiles (new crops, change in farm size)
- Log field visits with notes and photos
- Record production data (e.g. "Farmer planted 2 hectares of maize on 15 March")

This interface should work on low-cost Android smartphones and handle poor network connectivity. Data should be captured offline and synced when a connection is available.

- [ ] **2.3 — Link Farmers to Farms**

Today, a "farm" is an investment listing. Going forward, a farm should also have a connection to the actual farmers working the land. This means:

- A farm listing can be associated with one or more registered farmers
- A farm's production updates can reference specific farmer activities
- Investors can see (at a summary level) who is growing their crops

This creates the bridge between the investment world and the agricultural reality.

- [ ] **2.4 — Farmer Dashboard for Tenant Admins**

Tenant admins (in the case of AGRA, programme coordinators) need a dedicated view to manage farmers:

- total registered farmers, registration trends, geographic distribution
- filter and search by location, crop, cooperative
- export farmer lists for programme reporting

**When this phase is done:** CropCapital can register and manage the farmers that AGRA brings to the platform. Field agents can capture data on the ground. The platform starts to become an agricultural operations tool, not just an investment tool.

---

### Phase 3: Track Production and Aggregation

**Goal:** Follow the crop from planting to harvest and through the aggregation chain.

AGRA's letter specifically calls for "real-time tracking of production cycles" and "transparent aggregation and supply chain monitoring." This phase delivers both.

- [ ] **3.1 — Production Cycle Tracking**

Each farm should have a structured production timeline that tracks key stages:

- Land preparation
- Planting (with crop type, variety, area planted)
- Input application (fertiliser, pesticides — with quantities, dates, and sources)
- Growth monitoring (regular check-ins with photos and notes)
- Harvest (actual yield in kg/tonnes, date, quality grade)
- Post-harvest handling (drying, storage, packaging)

Field agents record these stages through the mobile interface. Each entry is timestamped, geotagged, and linked to the farmer and the farm.

Currently, the platform has a basic "farm updates" feature (stage progression with titles and descriptions). This needs to be expanded into a structured, data-driven production tracking system.

- [ ] **3.2 — Aggregator Module**

In Africa's agricultural value chains, aggregators are the people and companies that buy from smallholders, bulk the produce, and sell onward. AGRA works closely with aggregators to ensure farmer produce reaches markets.

The platform needs:

- Aggregator registration (company name, location, crops they handle, capacity)
- Collection records (which farmer delivered what quantity, when, at what price)
- Aggregation tracking (how much produce has been collected, from how many farmers, destined for where)
- Payment records to farmers through aggregators

This is where the platform moves from farm-level tracking to value-chain tracking.

- [ ] **3.3 — Input Tracking**

A major focus of AGRA programmes is ensuring farmers receive quality inputs (seeds, fertiliser) at the right time. The platform should track:

- Input distribution (who received what, when, from which supplier)
- Input usage (how much was applied, on which plots)
- Input effectiveness (yield comparisons between farmers who received inputs and those who did not)

This data is gold for AGRA's programme evaluation.

- [ ] **3.4 — Weather and Context Data Integration**

Where possible, integrate with public weather APIs to overlay weather data on production records. This is not about building a weather app — it is about being able to say "Farmer X planted maize on 15 March in a region that received 40mm of rainfall that week." This context makes production data much more valuable for analysis.

**When this phase is done:** CropCapital can follow a crop from the field to the aggregator. Programme officers can see what is happening on the ground in near real-time. The platform delivers on the "real-time tracking" and "aggregation monitoring" promises made to AGRA.

---

### Phase 4: Traceability and Analytics

**Goal:** Connect the dots — from investor capital, through farm operations, to crop output — and make the data useful.

- [ ] **4.1 — End-to-End Traceability**

This is the headline capability for institutional partners like AGRA. The platform should be able to answer questions like:

- "Where did the maize in this shipment come from?" → traced back to specific farmers, farms, and production records
- "What inputs were used on this crop?" → linked to input distribution records
- "How was this crop handled after harvest?" → connected to post-harvest and aggregation records

Traceability means assigning identifiers to batches of produce and linking them through the chain: farmer → field → harvest → aggregator → buyer.

This is not blockchain (which is expensive and rarely needed at this stage). It is structured data with clear links between records, presented in a way that auditors, donors, and buyers can verify.

- [ ] **4.2 — Programme Analytics Dashboard**

AGRA needs analytics. Not the kind that tell an investor how much money they made, but the kind that tell a programme officer how a $10 million initiative is performing across 5 countries and 50,000 farmers.

The analytics dashboard should provide:

- Geographic coverage (map view of registered farmers, active farms, and aggregation points)
- Programme health metrics (registration rates, production completion rates, yield averages, dropout rates)
- Comparative analysis (performance by region, by crop, by season)
- Impact indicators (yield improvement, income change for participating farmers)
- Custom date ranges and programme-period filtering

This requires a reporting layer that can aggregate data across tenants (since each AGRA country programme might be a separate tenant).

- [ ] **4.3 — Stakeholder Reporting**

AGRA reports to donors (Bill & Melinda Gates Foundation, USAID, DFID, and others). These reports require specific formats and metrics. CropCapital should support:

- Scheduled report generation (monthly, quarterly)
- Customisable report templates
- Automated data collection for standard indicators
- PDF export with branding and proper formatting

- [ ] **4.4 — Cross-Tenant Analytics for Super Admins**

The super-admin console should evolve to show portfolio-level insights across all tenants:

- Which tenants are most active
- Total farmers registered across all programmes
- Investment capital deployed vs. farmer output
- Platform-wide trends and anomalies

**When this phase is done:** CropCapital delivers on the "end-to-end traceability" and "comprehensive analytics and reporting for program evaluation" commitments. This is the phase that makes CropCapital genuinely valuable to an institutional partner like AGRA.

---

### Phase 5: Scale and Sustain

**Goal:** Make the platform reliable, accessible, and commercially sustainable across multiple African markets.

- [ ] **5.1 — Mobile Application**

The field agent interface (Phase 2) needs to become a proper mobile app. A progressive web app (PWA) may be sufficient initially, but a native Android app will be needed for:

- Reliable offline data capture
- Camera access for photos and document scanning
- GPS capture for geotagging
- Push notifications for field agents
- Performance on low-cost devices common in rural Africa

iOS can follow later, but Android is the priority — over 80% of smartphone users in sub-Saharan Africa are on Android.

- [ ] **5.2 — Multi-Language Support**

AGRA operates in 11 African countries. While English is the working language for most programme staff, field agents and farmers may work in French (West Africa), Swahili (East Africa), or local languages. The platform should support at minimum:

- English
- French
- Swahili

Translation should be applied to the field agent interface and any farmer-facing materials.

- [ ] **5.3 — SMS and USSD Integration**

Not every farmer has a smartphone. In many parts of Africa, the most reliable way to reach farmers is through SMS and USSD (the \*123# style menus on basic phones). For the platform to be truly inclusive, it should support:

- SMS notifications to farmers (collection schedules, payments received, weather alerts)
- USSD menu for farmers to check their records (deliveries, payments owed)
- Integration with services like Africa's Talking, Twilio, or local telecom APIs

- [ ] **5.4 — Payment Expansion**

Paystack is well-established in Nigeria and Ghana, but AGRA operates across the continent. The platform needs:

- Mobile money integration (M-Pesa for East Africa, MTN Mobile Money for West and Central Africa)
- Multi-currency support (completing the partial implementation already in place for NGN, USD, GHS, KES, and extending to UGX, TZS, RWF, XOF, and others as needed)
- Farmer payment disbursement (paying farmers through mobile money for produce delivered to aggregators)

- [ ] **5.5 — API and Integration Layer**

As CropCapital becomes infrastructure, other systems will need to connect to it:

- Public API for approved third-party applications
- Data exchange with AGRA's existing systems
- Integration with government agricultural databases where available
- Webhook support for real-time data sharing with partner platforms

- [ ] **5.6 — Data Privacy and Compliance**

As the platform handles farmer data across multiple countries, compliance becomes critical:

- Data residency considerations (where farmer data is stored)
- Consent management (farmers must understand and agree to data collection)
- Compliance with national data protection laws (Nigeria's NDPA, Kenya's DPA, etc.)
- Secure handling of identity documents collected through KYC

- [ ] **5.7 — Commercial Model**

CropCapital needs a sustainable revenue model. Possible approaches:

- Platform licensing fees per tenant
- Transaction-based fees on investments processed
- Premium analytics and reporting tiers
- Data and insights services for institutional clients
- Custom deployment and integration consulting

The AGRA relationship should serve as the anchor partnership that validates the platform and attracts other institutional clients — development finance institutions, agricultural NGOs, government ministries, and private agribusinesses.

**When this phase is done:** CropCapital is a scalable, multi-country agricultural infrastructure platform that can serve AGRA's programmes and other institutional clients across Africa.

---

## What AGRA Brings vs. What CropCapital Brings

| AGRA Brings                                        | CropCapital Brings                                        |
| -------------------------------------------------- | --------------------------------------------------------- |
| Network of smallholder farmers across 11 countries | Digital platform to register and manage those farmers     |
| Relationships with aggregators and input suppliers | Structured tracking of aggregation and input distribution |
| Programme design and funding                       | Real-time monitoring and reporting on programme execution |
| Development expertise and credibility              | Technology infrastructure and product development         |
| Donor relationships that require reporting         | Analytics and automated reporting tools                   |
| On-the-ground presence through field agents        | Mobile tools for field agents to capture and sync data    |

---

## Risks and Honest Realities

**1. Connectivity in rural Africa is unreliable.**
The platform must work offline or with intermittent connectivity. This is not a nice-to-have — it is a hard requirement. If a field agent cannot sync data for 3 days because they are in a rural area without coverage, the platform must handle that gracefully.

**2. AGRA's timelines may not match ours.**
Large institutional partners move slowly. The letter has been sent, but the decision cycle at AGRA could take months. Phase 1 must be completed regardless, so the platform is ready for any partnership opportunity.

**3. The product gap is real.**
Going from an investment platform to an agricultural operations platform is a significant engineering effort. Phases 2 and 3 represent the bulk of new development. This is not a pivot — it is an expansion — but it requires dedicated sustained engineering work.

**4. The multi-currency challenge is harder than it looks.**
Aggregating financial data across NGN, USD, GHS, KES, and potentially UGX, TZS, RWF requires careful handling. Exchange rates fluctuate. Donor reporting may need amounts in USD regardless of local currency. This cannot be solved by simply adding currency codes to fields.

**5. Farmer data sensitivity.**
Collecting GPS coordinates, photos, and identity information from smallholder farmers is sensitive. Poor handling of this data can damage trust, violate regulations, and undermine the relationship with AGRA. Data protection must be designed in from the beginning, not bolted on later.

**6. Market timing matters.**
Digital agriculture platforms are not new in Africa. OroFarmer, FarmCrowdy, ThriveAgric, AgroMall, and others have been in this space for years, with varying degrees of success. CropCapital's differentiation is its multi-tenant architecture (serving multiple programmes and institutions from one platform) and its combination of investment tracking with field operations. This positioning must be clearly communicated in the AGRA conversation.

**7. The team must grow.**
The current codebase suggests a small team. Phases 2 through 5 require additional engineering capacity — backend developers for new modules, a mobile developer for the field agent app, a designer for the expanded UX, and someone focused on data and analytics. This is a hiring and budgeting consideration as much as a technical one.

---

## Summary View

| Phase       | Focus                            | Outcome                                                             |
| ----------- | -------------------------------- | ------------------------------------------------------------------- |
| **Phase 1** | Finish the foundation            | Production-ready platform for AGRA demo                             |
| **Phase 2** | Introduce the farmer             | Farmer registration, field agent tools, farmer-farm linkage         |
| **Phase 3** | Track production and aggregation | Production cycles, aggregator module, input tracking                |
| **Phase 4** | Traceability and analytics       | End-to-end traceability, programme analytics, stakeholder reporting |
| **Phase 5** | Scale and sustain                | Mobile app, multi-language, SMS/USSD, payment expansion, API layer  |

---

## Immediate Next Steps

- [ ] Complete Phase 1 items — these are blockers regardless of whether AGRA responds.
- [ ] Prepare a demo environment with sample data that mirrors an AGRA country programme (e.g. 500 simulated farmers in Nigeria, 3 aggregators, 10 farms) to make the platform tangible during the AGRA conversation.
- [ ] Draft a one-page partnership proposal for AGRA that maps CropCapital capabilities to AGRA's stated priorities.
- [ ] Begin wireframing the farmer registration and field agent interfaces (Phase 2) so that when the AGRA conversation advances, the technical team is not starting from zero.
- [ ] Identify integration points with AGRA's existing data systems to inform technical architecture decisions early.

---

_This document is a living plan and should be updated as the AGRA relationship develops and as platform priorities evolve._
