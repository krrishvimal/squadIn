# SquadIn UI redesign

Run `npm run dev` and visit `http://127.0.0.1:5173/?preview=design` to review the mockup-inspired screens with sample plans and members. The normal `/` route uses the existing app data.

The preview uses its own browser-storage namespace. Supabase reads, writes, and subscriptions are disabled in this mode. Sample verification badges are illustrative.

Implemented: onboarding, activity ticket feed, plan details, one-tap requests and optional host notes, create plan, host dashboard, quorum waiting room, crew chat, radar, candidate profile, mutual waves, profile, passions, and verification styling.

Responsive layout: the application occupies the main page without a simulated phone frame or decorative side panels. Phones use a single-column feed and bottom navigation. Tablets use two feed columns. Laptops use header navigation and two or three feed columns, with wider crew chats and forms. Radar places nearby members beside the map; profile places identity and stats beside trust, badges, and passions on wider screens.

Validation: production build and whitespace check passed; browser checks covered join requests, notes, hosting, applicant acceptance, quorum unlock, messaging, mutual waves, profile edits, city switching, and empty states. Layouts were inspected at 360px, 390px, and 1280px. A fresh preview session reported no runtime errors.

The responsive correction was additionally checked at 360px, 390px, 768px, 1024px, and 1366px. Phone and laptop navigation, feed columns, radar and profile layouts, crew listings, plan forms, and chat sizing were inspected. The inspected screens have no horizontal document overflow; the chat composer stays above phone navigation and inside the laptop viewport.

The existing phone/email verification implementations remain demos. This UI work does not add an SMS provider or change backend identity enforcement. Supabase integration code is retained; live production writes were not used for verification. Database schema has not been changed. Production deployment uses the GitHub-connected Vercel project `squad-in`.

`desktop.jpg` and `mobile.jpg` show the finished discovery screen.
