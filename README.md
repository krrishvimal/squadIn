# SquadIn / WashedUp India ☕🏸

> **Technical master specification, database architecture, and native UI blueprints for a hyper-local IRL meetup platform connecting verified strangers for spontaneous group activities.**

[![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2052-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4%20(Tailwind)-38B2AC?style=for-the-badge&logo=tailwind-css)](https://nativewind.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 The Problem

People in metro cities want to do things — grab coffee, play badminton, go to a concert, or head out for a weekend trek — but don't always have a free friend circle available.
- **Meetup.com** feels too corporate and structured.
- **Instagram Stories** only reach people you already know.
- **Dating apps** carry awkward romantic pressure.

There is no lightweight way to broadcast: *"I want to go to this cafe at 7 PM tonight, who's in?"* to verified people within a 2 km radius.

---

## 📱 5-Screen Zero-Confusion Architecture

1. **Explore Feed (Home):** Filter pills (*Cafes, Sports, Concerts, Treks, Women-Only*), verified host badges, distance indicator, and live slot counter (`[■■■□] 3/4 spots filled`).
2. **Plan Details Modal:** Verified public venue map snapshot, attendee bubbles with trust verification badges, and 1-tap spot request.
3. **Post a Plan (3-Step Creator):** Category capacity auto-presets (Dinner = 4, Concert = 6, Trek = 8), commercial public venue validation, and safety toggles (*Women-Only* or *Balanced Mixed*).
4. **Group Chat (The Core Loop):**
   - **State A (Locked):** Countdown progress bar until squad capacity fills.
   - **State B (Unlocked):** Real-time messaging, icebreaker prompts, and 1-tap emergency SOS location sharing.
5. **Trust Profile:** Verified work/student credentials, DigiLocker identity badges, and attendance karma score.

---

## ⚡ Database Architecture & Auto-Unlock Trigger

SquadIn uses PostgreSQL triggers on Supabase to automatically unlock group chats as soon as capacity is filled:

```sql
CREATE OR REPLACE FUNCTION check_plan_capacity_and_unlock() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_capacity >= NEW.target_capacity THEN
    UPDATE plans SET status = 'LOCKED_CHAT_ACTIVE' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_plan_auto_unlock
AFTER UPDATE OF current_capacity ON plans
FOR EACH ROW EXECUTE FUNCTION check_plan_capacity_and_unlock();
```

---

## 🛡️ Safety & Trust Framework

- **Identity Verification:** DigiLocker & Aadhaar verification integration.
- **Biometric Check-in:** Native Face ID / Fingerprint prompt before joining a public group.
- **Venue Geofencing:** Google Places API restriction preventing private residences from being listed.
- **Women-Only Protected Crews:** Hard gate preventing unverified profiles from discovering or joining women-only plans.
- **1-Tap Emergency SOS:** Instantly broadcasts live GPS coordinates and attendee details to emergency contacts.

---

## 📁 Repository Contents

- `Developer_VibeCoder_Native_App_Spec_Interactive.html` — Interactive developer master specification
- `Exact_User_Flowchart_Interactive.html` — Visual end-to-end user navigation flows
- `Post_Launch_GTM_Execution_Playbook.pdf` — College-by-college campus rollout strategy (NSUT, DU, IIT Delhi)
- `phase 1 plan.pdf` — Phase 1 MVP sprint breakdown

---

## 👤 Author

**Krrish Vimal**  
- Portfolio: [the-unsaid-desk.vercel.app](https://the-unsaid-desk.vercel.app)  
- GitHub: [@krrishvimal](https://github.com/krrishvimal)  
- LinkedIn: [krrish-vimal](https://linkedin.com/in/krrish-vimal)
