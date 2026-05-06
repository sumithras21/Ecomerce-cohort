# Phase 1 Submission Report (Blueprint / PRD)

**Project Title:** Ecommerce Analytics Platform with AI Insights  
**Program:** Internship Project Phase Guide  
**Phase:** Phase 01 - Blueprint  
**Prepared By:** `<<Your Name / Team Name>>`  
**Date:** `<<Submission Date>>`  
**Trainer:** `<<Trainer Name>>`  

---

## 1. Executive Summary

This document defines the Phase 1 blueprint for building an Ecommerce Analytics Platform that will transform transactional sales data into actionable business insights.  

The product will include:

- An analytics API backend
- A modern web dashboard frontend
- Core modules for KPI, customer, geographic, forecasting, basket, and cohort analysis
- An optional AI chat assistant for natural-language data exploration

This phase will focus on problem clarity, solution design, tool readiness, measurable success criteria, and day-wise planning for Phase 2 (Build) and Phase 3 (Present).

---

## 2. Problem Statement

Ecommerce teams currently spend too much time manually collecting metrics from raw data and disconnected tools, which delays decision-making and reduces insight quality.

### Who is affected

- Business managers tracking revenue and order trends
- Marketing teams analyzing customer behavior and retention
- Product/operations teams planning inventory and growth

### Current pain points

- No unified dashboard for all critical insights
- Slow and repetitive manual analysis workflows
- Limited forecasting support for proactive planning
- Weak explainability for non-technical stakeholders

---

## 3. Proposed Solution (Conceptual)

We will build a full-stack analytics product that will:

1. Ingest and clean ecommerce transaction data.
2. Expose analytics through a FastAPI service layer.
3. Present insights in a React dashboard with reusable UI components.
4. Add optional AI-powered Q&A over the dataset for faster exploration.

The system will emphasize clarity, reliability, and submission-ready presentation.

---

## 4. Scope Definition

### In Scope (Phase 2 + Phase 3 execution target)

- Data preprocessing and validation pipeline
- API endpoints for all analytics modules
- Dashboard pages for each module
- Reusable frontend component library
- Testing, documentation, and presentation artifacts

### Out of Scope (for current internship timeline)

- Multi-tenant user authentication and RBAC
- Real-time streaming ingestion from external commerce systems
- Production cloud autoscaling architecture

---

## 5. Functional Requirements (PRD)

### FR-1: Executive Summary
The product will provide total revenue, total orders, unique customers, average order value, monthly sales trend, and top products.

### FR-2: Customer Insights
The product will generate RFM-based segmentation and segment-level statistics.

### FR-3: Geographic Analysis
The product will display country-level revenue and top-country business metrics.

### FR-4: Sales Forecasting
The product will generate future revenue forecasts for configurable periods and allow forecast export.

### FR-5: Market Basket Analysis
The product will identify top products, frequent product pairs, and basket summary metrics.

### FR-6: Cohort Retention
The product will compute cohort retention matrix and period retention trends.

### FR-7: AI Chat (Controlled)
The product will answer data questions via AI assistant under explicit security gating.

### FR-8: Date Filtering
All major analytics endpoints and UI views will support optional date-range filtering.

---

## 6. Non-Functional Requirements

- **Performance:** Typical analytics API responses should return in under 1 second for local dataset scale.
- **Reliability:** The application should fail gracefully with clear error messages.
- **Security:** Sensitive chat execution mode will be disabled by default.
- **Usability:** Dashboard navigation and module pages will be intuitive for non-technical users.
- **Maintainability:** Codebase will use modular architecture and reusable components.
- **Traceability:** API requests will include request IDs for debugging.

---

## 7. Technology Stack Confirmation

### Backend
- Python
- FastAPI
- Pandas / NumPy
- Statsmodels
- Scikit-learn / MLxtend (where applicable)

### Frontend
- React (Vite)
- React Router
- React Query
- Recharts / visualization libraries

### Tooling
- Git + GitHub
- VS Code / Cursor
- Pytest
- ESLint

### Optional/Conditional
- Groq + LangChain for AI chat assistant (secured by env flags)

---

## 8. Data and Integration Plan

### Dataset
- Ecommerce transaction CSV source
- Required schema validation before processing

### Cleaning and feature engineering
- Remove canceled/invalid transactions
- Normalize date fields
- Generate derived metrics such as revenue and period keys

### Integration points
- Backend APIs consumed by frontend via HTTP
- Optional AI chat route will use in-memory dataframe context

---

## 9. Success Criteria (Measurable)

We will consider this project successful if:

1. **Coverage:** All 7 planned modules are implemented and demo-ready.
2. **Functionality:** At least 90% of core API routes pass test scenarios.
3. **Presentation:** Final output includes working demo + documentation + portfolio-ready artifacts.

---

## 10. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Dataset quality issues | Incorrect analytics | Add strict schema checks and validation |
| Time constraints | Incomplete features | Prioritize core modules first, polish later |
| Forecast instability | Weak predictive output | Use controlled fallback and communicate limits |
| AI chat security concerns | Unsafe execution risk | Keep disabled by default; enable only in trusted local mode |

---

## 11. Day-wise Plan for Phase 2 (Build)

| Day | Planned Output |
|---|---|
| Day 1 | Backend and frontend foundations running locally |
| Day 2 | Core analytics endpoints + initial UI integration |
| Day 3 (Mid-check) | Stabilize implemented modules, bug fixes, trainer review |
| Day 4 | Module completion + testing + documentation updates |
| Day 5 | Working end-to-end build with repo push and README |

---

## 12. Day-wise Plan for Phase 3 (Present)

| Day | Planned Output |
|---|---|
| Day 1 | Product polish and cleanup |
| Day 2 | Build 10-minute presentation deck |
| Day 3 | Peer review and feedback capture |
| Day 4 | Refinement and final freeze |
| Day 5 | Final presentation and portfolio submission |

---

## 13. Final Deliverables Plan

- GitHub repository with meaningful commit history
- Clean README and setup instructions
- Working dashboard + backend integration
- Final presentation deck (10-minute structure)
- Supporting report/documentation for evaluation
- Resume-ready project bullets and LinkedIn update

---

## 14. Approval Request (Phase Gate)

This blueprint is submitted for trainer review and approval.  
Upon approval, the team will begin Phase 2 (Build) execution.

**Approval Status:** `<<Pending / Approved>>`  
**Trainer Signature/Comment:** `<<To be filled by trainer>>`

