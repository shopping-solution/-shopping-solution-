# Real-Time Order Notification System Setup Guide

This guide provides step-by-step instructions for configuring Firebase Cloud Messaging (FCM), generating VAPID Web Push certificates, integrating Android push configurations, and deploying your production system.

---

## 1. Firebase Console Configuration

To enable background push notifications and direct delivery to Web browsers and Android devices, you need to link your application to a Firebase Project.

### Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project**, enter a descriptive name (e.g., `shopping-solution-notifications`), and click **Continue**.
3. Toggle Google Analytics (optional, recommended for production tracking) and click **Create Project**.

### Step 2: Generate Admin Service Account Credentials
This credential allows your Node.js backend (`server.ts`) to securely publish push messages to the Google FCM gateway.
1. In the Firebase Console, click the **Settings Gear** icon in the top left, then select **Project Settings**.
2. Navigate to the **Service accounts** tab.
3. Select **Node.js** configuration, then click **Generate new private key**.
4. Save the downloaded `.json` file.
5. Choose **one** of the two deployment configuration methods below:
   - **File Method (Local/VPS)**: Rename the file to `service-account.json` and place it directly in the root directory of your project.
   - **Environment Variable Method (Cloud Run/Vercel/Heroku)**: Minify the contents of the `.json` file into a single string, and assign it to the environment variable named `FIREBASE_SERVICE_ACCOUNT`.

---

## 2. Generate FCM Web Push VAPID Certificates

VAPID (Voluntary Application Server Identification) is required to authenticate your backend server to push notifications securely to web browsers (Chrome, Safari, Firefox).

### Step 1: Generate VAPID Key Pair
1. Inside the Firebase Console, go to **Project Settings** -> **Cloud Messaging** tab.
2. Scroll down to the **Web configuration** section.
3. Under **Web Push certificates**, click **Generate key pair**.
4. Copy the newly generated **VAPID Public Key** (a long alphanumeric string).

### Step 2: Register Key in Admin Dashboard
1. Log in to your Admin Dashboard.
2. Select the **Notifications** tab.
3. Paste your copied key into the **Web Push VAPID Key** input field and click **Enable Push Notifications**.
4. Accept the browser permission popup. This automatically registers your current device token to the database!

---

## 3. Android Client Integration (For Mobile Push)

To receive real-time push notifications on an Android phone even if the web app is closed:

### Step 1: Register Android App in Firebase
1. Inside **Project Settings** -> **General** tab, scroll to **Your apps** and click **Add App** (select **Android** icon).
2. Enter your Android package name (e.g., `com.shoppingsolution.admin`).
3. Download the `google-services.json` file.
4. Place `google-services.json` into the `app/` directory of your Android Studio project.

### Step 2: Android Manifest Configuration
Ensure your Android app includes the standard Firebase Cloud Messaging dependencies and declares a service worker equivalent receiver to catch high-priority FCM payloads.

---

## 4. Production Environment Variables

Ensure the following environment variables are declared on your server platform:

```env
# Stringified JSON of your service-account.json (Optional if using local service-account.json)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"..."}'

# Your database connection (Already configured on Cloud SQL)
DATABASE_URL=postgresql://...

# Dev / Production Flag
NODE_ENV=production
```

---

## 5. Deployment Verification Checklist

- [✓] Build compiles perfectly: `npm run build` runs and creates static files inside `dist/` and compiles the backend into `dist/server.cjs`.
- [✓] Live server serves on port `3000` and accepts EventSource connections at `/api/notifications/stream`.
- [✓] The service worker is hosted at the domain root (`/firebase-messaging-sw.js`), ensuring correct registration scope.
- [✓] Device tokens are successfully saved to the `push_tokens` table in PostgreSQL.
