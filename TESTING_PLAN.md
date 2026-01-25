# 🧪 Silent Money: Complete Testing Plan & Checklist

This document provides a comprehensive guide to verifying that the Silent Money platform is fully functional, secure, and user-friendly.

---

## 1. 🔐 Authentication & User Management
*Goal: Ensure users can safely join and access their private data.*

- [ ] **Registration**: Create a new account. Verify that a profile is automatically created in the `profiles` table.
- [ ] **Login**: Log in with correct credentials.
- [ ] **Invalid Login**: Try logging in with a wrong password or non-existent email. Verify error messages appear.
- [ ] **Forgot Password**: Request a reset email. (Note: Requires Supabase SMTP setup to test fully).
- [ ] **Sign Out**: Ensure clicking Sign Out clears the session and redirects to the landing page.
- [ ] **Protected Routes**: Try to visit `/dashboard` or `/add-idea` while logged out. Verify you are redirected to `/login`.

---

## 2. 🏛️ Core Platform (Discovery)
*Goal: Verify that the search and filter engine works smoothly.*

- [ ] **Data Loading**: Ensure ideas appear on the `/ideas` page.
- [ ] **Search**: Type a partial name (e.g., "div"). Verify only matching ideas remain.
- [ ] **Category Filter**: Click a category (e.g., "Investments"). Verify only ideas in that category show up.
- [ ] **Income Slider**: Move the slider to ₹50k. Verify low-paying ideas are hidden.
- [ ] **Sorting**: Toggle between "Newest First" and "Most Popular". Verify order changes.
- [ ] **Reset**: Ensure "Reset all filters" returns the view to the default state.

---

## 3. 📄 Idea Detail & Interaction
*Goal: Test deep interactions on the strategy pages.*

- [ ] **Navigation**: Click "View Guide" on a card. Verify it opens the correct idea based on the slug.
- [ ] **Upvoting**: Update an idea. Verify the heart icon fills and the counter increases by 1 instantly.
- [ ] **Downvoting (Remove Vote)**: Click the heart again. Verify the counter decreases.
- [ ] **Saving**: Click "Save Idea". Verify the "✓ Saved" button appears and the "Your Progress" section opens in the sidebar.
- [ ] **ROI Calculator**: Input custom numbers into the calculator. Verify that "Net Profit" and "Break-Even" update correctly.

---

## 4. 📊 Personal Dashboard
*Goal: Verify user-specific data tracking.*

- [ ] **Stats Sync**: Ensure "Saved Ideas" and "Potential Income" counts match your actual saved items.
- [ ] **Progress Updates**: Change an idea's status to "Started" and add a note. Click "Save Changes".
- [ ] **Persistence**: Refresh the page. Verify the status and notes you added are still there.
- [ ] **Profile Edit**: Go to "Edit Profile". Update your Bio and Avatar URL. Verify changes show up on the dashboard header.

---

## 5. ✍️ Contribution Workflow
*Goal: Test the Add, Edit, and Delete lifecycle.*

- [ ] **Posting**: Use the "+ Add New Idea" button. Fill out all required fields and publish.
- [ ] **Verification**: Find your new idea on the public `/ideas` page.
- [ ] **My Posts**: Visit "My Posted Ideas". Verify your new idea is listed.
- [ ] **Editing**: Click the Pen icon. Change the title or income range. Save and verify the update on the public page.
- [ ] **Unauthorized Edit**: Try to visit `/edit-idea/[another-users-id]` manually in the URL. Verify the app prevents access or shows an error.
- [ ] **Deleting**: Click the Trash icon. Confirm the popup. Verify the idea is gone from both your list and the public directory.

---

## 6. 📱 Responsive & UX Testing
*Goal: Ensure the app looks premium on all devices.*

- [ ] **Mobile Menu**: Shrink the browser or use a phone. Ensure the hamburger menu works and includes all links.
- [ ] **Mobile Cards**: Ensure idea cards stack vertically on small screens.
- [ ] **Typography**: Check that large headlines don't overflow on small screens.
- [ ] **Empty States**: If you have no saved ideas, verify the dashboard shows a friendly "Explore Ideas" prompt.

---

## 7. 🛡️ Security & Performance
*Goal: Verify backend integrity.*

- [ ] **Database RLS**: Verify that you cannot delete or edit an idea created by "Admin" or another user through the console.
- [ ] **Router Fallback**: Refresh your browser while on `/ideas/dividend-stock-investing`. If you see a Vercel 404, the `vercel.json` is missing. If the page loads, it's correct.
- [ ] **Image Fallback**: If an avatar URL is broken, ensure the app shows the default "👤" emoji instead of a broken image icon.

---

## 📅 Testing Log Template

| Date | Feature | Tester | Result (Pass/Fail) | Notes |
|------|---------|--------|---------------------|-------|
|      |         |        |                     |       |
|      |         |        |                     |       |
