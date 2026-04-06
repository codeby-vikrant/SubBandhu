<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into SubBandhu, an Expo/React Native subscription tracking app. The following changes were made:

- **`app.config.js`** (new) — Converted `app.json` to a JS config file to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` as Expo extras, making them available at runtime via `expo-constants`.
- **`src/config/posthog.ts`** (new) — PostHog singleton client configured via `Constants.expoConfig.extra`, with app lifecycle capture, debug mode in dev, batching, and a graceful no-op when the token is not set.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping the app, manual screen tracking with `posthog.screen()` using `usePathname` + `useGlobalSearchParams`, consistent with Expo Router best practices.
- **`app/(auth)/sign-in.tsx`** — Added `user_signed_in` + `posthog.identify()` on success, `sign_in_failed` on error, and `sign_in_mfa_verified` after MFA code verification.
- **`app/(auth)/sign-up.tsx`** — Added `sign_up_email_submitted` when verification email is sent, `sign_up_failed` on error, and `user_signed_up` + `posthog.identify()` after email verification completes.
- **`app/(tabs)/settings.tsx`** — Added `user_signed_out` event and `posthog.reset()` before calling Clerk's `signOut()`.
- **`app/(tabs)/index.tsx`** — Added `subscription_card_expanded` and `subscription_card_collapsed` events when users tap subscription cards on the home screen.
- **`app/(tabs)/insights.tsx`** — Added `insights_screen_viewed` event on mount (top-of-funnel indicator).
- **`app/subscriptions/[id].tsx`** — Added `subscription_detail_viewed` event on mount with the subscription ID as a property.
- **`.env`** — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (already covered by `.gitignore`).

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completes the sign-in flow | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | Sign-in attempt failed with a Clerk error | `app/(auth)/sign-in.tsx` |
| `sign_in_mfa_verified` | User verifies MFA/client-trust email code during sign-in | `app/(auth)/sign-in.tsx` |
| `sign_up_email_submitted` | User submits sign-up form; verification email sent | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | Sign-up attempt failed with a Clerk error | `app/(auth)/sign-up.tsx` |
| `user_signed_up` | User completes registration including email verification | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `subscription_card_collapsed` | User collapses an expanded subscription card | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | User views the dedicated subscription detail screen | `app/subscriptions/[id].tsx` |
| `insights_screen_viewed` | User navigates to the Insights tab | `app/(tabs)/insights.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/371362/dashboard/1435947
- **Sign-Up Funnel** (conversion: email submitted → account created): https://us.posthog.com/project/371362/insights/YvPItiob
- **Daily Sign-Ins vs Sign-In Failures** (auth health): https://us.posthog.com/project/371362/insights/r8Wq4li1
- **New Users (Sign-Ups) Over Time** (growth): https://us.posthog.com/project/371362/insights/Z3kT1UpK
- **Subscription Engagement (Card Expansions)** (feature usage): https://us.posthog.com/project/371362/insights/UxGUiUZv
- **Churn Indicator: Sign-Outs Over Time**: https://us.posthog.com/project/371362/insights/Fd7yjQ0C

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
