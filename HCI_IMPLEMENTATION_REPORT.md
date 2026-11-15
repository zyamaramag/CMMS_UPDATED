# HCI 2 Baseline and Implementation Report

## Scope and system baseline

This report records the inspected state of the frontend prototype before this HCI pass and the changes made in this pass. The application is a React 18 + TypeScript + Vite + Tailwind CSS frontend. It uses React Router, Radix-based UI components, local React contexts, mock seed data, and browser `localStorage`. There is no connected backend or shared database in this repository, so persistence is browser-local and authorization is prototype-level route/UI enforcement.

### Roles and workflow

- Admin/Owner: reviews requests, manages inventory/users/security, and can process stock.
- Project Manager: submits and tracks their own requests and communicates with Engineers.
- Engineer: views inventory and communicates with Project Managers.
- Warehouse Staff: maintains inventory and records Material IN/OUT.
- Actual request lifecycle: `pending → approved → issued`; `rejected` and `cancelled` are terminal outcomes.

### Representative task baseline

The baseline was established by source inspection of the current repository immediately before this pass. An interaction is one navigation activation, field selection/entry, or action-button activation; individual keystrokes are not counted. Existing enhancements from earlier work are part of this baseline because no untouched historical build is available.

| Task | Role | Baseline path | Baseline interactions | Observed issue |
| --- | --- | --- | ---: | --- |
| Create a material request | Project Manager | Open Material Requests; select material; enter quantity; enter purpose; submit (date has a default) | 5 | Invalid submission feedback was announced but not shown beside fields; disabled submit could hide why submission was unavailable. |
| Search inventory | Any signed-in role | Open Inventory; enter query | 2 | Search already updated real filtered results and announced the count. |
| Approve a request | Admin | Open Approvals; activate Approve; confirm Approve Request | 3 | Confirmation existed, but the data action did not independently reject a stale/non-pending transition. |
| Check request progress | Project Manager | Open Material Requests; locate/read request status | 2 | Only the current badge and notes were visible; completed and remaining lifecycle stages were not shown. |

Voice shortcuts can reduce some tasks to one command after voice mode is active, but those commands were not used for the ordinary-control baseline. Task completion times and error rates were not measured because there is no prior instrumented build, usability session, or timing harness. No percentages are claimed.

## Existing accessibility and HCI features found

- Role-filtered routes and navigation.
- Voice navigation, inventory search, complete request submission, and confirmation-first approval/rejection.
- Typed-command fallback and microphone permission/unsupported-browser feedback.
- Skip-to-main-content control, route-change focus management, and document-title updates.
- Global high-visibility `:focus-visible` styling and reduced-motion support.
- Radix dialogs, selects, tabs, and popovers with established keyboard behavior.
- Responsive card alternatives to wide data tables and coarse-pointer target sizing.
- Text labels plus icons on inventory/request statuses.
- Central polite/assertive live-region announcements.
- A keyboard-trapped, labelled session warning synchronized to the inactivity deadline.

## Improvements in this pass

### Modified and created files

- `src/app/components/RequestProgress.tsx` — accessible lifecycle visualization.
- `src/app/components/VoiceCommandCenter.tsx` — duplicate speech-result protection and quantity validation.
- `src/app/contexts/DataContext.tsx` — guarded approval/rejection transitions with success results.
- `src/app/pages/MaterialRequestPage.tsx` — inline validation, first-error focus, contextual help, and progress display.
- `src/app/pages/ApprovalPage.tsx` — guarded action feedback, rejection validation/focus, and progress display.
- `HCI_IMPLEMENTATION_REPORT.md` — baseline, measurements, implementation record, and verification limits.

### Objective 1 — voice commands

- Preserved the existing role-aware command system and confirmation-first approval/rejection flow.
- Added duplicate transcript suppression for repeated browser speech-result events.
- Preserved complete direct request submission while incomplete requests continue to receive corrective feedback rather than being submitted.

### Objective 2 — keyboard accessibility

- Invalid request submission now focuses the first invalid control.
- Rejection without a reason focuses the reason field.
- Existing Radix dialog focus containment/restoration, skip link, route focus, arrow-key sidebar navigation, and global focus indicators were retained.

### Objective 3 — screen reader and accessibility feedback

- Added field-specific visible errors with `aria-invalid` and `aria-describedby`.
- Added concise quantity, purpose, and rejection guidance.
- Kept centralized success/error announcements.
- Added an accessible textual description to every lifecycle indicator; status remains communicated by text and icon rather than color alone.

### Objective 4 — workflow optimization

- Added a lifecycle indicator driven only by the real request status and existing timestamps/data.
- Pending, approved, issued, rejected, and cancelled paths are represented without fabricated history.
- Added context at the point of request entry.
- Added data-layer guards so stale/non-pending requests cannot be approved or rejected by repeated UI execution.

## Before-and-after comparison

| Task | Before | After | Result |
| --- | ---: | ---: | --- |
| Create request with valid data | 5 interactions | 5 interactions | Necessary validation steps retained; error recovery is clearer and focused. |
| Search inventory | 2 interactions | 2 interactions | Existing optimized path retained. |
| Approve request | 3 interactions | 3 interactions | Required consequential-action confirmation retained; stale transition is now guarded. |
| Check request progress | 2 interactions | 2 interactions | Same navigation cost, but completed/current/remaining stages are visible in the request record. |

No interaction-count reduction is claimed where security or required data entry makes the existing count appropriate. The measurable improvement is information visibility and error recovery rather than fewer required controls.

## Verification boundaries

- The repository has no test script, Playwright, axe-core, or browser automation dependency.
- `pnpm build` completed successfully after the changes (Vite transformed 2,133 modules).
- The build reports the pre-existing large-chunk advisory; it does not report a compilation failure.
- Physical screen reader, microphone recognition, keyboard-only browser traversal, contrast tooling, and touchscreen-device testing remain manual checks.
- Full WCAG 2.1 AA conformance is not claimed.
