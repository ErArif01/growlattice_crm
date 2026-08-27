# GrowLattice CRM

A minimal CRM for GrowLattice to manage **leads**, **customers**, **projects**, and
**installment-based payments** — with automatic notifications 7 days and 1 day
before a payment is due.

**Stack:** React (Vite + Tailwind) frontend · Node.js + Express backend · MongoDB database

---

## 1. What this does

- **Leads** — capture leads from Offline, Instagram, Facebook, Twitter, YouTube,
  WhatsApp, or Call, with status tracking, and convert a lead into a Customer in one click.
- **Customers** — full CRUD, search by name/phone/email/company.
- **Projects** — each customer can have multiple projects (Website, Google Ads,
  Shopify Listing, etc). Requirements are picked from a dropdown that you can
  extend on the fly — add a new requirement once and it's available for every
  future project. Status: In Process / Completed / On Hold.
- **Payments** — one-time payments or installment plans (e.g. monthly, or
  split into 2–3 parts). A "Auto-split monthly" helper builds the installment
  schedule for you. Mark each installment as paid when the money comes in.
- **Notifications** — a background job checks every pending installment once a
  day and creates an in-app notification (bell icon, top-right) exactly 7 days
  and 1 day before it's due. Overdue installments are automatically flagged.
- **Auth** — a login is required to use the CRM; there's no public signup, only
  the seeded admin account (see below) can log in.

---

## 2. Prerequisites

You need **Node.js** (v18 or newer) and **MongoDB** installed locally.

### Installing Node.js
Download and install from https://nodejs.org (choose the LTS version) if you
don't already have it. Check with:
```
node --version
```

### Installing MongoDB (choose ONE option)

**Option A — MongoDB Community Server (fully local, recommended for offline dev)**
1. Download the Windows MSI installer: https://www.mongodb.com/try/download/community
2. Run the installer, choose "Complete" setup, and make sure **"Install MongoDB as a Service"** is checked (this makes it start automatically).
3. That's it — MongoDB will now be running at `mongodb://127.0.0.1:27017` in the background.
4. To confirm it's running, open Command Prompt and run: `mongosh` — if it connects, you're good.

**Option B — MongoDB Atlas (free cloud database, no local install)**
1. Create a free account at https://www.mongodb.com/cloud/atlas/register
2. Create a free (M0) cluster.
3. Under "Database Access", create a database user with a password.
4. Under "Network Access", add your current IP (or `0.0.0.0/0` for local testing).
5. Click "Connect" → "Drivers" and copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/growlattice_crm`
6. Use this as `MONGO_URI` in the backend `.env` file (step 3 below) instead of the local one.

---

## 3. Backend setup

Open a terminal in the `backend` folder:

```bash
cd backend
npm install
```

Copy the example environment file and edit it:
```bash
copy .env.example .env
```
Open `.env` in a text editor and set:
- `MONGO_URI` — leave as-is for local MongoDB, or paste your Atlas connection string
- `JWT_SECRET` — replace with any long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the login you'll use to access the CRM

Create the first admin account and default project-requirement options:
```bash
npm run seed
```
This prints the admin email/password to the console — that's what you'll log in with.

Start the backend:
```bash
npm run dev
```
You should see:
```
MongoDB connected: 127.0.0.1/growlattice_crm
GrowLattice CRM API running on http://localhost:5000
Payment reminder job scheduled (daily at 8:00 AM)
```

Leave this terminal running.

---

## 4. Frontend setup

Open a **second** terminal in the `frontend` folder:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Vite will print a local URL, typically:
```
Local:   http://localhost:5173/
```

Open that URL in your browser and log in with the admin email/password from step 3.

---

## 5. Testing the payment reminder notifications

The reminder job normally runs automatically once a day at 8:00 AM. To test it
immediately without waiting:

1. Add a customer, a payment with an installment due **exactly 7 days from
   today** (or 1 day from today).
2. While logged in, call this endpoint once (e.g. from your browser's dev
   console, or a tool like Postman) — replace `YOUR_TOKEN` with the value
   printed by logging in, visible in the browser's Application → Local
   Storage → `gl_token`:
   ```
   POST http://localhost:5000/api/dev/run-payment-check
   Authorization: Bearer YOUR_TOKEN
   ```
3. Refresh the CRM and check the bell icon (top-right) — the reminder should now appear.

---

## 6. Project structure

```
gl_crm/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   Mongoose schemas (User, Lead, Customer, Project, Payment, Notification, RequirementOption)
│   ├── controllers/              Business logic for each resource
│   ├── routes/                   Express route definitions
│   ├── middleware/authMiddleware.js   JWT login check
│   ├── jobs/paymentReminder.js   Daily cron job for due-date notifications
│   ├── seed.js                   Creates first admin login + default requirement options
│   └── server.js                 App entry point
│
└── frontend/
    └── src/
        ├── api/axios.js          Configured HTTP client (auto-attaches login token)
        ├── context/               Auth state + toast notifications
        ├── components/            Reusable UI: Modal, Layout/Sidebar, StatusBadge, ProjectModal, PaymentModal, etc.
        ├── pages/                 Login, Dashboard, Leads, Customers, CustomerDetail
        └── App.jsx                Routes
```

---

## 7. Notes for going to production later

This is set up for **local testing only**, as requested. Before deploying live:
- Set `JWT_SECRET` to a strong random value (don't reuse the local one).
- Set `MONGO_URI` to a production database (Atlas is a good option).
- Set `CLIENT_URL` in the backend `.env` to your real frontend domain (for CORS).
- Set `VITE_API_URL` in the frontend `.env` to your real backend domain.
- Consider adding an email/SMS channel for the payment reminders (currently
  in-app only via the bell icon) — the `jobs/paymentReminder.js` file is
  where you'd plug that in.
- Change the seeded admin password immediately.


















<!-- PS C:\Users\User\Desktop\growlattice-crm-new\gl_crm\backend> npm run seed

> growlattice-crm-backend@1.0.0 seed
> node seed.js

MongoDB connected: 127.0.0.1/growlattice_crm
Admin account created:
  Email:    admin@growlattice.com
  Password: ChangeThisPassword123!
Requirement dropdown ready (12 new option(s) added).
Seed complete. You can now run: npm run dev
PS C:\Users\User\Desktop\growlattice-crm-new\gl_crm\backend>  -->