# Slice 5 — Customers

## 1. Slice Information

| Property | Value |
|---|---|
| Slice Number | 5 |
| Slice Name | Customers |
| Module | Core Business Module |
| Priority | High |
| Depends On | Slice 0, Slice 1, Slice 2, Slice 3 |
| Blocks Future Slices | Slice 6 Invoices & Payments |
| Related Future Slices | Slice 7 Expenses, Slice 8 Files & Attachments, Slice 10 Notifications, Slice 11 Reports, Slice 12 Activity & Audit Logs, AI Slices |
| Estimated Complexity | Medium |
| Estimated Duration | 6–9 Development Days |
| Status | Planned |

---

## 2. Overview

The Customers module is the master customer repository for each workspace in Tetri Copilot.

It allows workspace users to create, manage, search, organize, and maintain customer records before using them in invoices, payments, reporting, compliance, and future AI-assisted workflows.

This slice must deliver a complete customer management feature, including:

- Customer master data
- Multiple customer contacts
- Primary contact management
- Customer addresses
- Country-aware tax information
- Financial settings
- Customer notes
- Customer attachments
- Customer tags
- Import and export
- Archive and restore
- Activity logging
- Audit logging
- Workspace-based security

---

## 3. Business Objectives

### 3.1 Primary Objectives

Enable users to:

- Create customer records
- Edit customer records
- View customer profiles
- Manage multiple contacts per customer
- Assign a primary contact
- Maintain customer tax information
- Maintain customer financial settings
- Add customer notes
- Upload customer documents
- Tag and segment customers
- Search, filter, import, and export customers

### 3.2 Secondary Objectives

Prepare the foundation for:

- Invoice creation
- Payment tracking
- Customer statements
- Receivables reporting
- Smart collections
- AI customer insights
- AI document analysis
- Customer risk scoring
- Natural language customer search

---

## 4. Functional Scope

### 4.1 Included in This Slice

- Customer CRUD
- Customer archive and restore
- Multiple contacts per customer
- Primary contact support
- Contact roles
- Customer address details
- Country-aware tax fields
- Customer financial profile
- Customer tags
- Customer notes
- Customer attachments
- Customer search
- Customer filters
- Customer import
- Customer export
- Activity logs
- Audit logs
- Notification triggers
- Permission enforcement
- Responsive UI

### 4.2 Not Included in This Slice

- Invoices
- Payments
- Customer portal
- CRM pipeline
- Quotations
- Sales opportunities
- Customer contracts workflow
- Automated email sending
- AI insights execution
- AI document OCR
- Customer statements

---

## 5. User Roles and Access

| Role | Access Level |
|---|---|
| Workspace Owner | Full customer access |
| Workspace Admin | Full customer access |
| User | Create, edit, view, import, export |
| Viewer | Read-only access |
| System Admin | Support/read-only access only, subject to platform rules |

---

## 6. Customer Core Entity

### 6.1 Customer Main Fields

| Field | Required | Notes |
|---|---|---|
| Customer ID | Auto | System generated |
| Workspace ID | Auto | Tenant isolation |
| Customer Code | Auto | Unique per workspace |
| Customer Name | Yes | Legal or display name |
| Customer Type | Yes | Individual, Company, Government, NGO, Other |
| Status | Yes | Active, Inactive, Suspended, Archived |
| Default Currency | Yes | From workspace/country currency list |
| Opening Balance | No | Numeric |
| Credit Limit | No | Numeric |
| Payment Terms | No | Default payment term |
| Notes | No | General customer notes |
| Created By | Auto | User ID |
| Created At | Auto | Timestamp |
| Updated By | Auto | User ID |
| Updated At | Auto | Timestamp |
| Archived At | Auto | Nullable |

---

## 7. Customer Types

Default customer types:

- Individual
- Company
- Government
- NGO
- Other

Future admin configuration may allow custom customer types.

---

## 8. Customer Statuses

Supported statuses:

- Active
- Inactive
- Suspended
- Archived

### 8.1 Active

Customer can be used in future transactions.

### 8.2 Inactive

Customer remains visible but should not be selectable for new transactions.

### 8.3 Suspended

Customer is restricted due to business, credit, or compliance reasons.

### 8.4 Archived

Customer is hidden from normal active lists but remains available for history and audit purposes.

---

## 9. Customer Contacts

Each customer can have multiple contacts.

Examples:

- Owner
- Managing Director
- Finance Manager
- Accountant
- Procurement Officer
- Operations Manager
- Project Manager
- Legal Representative
- Technical Contact

### 9.1 Customer Contact Fields

| Field | Required | Notes |
|---|---|---|
| Contact ID | Auto | System generated |
| Workspace ID | Auto | Tenant isolation |
| Customer ID | Auto | Parent customer |
| First Name | Yes | Contact first name |
| Last Name | Yes | Contact last name |
| Job Title | No | Example: Finance Manager |
| Department | No | Example: Finance |
| Email | No | Valid email format |
| Phone | No | Country-aware validation |
| Mobile | No | Country-aware validation |
| Extension | No | Optional |
| Contact Role | No | Billing, Finance, Procurement, etc. |
| Is Primary | Yes | Only one primary contact per customer |
| Is Active | Yes | Active/inactive contact |
| Notes | No | Internal notes |
| Created By | Auto | User ID |
| Created At | Auto | Timestamp |
| Updated By | Auto | User ID |
| Updated At | Auto | Timestamp |

### 9.2 Contact Roles

Default contact roles:

- Primary Contact
- Billing Contact
- Finance Contact
- Procurement Contact
- Operations Contact
- Legal Contact
- Technical Contact
- Other

### 9.3 Primary Contact Rules

- Each customer may have only one primary contact.
- When a new primary contact is selected, the previous primary contact is automatically unset.
- Primary contact appears in:
  - Customer list
  - Customer profile summary
  - Future invoice module
  - Future communication module
  - Future AI assistant context

---

## 10. Address Information

Each customer must support address details.

### 10.1 Address Fields

| Field | Required |
|---|---|
| Country | No |
| State / Region | No |
| City | No |
| Postal Code | No |
| Address Line 1 | No |
| Address Line 2 | No |

Country values come from system country configuration.

---

## 11. Tax Information

Customer tax fields must be country-aware.

The visible fields depend on the workspace country profile.

### 11.1 Example Fields by Country

#### Georgia

- Tax Identification Number
- VAT Number

#### UAE

- TRN

#### Saudi Arabia

- VAT Registration Number

#### Generic

- Tax Registration Number
- Commercial Registration Number
- Business License Number

---

## 12. Financial Information

### 12.1 Financial Fields

| Field | Required | Notes |
|---|---|---|
| Default Currency | Yes | Workspace default or selected currency |
| Opening Balance | No | Numeric |
| Credit Limit | No | Numeric |
| Payment Terms | No | Default terms |
| Account Status | Yes | Active/inactive financial status |

### 12.2 Payment Terms

Default options:

- Due Immediately
- 7 Days
- 15 Days
- 30 Days
- 45 Days
- 60 Days

Future slices may support custom payment terms.

---

## 13. Customer Tags

Customer tags allow flexible classification and segmentation.

Examples:

- VIP
- High Risk
- Government
- Strategic Client
- Supplier & Customer
- Overdue
- Prospect Converted
- Key Account
- Low Activity
- International Client

### 13.1 Tag Rules

- A customer may have multiple tags.
- Tags are workspace-specific.
- Tags are searchable.
- Tags are filterable.
- Tags can be reused across customers.
- Tags must not be duplicated within the same workspace using the same name.

### 13.2 Tag Fields

| Field | Required |
|---|---|
| Tag ID | Auto |
| Workspace ID | Auto |
| Tag Name | Yes |
| Tag Color | No |
| Created By | Auto |
| Created At | Auto |

### 13.3 Customer Tag Assignment

A linking table must connect customers and tags.

Example table:

- customer_tag_assignments

Fields:

- id
- workspace_id
- customer_id
- tag_id
- created_by
- created_at

---

## 14. Customer Notes

Users can create internal notes for each customer.

Examples:

- Follow-up notes
- Collection notes
- Meeting notes
- Customer preferences
- Internal reminders
- Important account comments

### 14.1 Note Fields

| Field | Required |
|---|---|
| Note ID | Auto |
| Workspace ID | Auto |
| Customer ID | Auto |
| Note Text | Yes |
| Created By | Auto |
| Created At | Auto |
| Updated By | Auto |
| Updated At | Auto |

Notes are internal only.

---

## 15. Customer Attachments

Customer attachments allow users to upload documents directly into the customer profile.

Examples:

- Contracts
- Agreements
- Trade licenses
- VAT certificates
- Registration documents
- Correspondence
- Statements
- Supporting files
- Customer onboarding documents

### 15.1 Supported File Types

Documents:

- PDF
- DOCX
- XLSX
- CSV
- TXT

Images:

- JPG
- JPEG
- PNG
- WEBP

### 15.2 File Size

Default maximum file size:

- 20 MB per file

This should be configurable later through system settings.

### 15.3 Attachment Fields

| Field | Required |
|---|---|
| Attachment ID | Auto |
| Workspace ID | Auto |
| Customer ID | Auto |
| File Name | Yes |
| Stored File Name | Yes |
| MIME Type | Yes |
| File Size | Yes |
| Storage Path | Yes |
| Description | No |
| Uploaded By | Auto |
| Uploaded At | Auto |
| Updated At | Auto |

### 15.4 Attachment Actions

Authorized users can:

- Upload attachment
- Preview attachment
- Download attachment
- Rename attachment
- Add/update description
- Delete attachment

### 15.5 Storage Design

Initial implementation:

- Store files in local server storage
- Store metadata in PostgreSQL

Future-compatible design:

- Cloudflare R2
- AWS S3
- Azure Blob Storage

The database design must allow migration to object storage without redesigning customer attachments.

---

## 16. Customer List Screen

### 16.1 Purpose

Provide a centralized customer management interface.

### 16.2 Table Columns

- Customer Code
- Customer Name
- Customer Type
- Primary Contact
- Email
- Phone
- Country
- Tags
- Status
- Outstanding Balance
- Created Date

Outstanding balance becomes active after Slice 6.

### 16.3 Search

Search by:

- Customer name
- Customer code
- Contact name
- Contact email
- Contact phone
- Tax number
- Tag name

### 16.4 Filters

Filter by:

- Status
- Customer type
- Country
- Currency
- Tags
- Date created
- Has attachments
- Has active contacts

### 16.5 Sorting

Sort by:

- Customer name
- Customer code
- Created date
- Status
- Balance

### 16.6 Bulk Actions

Authorized users can:

- Archive selected customers
- Export selected customers
- Apply tags
- Remove tags

---

## 17. Create Customer

### 17.1 Create Customer Form Sections

The create customer form should include:

1. Basic Information
2. Primary Contact
3. Address Information
4. Tax Information
5. Financial Information
6. Tags

Attachments and additional contacts may be added after customer creation.

### 17.2 Validation Rules

Customer Name:

- Required
- Minimum 2 characters
- Maximum 200 characters

Customer Type:

- Required

Currency:

- Required

Email:

- Must be valid format

Phone/Mobile:

- Country-aware validation where possible

Credit Limit:

- Must be numeric
- Must be positive or zero

Opening Balance:

- Must be numeric

### 17.3 System Actions on Create

After successful creation:

- Generate customer ID
- Generate customer code
- Save customer record
- Save primary contact if entered
- Save tags if selected
- Create activity log
- Create audit log
- Show success notification

---

## 18. Customer Details Screen

The customer details screen must provide a full customer profile.

### 18.1 Header Summary

Display:

- Customer name
- Customer code
- Status
- Type
- Primary contact
- Tags
- Currency
- Outstanding balance placeholder

### 18.2 Tabs

Customer profile tabs:

1. Overview
2. Contacts
3. Address & Tax
4. Financial
5. Notes
6. Attachments
7. Activity Timeline

### 18.3 Overview Tab

Displays:

- Core customer information
- Status
- Type
- Tags
- Primary contact summary
- Financial summary placeholder

### 18.4 Contacts Tab

Displays all customer contacts.

Columns:

- Name
- Job Title
- Department
- Role
- Email
- Mobile
- Primary
- Status

Actions:

- Add contact
- Edit contact
- Set as primary
- Deactivate contact
- Reactivate contact
- Delete contact, if allowed

### 18.5 Address & Tax Tab

Displays:

- Address details
- Country-specific tax fields

### 18.6 Financial Tab

Displays:

- Default currency
- Opening balance
- Credit limit
- Payment terms
- Outstanding balance placeholder
- Total invoices placeholder
- Paid invoices placeholder
- Overdue invoices placeholder

Invoice-related figures become active after Slice 6.

### 18.7 Notes Tab

Displays customer notes.

Actions:

- Add note
- Edit own note
- View note history if supported

### 18.8 Attachments Tab

Displays customer documents.

Columns:

- File name
- File type
- File size
- Uploaded by
- Uploaded date
- Description

Actions:

- Upload
- Preview
- Download
- Edit metadata
- Delete

### 18.9 Activity Timeline

Displays:

- Customer created
- Customer updated
- Customer archived
- Customer restored
- Contact created
- Contact updated
- Primary contact changed
- Note added
- Attachment uploaded
- Attachment deleted
- Tags updated

---

## 19. Edit Customer

Authorized users can edit:

- Basic customer information
- Status
- Address
- Tax fields
- Financial information
- Tags
- Contacts
- Notes
- Attachments

Every significant update must generate an activity log.

Sensitive changes must generate an audit log.

---

## 20. Archive and Restore Customer

### 20.1 Archive Rules

Authorized users can archive customers.

Initial implementation allows archive unless restricted by system rules.

Future restrictions may include:

- Open unpaid invoices
- Active payment disputes
- Compliance restrictions

### 20.2 Archive System Actions

When archived:

- Set status to Archived
- Set archived timestamp
- Record archived by
- Create activity log
- Create audit log
- Show confirmation notification

### 20.3 Restore System Actions

When restored:

- Set status to Active
- Clear archived timestamp
- Record restored by
- Create activity log
- Create audit log
- Show confirmation notification

---

## 21. Customer Import

### 21.1 Purpose

Allow bulk creation of customer master data.

### 21.2 Supported Formats

- CSV
- XLSX

### 21.3 Importable Fields

- Customer Name
- Customer Type
- Status
- Currency
- Opening Balance
- Credit Limit
- Payment Terms
- Country
- City
- Address Line 1
- Tax Number
- Primary Contact First Name
- Primary Contact Last Name
- Primary Contact Email
- Primary Contact Phone
- Tags

### 21.4 Import Validation

System validates:

- Missing required fields
- Duplicate customers
- Invalid emails
- Invalid phone format
- Invalid currencies
- Invalid customer type
- Invalid status
- Invalid tag format

### 21.5 Import Result Screen

Displays:

- Total records processed
- Successfully imported records
- Failed records
- Validation errors
- Download error file option

---

## 22. Customer Export

### 22.1 Supported Formats

- CSV
- XLSX

### 22.2 Export Rules

Export must respect:

- Workspace isolation
- User permissions
- Current filters
- Selected records, if applicable

### 22.3 Export Fields

Export may include:

- Customer code
- Customer name
- Customer type
- Status
- Primary contact
- Contact email
- Contact phone
- Country
- City
- Currency
- Opening balance
- Credit limit
- Payment terms
- Tags
- Created date

---

## 23. Dashboard Widgets

### 23.1 Total Customers

Total number of customers in workspace.

### 23.2 Active Customers

Number of active customers.

### 23.3 New Customers

Customers created this month.

### 23.4 Customers by Status

Simple status breakdown.

### 23.5 Customers by Tag

Simple tag breakdown.

### 23.6 Outstanding Receivables

Placeholder until Slice 6.

### 23.7 Top Customers

Placeholder until Slice 6.

---

## 24. Permissions Matrix

| Action | Owner | Admin | User | Viewer |
|---|---|---|---|---|
| View Customers | Yes | Yes | Yes | Yes |
| Create Customer | Yes | Yes | Yes | No |
| Edit Customer | Yes | Yes | Yes | No |
| Archive Customer | Yes | Yes | No | No |
| Restore Customer | Yes | Yes | No | No |
| Create Contact | Yes | Yes | Yes | No |
| Edit Contact | Yes | Yes | Yes | No |
| Set Primary Contact | Yes | Yes | Yes | No |
| Delete Contact | Yes | Yes | No | No |
| Add Note | Yes | Yes | Yes | No |
| Upload Attachment | Yes | Yes | Yes | No |
| Delete Attachment | Yes | Yes | No | No |
| Manage Tags | Yes | Yes | Yes | No |
| Import Customers | Yes | Yes | Yes | No |
| Export Customers | Yes | Yes | Yes | Yes |

---

## 25. Security Requirements

### 25.1 Workspace Isolation

All customer-related records must include `workspace_id`.

Users must only access records belonging to their active workspace.

Applies to:

- Customers
- Contacts
- Notes
- Attachments
- Tags
- Tag assignments
- Import records
- Export records

### 25.2 Backend Authorization

Every API endpoint must enforce:

- Authenticated user
- Active workspace context
- Workspace membership
- Role permission
- Record ownership by workspace

### 25.3 File Security

Customer attachments must:

- Be accessible only by authorized workspace users
- Not expose raw storage paths publicly
- Use controlled download endpoints
- Validate file type and size
- Prevent dangerous file uploads

---

## 26. Activity Logging

Create activity logs for:

- Customer created
- Customer updated
- Customer archived
- Customer restored
- Contact created
- Contact updated
- Contact deactivated
- Contact reactivated
- Primary contact changed
- Note added
- Attachment uploaded
- Attachment deleted
- Tags updated
- Import completed
- Export completed

Activity logs will integrate with Slice 12.

---

## 27. Audit Logging

Create audit logs for sensitive actions:

- Status changed
- Customer archived
- Customer restored
- Credit limit changed
- Payment terms changed
- Primary contact changed
- Contact deleted
- Attachment deleted
- Tags changed
- Import executed
- Export executed

Audit logs will integrate with Slice 12.

---

## 28. Notifications

Generate notifications for:

- Customer created
- Customer archived
- Customer restored
- Import completed
- Import failed
- Upload failed

Notification delivery will use Slice 10 when available.

For this slice, backend events should be prepared for notification integration.

---

## 29. API Endpoints

### 29.1 Customers

```http
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
PATCH  /api/customers/:id/archive
PATCH  /api/customers/:id/restore

29.2 Customer Contacts
GET    /api/customers/:id/contacts
POST   /api/customers/:id/contacts
GET    /api/customer-contacts/:id
PUT    /api/customer-contacts/:id
PATCH  /api/customer-contacts/:id/deactivate
PATCH  /api/customer-contacts/:id/reactivate
PATCH  /api/customer-contacts/:id/set-primary
DELETE /api/customer-contacts/:id
29.3 Customer Notes
GET    /api/customers/:id/notes
POST   /api/customers/:id/notes
PUT    /api/customer-notes/:id
DELETE /api/customer-notes/:id
29.4 Customer Attachments
GET    /api/customers/:id/attachments
POST   /api/customers/:id/attachments
GET    /api/customer-attachments/:id
PUT    /api/customer-attachments/:id
DELETE /api/customer-attachments/:id
GET    /api/customer-attachments/:id/download
29.5 Customer Tags
GET    /api/customer-tags
POST   /api/customer-tags
PUT    /api/customer-tags/:id
DELETE /api/customer-tags/:id
POST   /api/customers/:id/tags
DELETE /api/customers/:id/tags/:tagId
29.6 Import and Export
POST   /api/customers/import
GET    /api/customers/export
30. Database Tables
30.1 Primary Tables
customers
customer_contacts
customer_notes
customer_attachments
customer_tags
customer_tag_assignments
30.2 Future Related Tables
invoices
invoice_items
payments
payment_allocations
customer_statements
files
file_links
31. Database Entity Details
31.1 customers

Suggested fields:

id
workspace_id
customer_code
customer_name
customer_type
status
default_currency
opening_balance
credit_limit
payment_terms
country
state_region
city
postal_code
address_line_1
address_line_2
tax_identifier
vat_number
commercial_registration_number
business_license_number
notes
created_by
created_at
updated_by
updated_at
archived_by
archived_at
31.2 customer_contacts

Suggested fields:

id
workspace_id
customer_id
first_name
last_name
job_title
department
email
phone
mobile
extension
contact_role
is_primary
is_active
notes
created_by
created_at
updated_by
updated_at
31.3 customer_notes

Suggested fields:

id
workspace_id
customer_id
note_text
created_by
created_at
updated_by
updated_at
31.4 customer_attachments

Suggested fields:

id
workspace_id
customer_id
file_name
stored_file_name
mime_type
file_size
storage_path
description
uploaded_by
uploaded_at
updated_at
31.5 customer_tags

Suggested fields:

id
workspace_id
tag_name
tag_color
created_by
created_at
updated_at
31.6 customer_tag_assignments

Suggested fields:

id
workspace_id
customer_id
tag_id
created_by
created_at
32. Frontend Requirements
32.1 Pages
Customers List Page
Create Customer Page
Edit Customer Page
Customer Details Page
32.2 Components
Customer Table
Search Bar
Filter Drawer
Customer Summary Cards
Customer Form
Contact Form
Contacts Table
Tags Selector
Notes Panel
Attachments Panel
Upload Dialog
Activity Timeline
Import Wizard
Export Button
Archive Confirmation Dialog
Restore Confirmation Dialog
32.3 UI Stack

Use:

React
TypeScript
Shadcn/UI
Tailwind CSS
TanStack Table
React Hook Form
Zod
Lucide Icons
32.4 UI Standards

The UI must be:

Clean
Professional
Responsive
Mobile-friendly
Consistent with Tetri Copilot branding
Accessible where possible
Easy for non-technical SME users
33. Backend Requirements

Use:

Express.js
Prisma
PostgreSQL
Auth middleware from previous slices
Workspace middleware
Role/permission middleware
File upload middleware
Validation middleware

Backend must provide:

Secure REST APIs
Proper validation
Consistent error handling
Pagination
Sorting
Filtering
Search
Audit hooks
Activity hooks
34. AI Readiness

No AI execution is required in this slice.

However, the data structure must support future AI capabilities:

Customer insights
Customer risk scoring
Smart collections
AI customer assistant
Natural language customer search
AI document analysis
AI invoice preparation
Customer segmentation

Important fields for future AI:

Customer notes
Tags
Contacts
Attachments metadata
Payment terms
Credit limit
Status
Activity timeline
35. Validation Requirements
35.1 Customer Validation
Customer name is required
Customer type is required
Currency is required
Duplicate customer names should trigger warning
Customer code must be unique per workspace
35.2 Contact Validation
First name required
Last name required
Email format validation
Only one primary contact per customer
35.3 Tag Validation
Tag name required
Tag name unique per workspace
Tag cannot be assigned twice to the same customer
35.4 Attachment Validation
File type must be allowed
File size must not exceed limit
File must belong to correct workspace/customer
36. Error Handling

System must handle:

Unauthorized access
Invalid workspace access
Missing required fields
Duplicate records
File upload failure
Import validation errors
Export failure
Record not found
Permission denied

Error messages should be clear and user-friendly.

37. Testing Requirements
37.1 Backend Tests

Test:

Customer CRUD
Contact CRUD
Primary contact enforcement
Notes
Attachments
Tags
Archive/restore
Permissions
Workspace isolation
Import validation
Export generation
37.2 Frontend Tests

Test:

Customer list rendering
Search
Filters
Create form
Edit form
Details page tabs
Contact management
Tag selection
File upload UI
Notes UI
Responsive layout
37.3 Security Tests

Test:

User cannot access another workspace customer
Viewer cannot create/edit/delete
User cannot archive customer
Unauthorized attachment access is blocked
Export respects permissions
38. Acceptance Criteria
38.1 Customer Management
User can create customer
User can edit customer
User can view customer details
User can archive customer
User can restore customer
38.2 Contacts
User can add multiple contacts
User can edit contacts
User can deactivate contacts
User can reactivate contacts
User can set one primary contact
System prevents multiple primary contacts
38.3 Tags
User can create tags
User can assign tags to customers
User can remove tags from customers
User can search/filter by tags
38.4 Notes
User can add customer notes
User can view customer notes
Notes are linked to correct customer
38.5 Attachments
User can upload attachment
User can preview attachment
User can download attachment
User can delete attachment
Attachment is linked to correct customer
Attachment respects workspace security
38.6 Search and Filters
Search works across customer and contact fields
Filters return correct results
Sorting works correctly
Pagination works correctly
38.7 Import and Export
CSV import works
XLSX import works
Validation errors are displayed
CSV export works
XLSX export works
38.8 Security
Workspace isolation is enforced
Role permissions are enforced
Viewer is read-only
Unauthorized access is blocked
38.9 Logs
Activity logs are generated
Audit logs are generated for sensitive actions
38.10 Responsive Design
Desktop layout works
Tablet layout works
Mobile layout works
39. Out of Scope Confirmation

Do not implement in this slice:

Invoice creation
Payment allocation
Customer statement generation
Customer portal
Email automation
AI insights
OCR
Central file repository
Advanced CRM pipeline
40. Slice Completion Definition

Slice 5 is complete when:

Customer CRUD is operational
Multiple contacts are operational
Primary contact logic is enforced
Customer tags are operational
Customer notes are operational
Customer attachments are operational
Customer import/export is operational
Search, filters, sorting, and pagination are operational
Archive and restore are operational
Workspace security is enforced
Role permissions are enforced
Activity logs are generated
Audit logs are generated
Responsive UI is completed
Backend APIs are tested
Frontend flows are tested
The slice is ready for deployment
41. Final Implementation Instruction for Claude Code

Implement Slice 5 as a complete vertical feature.

Do not only create UI screens.

Do not only create database models.

Deliver the full feature across:

Database
Prisma schema
Backend APIs
Validation
Authorization
Frontend pages
UI components
Forms
Tables
File upload handling
Import/export
Activity logging hooks
Audit logging hooks
Tests
Documentation notes