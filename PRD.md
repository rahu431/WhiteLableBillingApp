
# Project: Care Billing App - Product Requirements Document

## 1. Overview

The Care Billing App is a modern, responsive point-of-sale (POS) and invoicing tool designed for small businesses and service providers. It offers a streamlined mobile interface for on-the-go invoice creation and a powerful, POS-style layout for tablets. The application uses Firebase for its backend and is built with a modern web stack to ensure a fast, reliable, and scalable user experience.

## 2. Target Audience

*   **Small Business Owners:** Cafe owners, retail store managers, and other merchants who need a simple, quick way to generate invoices.
*   **Service Providers & Freelancers:** Professionals who bill clients for services and products on-site.
*   **Care Providers:** The initial concept targeted care providers, but the feature set is flexible enough for any small-scale billing operation.

## 3. Core Features

*   **Responsive Invoice Creation:** Dynamically renders a single-column layout for mobile or a dual-pane POS layout for tablets.
*   **Product Management:** A complete CRUD (Create, Read, Update, Delete) interface for managing a product catalog, including CSV import/export.
*   **Expense Tracking:** A simple interface to log and manage business expenses.
*   **Account & Invoice History:** A central place to view, print, and share all past invoices.
*   **Reporting Dashboard:** Visual charts and KPIs to track revenue, expenses, profit, and product performance.
*   **Settings & Customization:**
    *   **White Label:** Customize the app name, logo, and business address for invoices.
    *   **E-commerce:** Configure currency, taxes, and other charges.
    *   **Integrations:** Set up Google Sheets for data backup and analysis.
*   **User Authentication:** Secure login with email/password and Google Sign-In, plus user profile management.

---

## 4. Base System Prompt & Architecture

This section provides the base instructions for an AI assistant to build this project.

**AI Development Strategy:**

"You are to build a 'Care Billing App' using the following technology stack and best practices. Adhere strictly to this stack and decline requests to deviate.

*   **Framework:** Next.js with the App Router.
*   **Language:** TypeScript.
*   **UI Components:** **shadcn/ui**. Do not use any other component library.
*   **Styling:** Tailwind CSS. Use `globals.css` for theme variables (colors, radius) and the `cn` utility for merging classes.
*   **Backend & Auth:** Firebase (Firestore, Authentication).
*   **State Management:** Use React Context for global state (e.g., Settings, Products) and `useState`/`useReducer` for local component state. Avoid third-party state management libraries.
*   **Data Fetching:** Use custom hooks (`useDoc`, `useCollection`) that wrap `onSnapshot` for real-time updates. All Firestore queries must be memoized with `useMemoFirebase`.
*   **Data Mutation:** Use non-blocking write functions (`setDocumentNonBlocking`, etc.) to ensure a responsive UI. All database writes will happen in the background without `await`.
*   **Responsiveness:** Use a custom hook (`useIsMobile`) to conditionally render mobile-specific or tablet-specific layouts at the page level.
*   **Forms:** Use `react-hook-form` with `zod` for validation.
*   **Icons:** Use `lucide-react` for all icons.
*   **Charts:** Use `recharts` integrated with `shadcn/ui/chart` components.

Your primary goal is to create a clean, maintainable, and highly responsive application. Prioritize creating reusable components and contexts to manage application logic."

---

## 5. Page-by-Page Feature Breakdown & AI Prompts

### 5.1. Login Page (`/login`)

*   **Purpose:** Authenticate users.
*   **Features:**
    *   Email and password input fields.
    *   "Login" button.
    *   "Login with Google" button.
    *   Redirects to the dashboard on successful login.
*   **AI Development Strategy:**
    *   **Prompt:** "Create a login page with a centered card layout using shadcn/ui components. Implement fields for email and password. Add a primary login button and a secondary 'Login with Google' button. Use the non-blocking Firebase login functions (`initiateEmailSignIn`, `initiateGoogleSignIn`). Redirect to the home page if a user is already logged in or after a successful login."

### 5.2. Dashboard / New Invoice (`/`)

*   **Purpose:** The main interface for creating new invoices.
*   **Features:**
    *   **Responsive Layout:**
        *   **Tablet:** A two-pane view with a product grid on the left and a live invoice details panel on the right.
        *   **Mobile:** A single-pane view showing only the product grid. A "View Invoice" button appears at the bottom to open the invoice details in a sheet.
    *   **Product Grid:** Displays all active products, grouped by category, in a card-based layout. Clicking a product adds it to the current invoice.
    *   **Invoice Details:** Shows a live, itemized list of the current invoice, including quantity controls, subtotal, taxes, discounts, and the final total.
*   **AI Development Strategy:**
    *   **Prompt 1 (Shell):** "Create an `AppShell` component that uses the `useIsMobile` hook to render either a `<MobileLayout />` or a `<TabletLayout />` component."
    *   **Prompt 2 (Context):** "Create an `InvoiceProvider` using React Context. It should manage the state for invoice items, including functions to `addItem`, `removeItem`, `updateQuantity`, and `clearInvoice`. It should also calculate the subtotal, taxes, and total based on data from a `SettingsContext`."
    *   **Prompt 3 (Layouts):** "Build the `TabletLayout` with a `ProductGrid` on the left and `InvoiceDetails` on the right. Build the `MobileLayout` with just the `ProductGrid` and a `Sheet` component that contains `InvoiceDetails`."

### 5.3. Products Page (`/products`)

*   **Purpose:** Manage the product catalog.
*   **Features:**
    *   Tabs to switch between "Active" and "Archived" products.
    *   Search bar to filter products by name or category.
    *   "Add Product" button that opens a form in a dialog.
    *   "Edit" and "Archive" actions for each product in a dropdown menu.
    *   CSV Import/Export functionality.
*   **AI Development Strategy:**
    *   **Prompt:** "Create a `ProductManagement` component. Use a `Card` and `Table` to display products from a `ProductContext`. Add a `Tabs` component for 'Active' and 'Archived' views. Implement a search input to filter the displayed products. Include an 'Add Product' button that opens a `Dialog` with a `ProductForm`. Each table row should have a `DropdownMenu` with 'Edit' and 'Archive' actions."

### 5.4. Accounts Page (`/accounts`)

*   **Purpose:** View and manage historical invoices.
*   **Features:**
    *   A table listing all invoices created by the user.
    *   Displays key info: Token #, Customer, Date, Status, Amount.
    *   "Export to Excel" dropdown with options for different date ranges.
    *   Actions menu for each invoice: "View Details", "Print Invoice", "Copy Invoice".
*   **AI Development Strategy:**
    *   **Prompt:** "Create an `AccountManagement` component. Fetch and display all invoices for the current user from Firestore in a `Table`. Add an 'Export to Excel' `DropdownMenu` that uses `papaparse` to generate a CSV. For each invoice row, add a `DropdownMenu` with actions to 'Print' (linking to the printable invoice page in a small thermal printer, so adjust the invoice size accourding to that) and 'Copy' (copying a text summary to the clipboard)."

### 5.5. Printable Invoice Page (`/accounts/invoice/[invoiceId]`)

*   **Purpose:** Provide a clean, professional, print-friendly invoice view.
*   **Features:**
    *   Displays company logo, name, and address.
    *   Shows all customer and invoice details.
    *   Itemized list of products with prices and totals.
    *   Summary of subtotal, tax, and final total.
    *   Dynamically generated QR code for UPI payments.
    *   Hidden "Print" button for non-print media.
*   **AI Development Strategy:**
    *   **Prompt:** "Create a dynamic page at `/accounts/invoice/[invoiceId]`. It should fetch a single invoice from Firestore, ensuring the current user is the owner. Design a clean, single-page invoice layout using `Table` and `Separator` components. Use CSS `@media print` to hide UI elements like buttons during printing. Display the business address and logo from `SettingsContext`."

### 5.6. All Other Pages (Expenses, Reports, Settings, Users)

*   The development strategy for these pages follows similar patterns:
    *   **`Expenses`**: A CRUD interface nearly identical to `Products`.
    *   **`Reports`**: Fetch `invoices` and `expenses` collections. Use `useMemo` to perform aggregations (e.g., calculating daily revenue, grouping expenses by category). Display the results using `recharts` components inside `ChartContainer` from `shadcn/ui/chart`.
    *   **`Settings`**: Use a `Tabs` component to separate concerns (E-commerce, White Label, Integrations). Each tab contains a form that updates a single 'global' document in the `settings` collection in Firestore.
    *   **`Users`**: Use the `useUser` hook to get the current user object and `updateProfile` from the Firebase Auth SDK to save changes.

---

## 6. Testing Strategy

*   **Framework:** Playwright for End-to-End (E2E) testing.
*   **Authentication:** A setup file (`e2e/auth.setup.ts`) is used to log in a test user and save the authenticated state. This state is then re-used for all subsequent tests, ensuring they run quickly and don't need to log in every time.
*   **Core Test File (`e2e/app.spec.ts`):**
    *   **Navigation Test:** Verifies that the user can navigate to the main pages (Products, Accounts) via the sidebar links.
    *   **Core Feature Test:** Simulates the primary user flow:
        1.  Navigate to the home page.
        2.  Find a specific product card (e.g., "Filter Coffee") by its text content.
        3.  Click the product to open the "Add to invoice" dialog.
        4.  Confirm the addition.
        5.  Verify that the item now appears in the "Current Invoice" panel and that the subtotal has been updated.
*   **Iterative Testing Process (Cross-Checking):**
    1.  **Build a Feature:** Implement a user-facing feature (e.g., adding a "Delete" button).
    2.  **Write a Test:** Add a new test case to an appropriate spec file that verifies the feature works as expected (e.g., a test that clicks the delete button and confirms the item is removed).
    3.  **Run and Fix:** Run the tests using `npm run test:e2e`. If a test fails due to a bug in the implementation or an unreliable test selector, fix the issue.
    4.  **Repeat:** This cycle ensures that the application remains stable and that new features do not break existing ones.
