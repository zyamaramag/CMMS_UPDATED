# HVL CMMS Prototype Guide

## Prototype architecture

This project is a frontend-only React and Vite prototype. Inventory, material requests, approval states, transactions, messages, and activity logs are stored in a versioned browser `localStorage` record.

The prototype data is:

- persistent in the same browser profile after refresh;
- unavailable in private contexts that block browser storage;
- not synchronized between browsers, devices, or users;
- not a substitute for server authentication, authorization, audit retention, or a database.

Credential-bearing user and pending-registration records are intentionally not written to `localStorage`.

Administrators can restore the original records under **Settings → System → Backup & Restore → Reset to Sample Data**.

## Voice commands

The microphone control is in the application header on every authenticated page. Select **Start Hands-Free Mode** once and the assistant continues listening across route changes until the user says `Stop listening` or selects **Stop**. After each utterance, the application automatically creates a fresh recognition cycle so browsers that end recognition after one command continue listening without another microphone click.

The active microphone button turns yellow, and a persistent **Voice Active** bar remains visible after the command dialog closes. It shows the latest recognized phrase and provides a Stop control.

The command dialog displays clickable examples filtered to the current account role. Selecting an example runs it immediately. A typed command field remains available in every browser.

Site-wide navigation commands cover every page available to the signed-in role:

- All roles: Dashboard, Inventory, and Settings
- Admin: Material Requests, Approvals, User Approvals, IN/OUT Tracking, User Management, Activity Logs, and Security Center
- Warehouse Staff: IN/OUT Tracking and Activity Logs
- Engineer: Messages
- Project Manager: Material Requests, Messages, and IN/OUT Tracking

Supported commands include:

- `Go to the dashboard`
- `Open inventory`
- `Find cement`
- `Check the available stock of steel bars`
- `Show materials that are running low`
- `Create a request for 50 bags of cement for Project A`
- `Show my pending requests`
- `Show pending approvals`
- `Approve request REQ001`
- `Reject request REQ001`
- `Show status of request REQ001`
- `Show materials issued to Project A`
- `Receive 50 bags of cement in from Supplier ABC`
- `Release 20 steel rebars to Project A`
- `Edit request REQ001`
- `Cancel request REQ001`
- `Add a new material`
- `Edit material Portland Cement`
- `Find user John Doe`
- `Edit user John Doe`
- `Add a new user`
- `Show Material OUT activity logs`
- `Show blocked security events`
- `Show unread messages`
- `Show sent messages`
- `Open notification settings`
- `Open system settings`
- `Compose message to Project Manager about REQ001 saying Please review this request`
- `Compose message to Field Engineer saying Please confirm the site requirements`
- `Send message to John Doe saying Please inspect the delivered materials`
- `Go back`
- `What can I say?`
- `Stop listening`

Approval and rejection commands open the existing confirmation workflow. They never execute solely from speech recognition. Request commands prefill the existing form and require review and submission.

Message commands are available to Engineers and Project Managers. The assistant validates the recipient against the active users allowed for that role, extracts an optional subject after `about`, extracts the message body after `saying`, and links a recognized request such as `REQ001`. It opens the existing Compose dialog with those fields populated. Voice recognition never sends the message automatically; the user must review the draft and select **Send Message**.

Admin and Warehouse Staff stock commands populate the existing Material IN/OUT form after validating the material, quantity, and available stock. User, material, request, and settings commands open the existing form, dialog, filter, or tab. They do not save, delete, cancel, release, receive, send, approve, reject, or change security-sensitive values automatically. Activity-log visibility remains role-restricted, and Security Center filtering remains Admin-only.

Speech recognition uses `SpeechRecognition` or `webkitSpeechRecognition`. Chrome and Edge generally provide the strongest support. Microphone use requires HTTPS and browser permission. Firefox and some Safari/iOS versions may not support this API; typed commands and clickable registered examples are the supported fallback.

Hands-free mode is always opt-in. Role checks, confirmation dialogs, and validation remain active for every command.

## Workflow measurements

The counts below use the same task and starting condition and count each navigation/control activation or field entry as one action.

### Material request from the dashboard

Original mouse/keyboard path:

1. Open Material Requests.
2. Select a material.
3. Enter a quantity.
4. Enter a needed date.
5. Enter a purpose/project.
6. Submit.

Total: **6 actions**.

Enhanced voice path for a complete command:

1. Open Voice Commands.
2. Say or type `Create a request for 50 bags of cement for Project A`.
3. Review the populated summary and submit.

Total: **3 actions**.

Measured reduction: `((6 - 3) / 6) × 100 = 50%`.

The ordinary non-voice path is reduced from six to five actions because the needed date receives a seven-day contextual default.

### Approval

The existing two-step row action and confirmation is retained because approval/rejection is consequential. Voice commands open the same confirmation. No 40% reduction is claimed for this workflow because removing confirmation would conflict with the safety requirement.

## Accessibility behavior

- A skip link moves focus to the main content.
- Route changes update the document title and move focus to main content.
- Sidebar items support Arrow Up, Arrow Down, Home, and End.
- Radix dialogs trap and restore focus; the custom session warning does the same.
- Core data tables have accessible names and descriptions.
- Dynamic request, stock, search, and voice states use polite or assertive live announcements.
- Coarse-pointer devices receive minimum 44-pixel interactive targets.
- Reduced-motion preferences disable nonessential animation.

These changes target WCAG 2.1 AA. They do not constitute a formal conformance claim without assistive-technology, contrast, zoom/reflow, and cross-browser testing.

## Build and Vercel deployment

```bash
pnpm install
pnpm build
```

The production output is written to `dist`. `vercel.json` configures the Vite build and rewrites client-side routes to `index.html`.

Vercel deployment must have registry access during dependency installation. A registry/network error such as `ERR_PNPM_META_FETCH_FAIL` occurs before the application build and must be resolved through the Vercel build environment or registry availability.

No environment variables are required for this frontend prototype.

## Manual verification still required

The following checks require real browsers, operating systems, devices, or deployment access:

- microphone permission and recognition quality on the deployed HTTPS URL;
- NVDA, JAWS, and VoiceOver navigation;
- 200%/400% zoom and responsive reflow;
- physical touch-device behavior;
- browser-specific speech-recognition availability;
- actual Vercel dependency installation and deployment.
