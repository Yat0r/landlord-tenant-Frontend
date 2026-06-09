LANDLORD-001 — Landlord dashboard

As a Landlord, I can view a dashboard showing only my own rental data.

Acceptance Criteria
Landlord sees own properties only.
Landlord sees own units only.
Landlord sees occupied and available units.
Landlord sees active leases.
Landlord sees rent/payment summary when available.
Landlord sees open maintenance requests.
Landlord sees needs-attention items.
No Admin-wide data is shown.
LANDLORD-002 — View properties as stacked cards

As a Landlord, I can view my properties as stacked cards so that each property is easy to manage.

Acceptance Criteria
Each property appears as a separate card.
Cards stack vertically.
Each card shows property name, location, status, and summary stats.
Each card shows related units, tenants, leases, payments, rent charges, and maintenance when available.
LANDLORD-003 — Add property

As a Landlord, I can add a property if the backend allows landlord property creation.

Acceptance Criteria
If backend supports landlord property creation, Add Property opens a real form.
On successful save, the new property appears as a new card.
If backend does not support creation, button shows Requires backend support.
No fake local-only property creation.
LANDLORD-004 — View units

As a Landlord, I can view units under my properties so that I know what is occupied or available.

Acceptance Criteria
Landlord sees only units under own properties.
Landlord can filter by property.
Landlord can filter by status.
Landlord can see unit number, type, rent, deposit, status, and tenant if occupied.
LANDLORD-005 — View tenants

As a Landlord, I can view tenants occupying my units so that I can manage tenant relationships.

Acceptance Criteria
Landlord sees tenants linked to own properties only.
Landlord can search tenants.
Landlord can filter by property/unit.
Clicking tenant opens tenant details drawer or page.
Tenant details show profile, unit, lease, payments, rent charges, and maintenance if available.
LANDLORD-006 — View leases

As a Landlord, I can view leases for my units so that I can track occupancy.

Acceptance Criteria
Landlord sees leases for own units only.
Landlord can see tenant, property, unit, dates, rent, deposit, and status.
Landlord cannot see another landlord’s leases.
LANDLORD-007 — View rent charges and billing

As a Landlord, I can view rent charges and billing items for my properties so that I can track amounts due.

Acceptance Criteria
Landlord sees rent charges for own units only.
Landlord can see rent amount, utility amount, total amount, amount paid, balance, and status.
Landlord can see billing items such as garbage, electricity, water, penalties, and discounts.
LANDLORD-008 — View payments and allocations

As a Landlord, I can view payments and allocations so that I understand rent collection.

Acceptance Criteria
Landlord sees payments for own leases only.
Landlord can see payment status and transaction reference.
Landlord can see which rent charge was settled if allocations exist.
LANDLORD-009 — View maintenance

As a Landlord, I can view maintenance requests for my units so that I can respond to tenant issues.

Acceptance Criteria
Landlord sees maintenance for own units only.
Landlord can filter by status and priority.
Landlord can view tenant, unit, property, issue, reported date, and resolution notes.
8. Tenant Workflows
TENANT-001 — Tenant dashboard

As a Tenant, I can view a dashboard showing only my rental information.

Acceptance Criteria
Tenant sees own data only.
Tenant sees current property.
Tenant sees current unit.
Tenant sees active lease.
Tenant sees current rent charge if available.
Tenant sees payment status.
Tenant sees open maintenance requests.
TENANT-002 — View profile

As a Tenant, I can view my profile so that I can confirm my account details.

Acceptance Criteria
Tenant can view full name.
Tenant can view phone number.
Tenant can view email.
Tenant can view national ID if available.
Tenant can view emergency contact if available.
Tenant can see account linking status.
TENANT-003 — View lease

As a Tenant, I can view my active lease so that I know my agreement details.

Acceptance Criteria
Tenant sees own lease only.
Tenant sees property.
Tenant sees unit.
Tenant sees lease start and end date.
Tenant sees monthly rent.
Tenant sees deposit.
Tenant sees lease status.
TENANT-004 — View rent charges

As a Tenant, I can view my rent charges so that I know what I owe.

Acceptance Criteria
Tenant sees own rent charges only.
Tenant can see billing month/year.
Tenant can see rent amount.
Tenant can see utility amount.
Tenant can see total amount.
Tenant can see amount paid.
Tenant can see balance.
Tenant can see status.
TENANT-005 — View billing items

As a Tenant, I can view billing items so that I understand charges like garbage, electricity, water, penalties, and discounts.

Acceptance Criteria
Tenant can see billing items for own rent charges.
Tenant can see item description.
Tenant can see amount.
Tenant can see type: rent, garbage, electricity, water, penalty, discount.
TENANT-006 — View payments

As a Tenant, I can view my payment history so that I can confirm rent payments.

Acceptance Criteria
Tenant sees own payments only.
Tenant can see date, amount, method, status, and transaction reference.
Tenant can see allocations if available.
Tenant cannot see another tenant’s payments.
TENANT-007 — Create maintenance request

As a Tenant, I can create a maintenance request for my leased unit so that repairs can be tracked.

Acceptance Criteria
Tenant can create request only for own active leased unit.
Tenant enters title.
Tenant enters description.
Tenant selects priority.
Tenant submits request to real backend.
Tenant sees success or validation error.
TENANT-008 — View maintenance requests

As a Tenant, I can view my maintenance requests so that I can track progress.

Acceptance Criteria
Tenant sees own maintenance requests only.
Tenant can see title, priority, status, reported date, resolved date, and resolution notes.
9. PropertyManager Workflows
PM-001 — PropertyManager dashboard

As a PropertyManager, I can view a dashboard for assigned work.

Acceptance Criteria
If backend assignment scoping is not implemented, show Requires backend assignment support.
Do not expose Admin-only data.
Do not show audit logs, settings, or users/roles.
PM-002 — Assigned properties

As a PropertyManager, I can view assigned properties only.

Acceptance Criteria
PropertyManager sees assigned properties only when backend supports assignments.
PropertyManager cannot see all admin properties.
PM-003 — Assigned maintenance

As a PropertyManager, I can view assigned maintenance requests.

Acceptance Criteria
PropertyManager sees maintenance for assigned properties/units only.
Can update status only if backend policy allows.
Cannot access Admin-only areas.
10. Future Real-World Feature Stories
FUTURE-001 — Automated rent reminders

As a Landlord, I want rent reminders sent to tenants so that late payments are reduced.

Acceptance Criteria
Feature remains Coming soon until backend reminder service exists.
No fake SMS or email is shown as sent.
FUTURE-002 — M-Pesa Paybill/STK integration

As a Tenant, I want to pay rent through M-Pesa STK or Paybill so that payment is easier.

Acceptance Criteria
Feature remains Coming soon until backend M-Pesa integration exists.
Frontend does not mark payment successful without backend confirmation.
FUTURE-003 — Receipts

As a Tenant or Landlord, I want receipts for confirmed payments so that payments can be proven.

Acceptance Criteria
Receipts are shown only after backend receipt support exists.
PDF download appears only if backend supports PDF generation.
FUTURE-004 — Arrears tracking

As an Admin or Landlord, I want arrears tracking so that overdue tenants are visible.

Acceptance Criteria
Arrears are calculated from RentCharges, AmountPaid, Balance, and PaymentAllocations.
No fake arrears values are displayed.
FUTURE-005 — Tenant risk scoring

As a Landlord, I want tenant payment risk indicators so that I can identify risky payment behaviour.

Acceptance Criteria
Risk scoring uses real payment and arrears data.
No AI-based risk score is shown unless implemented and explained.
FUTURE-006 — Lease expiry alerts

As a Landlord, I want lease expiry alerts so that I can renew or prepare for vacancy.

Acceptance Criteria
Alerts are based on real lease end dates.
No fake lease expiry warnings are shown.
FUTURE-007 — Vacancy and application pipeline

As a Landlord, I want available units and applications so that vacant units can be filled faster.

Acceptance Criteria
Available units come from real Unit.Status.
Applications are shown only after backend application workflow exists.
FUTURE-008 — KRA/eTIMS-ready reports

As a Landlord, I want rental income reports so that I can prepare tax records.

Acceptance Criteria
Reports use confirmed payments, receipts, rent charges, billing items, units, properties, and landlords.
The system must not claim KRA/eTIMS compliance until exports and receipt formats are implemented.
11. Security and Data Isolation
SEC-001 — Tenant data isolation

As a Tenant, I must never see another tenant’s data.

Acceptance Criteria
Tenant pages use tenant-scoped APIs.
Tenant cannot access another tenant’s leases, rent charges, payments, allocations, receipts, or maintenance.
SEC-002 — Landlord data isolation

As a Landlord, I must only see records for my own properties.

Acceptance Criteria
Landlord pages use landlord-scoped APIs.
Landlord cannot see another landlord’s properties, units, leases, tenants, payments, rent charges, or maintenance.
SEC-003 — Admin-only areas

As the system, Admin-only areas must remain protected.

Acceptance Criteria
Only Admin can access Admin dashboard.
Only Admin can access global landlord/tenant/property management.
Only Admin can access audit logs.
Wrong roles redirect to /unauthorized.
12. Immediate Frontend Priorities

Build the frontend in this order:

1. Update API layer for Units, RentCharges, BillingItems, UtilityServices, MeterReadings, and PaymentAllocations.
2. Finish Admin Properties page.
3. Build Admin Units page.
4. Build Admin RentCharges page.
5. Build Admin Utility Billing page.
6. Build Admin PaymentAllocations UI.
7. Build Landlord Properties page.
8. Build Landlord Tenants page.
9. Build Landlord Billing page.
10. Build Tenant Dashboard.
11. Build Tenant Billing page.
12. Build Tenant Maintenance page.
13. Add Receipts UI after backend receipts are implemented.
14. Add Reports after backend reporting is implemented.