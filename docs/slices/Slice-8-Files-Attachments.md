# Slice 8 — Files & Attachments

| Property | Value |
|----------|--------|
| Slice ID | 8 |
| Slice Name | Files & Attachments |
| Priority | High |
| Type | Core Platform Foundation |
| Status | Planned |
| Dependencies | Slice 1, Slice 2, Slice 3, Slice 5, Slice 6.1, Slice 6.2, Slice 7.1 |
| Estimated Complexity | Medium |
| Recommended Delivery | Single Slice |

---

# 1. Overview

## 1.1 Purpose

The Files & Attachments slice establishes the centralized document management foundation for Tetri Copilot.

Rather than implementing separate file storage mechanisms across individual modules, this slice provides a reusable attachment framework that can be consumed by all current and future business modules.

The solution will provide secure upload, storage, retrieval, preview, download, attachment management, and audit capabilities while maintaining strict workspace isolation and enterprise-grade security.

This slice intentionally excludes OCR, AI document understanding, and intelligent extraction capabilities, which will be delivered through future AI-focused slices.

---

## 1.2 Business Objectives

### Objective 1 — Centralized Document Repository

Provide a unified location for storing and managing business documents across the workspace.

### Objective 2 — Supporting Documentation

Allow users to attach supporting evidence to operational records such as:

- Customers
- Invoices
- Payments
- Expenses

### Objective 3 — Audit Readiness

Maintain historical document references and activity logs for compliance and auditing purposes.

### Objective 4 — Future AI Enablement

Create a storage architecture capable of supporting future:

- OCR processing
- AI categorization
- AI extraction
- AI compliance analysis
- AI document search

without requiring architectural redesign.

### Objective 5 — Multi-Tenant Security

Ensure complete separation between workspace documents and prevent cross-tenant access.

---

# 2. Scope

## 2.1 Included Features

### File Upload Management

- Single file upload
- Multiple file upload
- Drag-and-drop upload
- File picker upload
- Upload validation
- Upload progress indicators

### File Repository

- Central file repository
- File listing
- File search
- File filtering
- File preview
- File download

### Attachment Framework

- Attach files to business records
- Remove attachment associations
- Multiple attachments per record
- Shared document references

### File Administration

- Rename files
- Delete files
- Restore deleted files
- View file details

### Security Controls

- Permission validation
- Signed URLs
- Workspace isolation
- Audit logging

### Storage Integration

- Cloudflare R2 storage integration
- Metadata management
- Secure retrieval mechanisms

---

## 2.2 Excluded Features

The following capabilities are intentionally excluded from this slice:

### OCR Processing

- Receipt scanning
- Invoice OCR
- Text extraction

### AI Features

- AI categorization
- AI tagging
- AI document summaries
- AI document search

### Advanced Document Processing

- Version control
- Document approval workflows
- Digital signatures
- Compliance automation

---

# 3. User Roles & Permissions

## 3.1 Workspace Owner

Permissions:

- Upload files
- Preview files
- Download files
- Rename files
- Delete files
- Restore files
- Link files
- Unlink files
- View activity logs

---

## 3.2 Workspace Admin

Permissions:

- Upload files
- Preview files
- Download files
- Rename files
- Delete files
- Restore files
- Link files
- Unlink files

---

## 3.3 Standard User

Permissions:

- Upload files
- Preview authorized files
- Download authorized files
- Link files to records they can access

Restrictions:

- Cannot restore deleted files
- Cannot delete protected files

---

## 3.4 Viewer

Permissions:

- View authorized files
- Preview authorized files
- Download authorized files

Restrictions:

- No upload rights
- No modification rights
- No deletion rights

---

# 4. Functional Requirements

---

# FR-8.1 File Upload

## Description

Users shall be able to upload files into the platform.

## Supported Upload Methods

### Method 1

File picker selection.

### Method 2

Drag-and-drop upload.

### Method 3

Multi-file selection.

## Validation Rules

System shall validate:

- User permissions
- Workspace ownership
- File type
- File size
- Malware validation hook

before accepting upload.

## Success Behaviour

Upon successful upload:

1. File stored in Cloudflare R2
2. Metadata record created
3. Audit log created
4. Upload confirmation displayed

---

# FR-8.2 Multiple File Upload

Users shall be able to upload multiple files simultaneously.

## Requirements

- Independent upload processing
- Individual progress indicators
- Individual success/failure reporting
- Partial success support

## Example

Expense reimbursement package:

- Receipt #1
- Receipt #2
- Hotel invoice
- Airline ticket

uploaded together.

---

# FR-8.3 File Type Validation

## Supported Document Types

### Documents

- PDF
- DOC
- DOCX
- XLS
- XLSX
- CSV
- TXT

### Images

- JPG
- JPEG
- PNG
- WEBP

### Archives

- ZIP

(optional by configuration)

---

## Blocked Types

The following shall be rejected:

- EXE
- MSI
- CMD
- BAT
- SH
- JS Executables
- PowerShell scripts

---

# FR-8.4 File Size Validation

## Default Limits

| Category | Maximum Size |
|-----------|------------|
| Image | 10 MB |
| Document | 25 MB |
| Archive | 50 MB |

## Configuration

System administrators may modify limits through configuration settings.

---

# FR-8.5 Upload Progress Tracking

System shall display:

- Queued
- Uploading
- Completed
- Failed

status for every uploaded file.

## Progress Indicators

Display:

- Percentage completed
- Upload speed (optional)
- Estimated remaining time (optional)

---

# FR-8.6 File Preview

Users shall preview supported file types without downloading.

## Supported Preview Types

### Images

- JPG
- PNG
- WEBP

### Documents

- PDF

## Preview Features

- Zoom
- Fit to screen
- Rotate images
- Full-screen mode

---

# FR-8.7 File Download

Authorized users shall be able to download files.

## Security Validation

Before download:

- Authentication check
- Authorization check
- Workspace ownership validation

## Audit Requirement

Every download event shall be logged.

---

# FR-8.8 File Rename

Users with permission shall be able to rename display filenames.

## Requirements

System shall preserve:

- Original filename
- Upload metadata
- Storage key

Only display name changes.

---

# FR-8.9 File Deletion

Authorized users shall be able to delete files.

## Deletion Method

Soft delete only.

## Metadata Captured

- Deleted by
- Deleted date
- Delete reason (optional)

---

# FR-8.10 File Restoration

Workspace Owner and Workspace Admin may restore deleted files.

## Retention Period

Default:

30 days

Configurable via settings.

---

# FR-8.11 Attachment Linking

Files shall be linked to business entities.

## Supported Entities

### Current Scope

- Customer
- Invoice
- Payment
- Expense

### Future Scope

- Vendor
- Employee
- Tax Filing
- Compliance Record
- Bank Transaction

---

# FR-8.12 Attachment Unlinking

Users shall be able to remove attachment relationships without deleting the underlying document.

## Example

Invoice removed from document.

Document remains stored in repository.

---

# FR-8.13 File Metadata Management

The system shall maintain metadata for every file.

## Required Metadata

- File ID
- Workspace ID
- Filename
- Original filename
- Extension
- MIME type
- File size
- Storage key
- Uploaded by
- Upload timestamp
- Last modified timestamp

---

# FR-8.14 File Search

Users shall search files using:

- Filename
- Original filename
- Uploader
- Upload date
- Linked entity
- Linked module

---

# FR-8.15 File Filtering

Users shall filter repository records by:

- File type
- Upload date
- Uploaded by
- Module
- Deleted status

---

# FR-8.16 Recent Files Widget

System shall provide a dashboard widget displaying:

### Recent Uploads

Most recently uploaded files.

### Recent Access

Most recently viewed/downloaded files.

---

# FR-8.17 Secure File Access

Direct access to storage locations shall never be exposed.

## Security Mechanism

Use:

- Signed URLs
- Temporary tokens
- Expiring access links

for retrieval.

---

# FR-8.18 Workspace Isolation

The system shall enforce strict tenant isolation.

## Validation Required For

- Upload
- Preview
- Download
- Rename
- Delete
- Restore

Users shall never access files belonging to another workspace.

---

# FR-8.19 Malware Scanning Integration Point

Architecture shall support future malware scanning.

## Potential Integrations

- ClamAV
- Cloudflare Security
- Third-party scanning engines

## Initial Version

Placeholder architecture only.

No active scanning required.

---

# FR-8.20 File Activity Tracking

The system shall track file-related activities.

## Tracked Events

- Upload
- Preview
- Download
- Rename
- Delete
- Restore
- Link
- Unlink

---

# 5. User Interface Requirements

## Screen 8.1 — File Repository

### Purpose

Central document management screen.

### Grid Columns

- File Name
- Type
- Size
- Module
- Linked Record
- Uploaded By
- Upload Date
- Actions

### Available Actions

- View
- Download
- Rename
- Delete

---

## Screen 8.2 — Upload Dialog

### Components

- Drag-and-drop area
- Browse button
- Upload queue
- Validation messages
- Progress indicators

---

## Screen 8.3 — File Preview Screen

### Features

- PDF Viewer
- Image Viewer
- Zoom controls
- Full-screen mode
- Download action

---

## Screen 8.4 — Attachments Panel

Embedded within:

- Customer Details
- Invoice Details
- Payment Details
- Expense Details

### Components

- Attachment list
- Upload button
- Preview action
- Remove attachment action

---

# 6. Storage Architecture

## Storage Provider

Cloudflare R2

---

## Storage Principles

### Database Stores Metadata

PostgreSQL stores:

- Metadata
- References
- Relationships
- Activity logs

### Cloud Storage Stores Files

Cloudflare R2 stores:

- Binary files
- Images
- PDFs
- Attachments

---

## Benefits

- Low cost
- High scalability
- No egress fees
- S3-compatible architecture
- Future AI readiness

---

# 7. Database Design

## Table: files

```sql
id UUID PRIMARY KEY
workspace_id UUID NOT NULL

storage_key VARCHAR(500) NOT NULL

file_name VARCHAR(255) NOT NULL
original_name VARCHAR(255) NOT NULL

mime_type VARCHAR(100)
extension VARCHAR(20)

file_size BIGINT

uploaded_by UUID
uploaded_at TIMESTAMP

updated_at TIMESTAMP

is_deleted BOOLEAN DEFAULT FALSE
deleted_at TIMESTAMP
```

---

## Table: file_links

```sql
id UUID PRIMARY KEY

workspace_id UUID NOT NULL

file_id UUID NOT NULL

entity_type VARCHAR(50)
entity_id UUID

created_by UUID
created_at TIMESTAMP
```

---

## Table: file_activity_logs

```sql
id UUID PRIMARY KEY

workspace_id UUID NOT NULL

file_id UUID NOT NULL

activity_type VARCHAR(50)

performed_by UUID

performed_at TIMESTAMP

metadata JSONB
```

---

# 8. API Endpoints

## Upload File

```http
POST /api/files/upload
```

---

## Download File

```http
GET /api/files/{id}/download
```

---

## Preview File

```http
GET /api/files/{id}/preview
```

---

## Rename File

```http
PUT /api/files/{id}
```

---

## Delete File

```http
DELETE /api/files/{id}
```

---

## Restore File

```http
POST /api/files/{id}/restore
```

---

## Link File

```http
POST /api/files/link
```

---

## Unlink File

```http
DELETE /api/files/link/{id}
```

---

## Search Files

```http
GET /api/files
```

---

# 9. Audit Requirements

Every file operation shall generate an audit record.

## Auditable Events

- Upload
- Preview
- Download
- Rename
- Delete
- Restore
- Link
- Unlink

## Audit Data

- User
- Workspace
- Timestamp
- Action
- Target file
- Related entity

---

# 10. Security Requirements

## Authentication

Only authenticated users may access files.

---

## Authorization

Role-based permission validation is mandatory.

---

## Workspace Isolation

Cross-workspace access must be impossible.

---

## Secure Retrieval

All downloads shall use signed URLs.

---

## Validation Controls

Validate:

- MIME type
- Extension
- File size
- Ownership

before processing.

---

# 11. Performance Requirements

| Metric | Target |
|----------|---------|
| Upload Initialization | < 3 seconds |
| Preview Loading | < 2 seconds |
| Repository Search | < 1 second |
| Download Start | < 2 seconds |
| Concurrent Uploads | 100+ |

---

# 12. Error Handling

The system shall gracefully handle:

- Unsupported file type
- File too large
- Upload interruption
- Storage failure
- Unauthorized access
- Deleted file access
- Missing attachment reference

All errors shall return user-friendly messages.

---

# 13. Acceptance Criteria

## Upload

- Single upload succeeds
- Multi-upload succeeds
- Validation rules enforced

## Preview

- Images preview correctly
- PDFs preview correctly

## Security

- Unauthorized access blocked
- Cross-workspace access blocked

## Management

- Rename works
- Delete works
- Restore works

## Attachments

- Linking works
- Unlinking works

## Audit

- Activities logged correctly

## Storage

- Files stored in Cloudflare R2
- Metadata stored in PostgreSQL

---

# 14. Future Enhancements (Out of Scope)

## AI Document Intelligence

- OCR extraction
- Receipt processing
- Invoice reading
- AI summaries

## Intelligent Search

- Search inside document contents
- Semantic document search

## Version Control

- File revisions
- Version history

## Approval Workflows

- Document approval routing
- Review processes

## Compliance Automation

- Automated validation
- Regulatory checks

## Digital Signatures

- Electronic signing
- Signature verification

---

# 15. Definition of Done

Slice 8 shall be considered complete when:

- Cloudflare R2 integration is operational
- File upload is fully functional
- File preview is available
- File download is available
- Attachment linking is operational
- Attachment unlinking is operational
- Repository search works
- Repository filtering works
- Signed URL security is implemented
- Workspace isolation is enforced
- Audit logging is active
- Soft delete and restore are operational
- API endpoints are completed
- Automated tests pass
- User documentation is completed
- Deployment verification is completed