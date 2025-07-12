# **App Name**: SkillSwap

## Core Features:

- Skill Search: Skill Search and Filter: Enable users to search for skills and filter based on availability and other criteria. Display public profiles only, with paginated results or infinite scroll.
- Profile Management: Profile Management: Allow users to edit and update their profile with details such as name, location, photo, skills offered/wanted, and availability. Manage profile visibility (public/private).
- Swap Requests: Swap Requests: Implement functionality to send skill swap requests to other users, including offered and requested skills, and an optional message. View incoming/outgoing requests and accept, reject, or cancel them.
- Realtime Notifications: Realtime Updates: Use WebSocket or Server-Sent Events (SSE) for new swap request notifications and status updates.
- AI Skill Suggestions: AI Skill Suggester: Suggest skills based on user profile content, past swap behavior, and popular/trending skills. Provide a tool for suggesting skills in the profile editor.
- Feedback & Ratings: Feedback & Ratings: Allow users to leave ratings and feedback after a successful swap. Display ratings on public profiles and enable reporting of inappropriate feedback.
- Authentication & Account Management: Authentication & Account Management: Enable email/password login, signup with email verification, forgot/reset password functionality, and account deletion with data wipe.

## Style Guidelines:

- Primary color: Use a deep teal (#008080) to create a sense of trustworthiness and knowledge.
- Background color: Very light green-tinged gray (#F0F8F0). This provides a muted background that harmonizes with the primary and accent colors, while providing sufficient contrast for text readability.
- Accent color: Saturated light blue (#7FDEFF), analogous to the primary color in hue, and providing visual contrast via saturation and brightness. Use the accent color for interactive elements.
- Body font: 'PT Sans', sans-serif. This is suitable for both headlines and body text.  
- Code font: 'Source Code Pro', monospaced. This will be used for displaying any code snippets.
- Consistent Icon Set: Use a unified icon set (e.g., Lucide or Heroicons) for skills, filters, and notifications to maintain a clean and cohesive design.
- Subtle Transitions: Use Framer Motion for page transitions, button interactions (scale on click), and skill tag entrance animations. Keep durations between 0.2–0.4s with ease-in-out curves for a smooth user experience.