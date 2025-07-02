# RG Student - hub: Email Auth Setup (Supabase + Resend)

## How to Set Up

### 1. Frontend Helper Files

- Your new helper files are here:
  - `src/lib/sendMagicLink.js` — Magic Link Login
  - `src/lib/changeEmail.js` — Change Email Address
  - `src/lib/resetPassword.js` — Reset Password

#### How to use:
- In your UI code, you (or your developer) can import and use these helpers like this:
  ```js
  import { sendMagicLink } from "@/lib/sendMagicLink";
  import { changeEmail } from "@/lib/changeEmail";
  import { resetPassword } from "@/lib/resetPassword";
  ```

### 2. What the helpers do

- **sendMagicLink(email):**  
  Sends a magic login link to the user's email.

- **changeEmail(newEmail):**  
  Lets a logged-in user request a change to their email address.

- **resetPassword(email):**  
  Sends a password reset link to the user's email.

### 3. All keys/domains are already personalized for RG Student - hub

- Supabase URL: `https://hsmavqldffsxetwyyhgj.supabase.co`
- Public Anon Key:  
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWF2cWxkZmZzeGV0d3l5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAyNDYsImV4cCI6MjA2NjMxNjI0Nn0.-IgvTTnQcoYd2Q1jIH9Nt3zTcrnUtMAxPe0UAFZguAE`

### 4. Where to find these files

- All files are in `src/lib/` for easy access in your frontend/app.

### 5. How to get help

If you want to add UI buttons or forms that use these helpers, just ask Copilot in plain English!

---

**You don’t need to set up or configure anything else. Just use the helpers in your UI and you’re good to go!**
