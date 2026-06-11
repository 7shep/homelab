# homelab Features

homelab is tiny observability for solo developers, side projects, and small self-hosted stacks. It focuses on answering the practical questions: what is running, what changed, what broke, and what needs attention.

## Core Features

### Project Registry

Track every app, service, worker, cron job, server, and domain in one place. The registry gives homelab a simple inventory of what you own and what should be monitored.

### HTTP Uptime Checks

Periodically check whether a website or API endpoint responds successfully. Checks can validate status codes, latency, redirects, and optional expected response text.

### TLS Certificate Expiration

Monitor certificate expiration for configured domains. homelab should warn before certificates become urgent, with thresholds such as 30, 14, and 7 days.

### Deploy Markers

Record deploy events with version numbers, git SHAs, timestamps, and optional notes. These markers make it easier to see whether failures started after a specific release.

### Event Timeline

Show health checks, deploys, alerts, cron runs, and server warnings on one timeline. The timeline should answer, "What changed before this broke?"

### Cron Heartbeats

Let scheduled jobs report success or failure by calling a homelab URL. If a job misses its expected schedule or reports failure, homelab can mark it unhealthy and alert the owner.

### Server Health Checks

Monitor basic VPS health such as disk usage, memory pressure, load average, and uptime. The first version can use an agent or SSH-based checks, with Docker container status added later.

### Docker Container Status

Track whether expected containers are running, restarting, unhealthy, or missing. This helps solo developers spot broken Compose stacks without logging into each server.

### Simple Alerts

Send alerts when checks fail, cron jobs miss their window, disks fill up, or certificates approach expiration. Start with email and webhooks, then add Discord, Slack, and other targets.

### Status Dashboard

Provide a small web UI that shows all projects and their current state. The dashboard should be calm, scannable, and focused on what needs attention now.

### CLI

Provide a practical command-line interface for setup, status checks, deploy markers, and local workflows. The CLI should make common actions fast, scriptable, and friendly to GitHub Actions or shell scripts.

### Source-Controlled Config

Allow projects, checks, servers, alert targets, and heartbeat schedules to be defined in a config file. This makes homelab portable, reviewable, and easy to recreate on a new machine.

## Later Features

### Public Status Pages

Generate optional public status pages for selected projects. This should be useful for open-source projects, small SaaS products, and personal services without requiring a separate hosted status-page provider.

### Log Pointers

Store links or commands for where logs live instead of trying to become a full logging platform. homelab can help users jump from an alert to the right `docker logs`, journal, file, or provider dashboard.

### Backup Checks

Track whether backups are running and whether the latest backup is recent enough. A later version can add restore verification so users know their backups actually work.

### Deploy Integrations

Provide easy deploy marker integrations for GitHub Actions, Coolify, Dokku, Kamal, Docker Compose, and custom scripts. The goal is to make every deploy visible without forcing users to change their deployment stack.

### Multi-Region Checks

Run uptime checks from more than one location to distinguish local network problems from real outages. This can be optional and useful for a hosted version or federated self-hosted nodes.

### Incident Notes

Let users attach short notes to outages, warnings, or deploys. Over time, homelab becomes a lightweight operational history for small projects.

### Plugin API

Expose a small API for custom checks and alert targets. This lets the community add integrations without turning the core project into a large observability platform.

## Suggested Implementation Order

1. **Application shell and navigation**

   Build the main GUI layout first: sidebar navigation, dashboard route, projects route, timeline route, alerts route, servers route, config route, and settings route. Keep the first version mostly static, but make the structure feel like the final product so future features have obvious homes.

2. **Core data model**

   Define the shared concepts that every feature will use: projects, checks, check results, deploy markers, timeline events, alerts, servers, and alert targets. This should come before individual monitoring features so the UI and backend do not drift into separate shapes.

3. **Project registry**

   Implement project creation, editing, listing, and detail pages. Projects should be able to represent apps, services, workers, cron jobs, servers, and domains. The project detail page should become the hub for checks, deploys, alerts, timeline events, config, and later log pointers.

4. **Status dashboard**

   Connect the dashboard to the project registry and shared status model. Show global health, projects needing attention, recent events, active alerts, and upcoming risks. At this stage, mock or seed status data is acceptable if real checks are not implemented yet.

5. **Event timeline**

   Implement timeline storage and UI before adding many check types. Health check results, deploys, cron runs, alerts, server warnings, and later incident notes should all appear as timeline events.

6. **HTTP uptime checks**

   Add the first real monitor type. Support URL, expected status code, timeout, latency tracking, redirect handling, and optional expected response text. Feed results into project status, the dashboard, alerts, and the event timeline.

7. **Simple alerts**

   Create the alert lifecycle: triggered, active, acknowledged, resolved. Start with one delivery target, such as email or webhook, and make the alert UI useful before adding many integrations.

8. **TLS certificate expiration checks**

   Add domain certificate monitoring with warning thresholds such as 30, 14, and 7 days. Surface expiring certificates on the dashboard as upcoming risks, not only as failures.

9. **Deploy markers**

   Add deploy marker creation through the UI and API. Store version, git SHA, timestamp, project, source, and notes. Show deploys in project detail pages and the event timeline so failures can be correlated with releases.

10. **Cron heartbeats**

   Add heartbeat endpoints that scheduled jobs can call. Track last success, last failure, expected schedule, grace period, and missed windows. Missed heartbeats should affect project status, alerts, and the timeline.

11. **Source-controlled config**

   Add config import/export once the core model is stable. Support projects, checks, servers, alert targets, and heartbeat schedules. The GUI should be able to show where a setting came from and avoid fighting the config file.

12. **CLI**

   Build the CLI around workflows that should be scriptable: setup, status, adding deploy markers, validating config, sending heartbeats, and checking current health. Make it friendly for GitHub Actions and shell scripts.

13. **Server health checks**

   Add VPS/server monitoring for disk usage, memory pressure, load average, and uptime. Start with the simplest reliable collection method, then connect server warnings to alerts and the timeline.

14. **Docker container status**

   Add container monitoring after server health exists. Track expected containers, running state, restarts, unhealthy containers, and missing containers. Group containers by server and project when possible.

15. **Log pointers**

   Add links or commands that tell the user where to look next when something breaks. Keep this lightweight: `docker logs`, journal commands, file paths, provider dashboards, or hosted log URLs.

16. **Backup checks**

   Add backup freshness checks after the main health surfaces are working. Track latest backup time, expected frequency, and stale backup alerts. Restore verification can come later.

17. **Incident notes**

   Let users attach short notes to outages, deploys, alerts, and timeline events. This turns homelab into a small operational history without becoming a full incident-management tool.

18. **Public status pages**

   Add optional public pages for selected projects once internal status is reliable. Keep the public surface separate from the private dashboard and expose only intentionally selected checks.

19. **Deploy integrations**

   Add integrations for GitHub Actions, Coolify, Dokku, Kamal, Docker Compose, and custom scripts after deploy markers are already useful through the core API and CLI.

20. **Multi-region checks**

   Add regional check runners after single-location uptime checks are mature. Use this to distinguish real outages from network or location-specific failures.

21. **Plugin API**

   Add the plugin API last, after the internal contracts have proven themselves. Plugins should extend checks and alert targets without forcing core rewrites.
