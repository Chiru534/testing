# SkillWallet Automation Testing

This repository contains Playwright-based automated end-to-end tests for the SkillWallet platform. These tests cover various user roles, primarily focusing on Program Creation (Operations Associate) and Student Enrollment workflows.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository (or navigate to the project folder).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## 🧪 Test Suite Overview

### 1. Student VIP Workflow (`tests/student-vip-all-fields.spec.ts`)
This is a comprehensive test designed to verify the entire student lifecycle for a Virtual Internship Program (VIP).

- **Authentication**: Logs in with student credentials.
- **Course Discovery**: Searches and enrolls in the "Full Stack Development" program.
- **Field Verification**: Systematically clicks and verifies content for **6 main headings**:
  - `Instructions`
  - `Learning Journey`
  - `Courses`
  - `Project`
  - `Capstone Project`
  - `Certificate`
- **Functional Testing**: Interacts with the Learning Journey (Live Sessions), Course completion, and Capstone Project workspaces (Kanban).

### 2. Standard Student Flow (`tests/Student.spec.ts`)
A streamlined version of the enrollment flow, focusing on stability and quick verification of the enrollment button and basic navigation.

### 3. Operations Associate Workflow (`tests/oa-20-step-workflow.spec.ts`)
An exhaustive 20-step automation for program managers. It covers:
- Program Identity & Metadata.
- Background & Logo uploads.
- Curriculum, Benefits, and FAQ creation.
- Cohort Management & Slack Integration.
- Sending for Approval.

## 🛠️ Execution Commands

To run tests in **Single Worker & Single Tab** mode (Recommended for observation):

**Run VIP Student Test:**
```bash
npx playwright test tests/student-vip-all-fields.spec.ts --project=chromium --headed --workers=1
```

**Run Basic Student Test:**
```bash
npx playwright test tests/Student.spec.ts --project=chromium --headed --workers=1
```

**Run All Tests:**
```bash
npx playwright test
```

## 📊 Reporting

After running the tests, you can view the detailed HTML report:
```bash
npx playwright show-report
```

The report includes:
- Step-by-step execution logs.
- Screenshots on failure.
- Video recordings (if enabled in `playwright.config.ts`).
- Console outputs for "Field Verification" results.
