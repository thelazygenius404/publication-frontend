# AutoPublisher Frontend

Responsive React frontend for the **AutoPublisher** content publication platform.

The application provides a user interface for creating, reviewing, validating, scheduling, publishing, and monitoring content across **LinkedIn** and **WordPress**.

It communicates with the Spring Boot Publication API and delegates asynchronous publication execution to the backend/n8n architecture.

---

## Features

- User registration and JWT authentication
- Responsive desktop, tablet, and mobile interface
- Light and dark themes with persistent preference
- Publication dashboard with status counters, connected account status, search, filtering, pagination, CSV export, publication details, and cancellation
- Content editor
- Gemini-assisted content generation and improvement
- Human validation before publication
- Immediate and scheduled publishing
- LinkedIn account connection through OAuth 2.0
- WordPress account connection using Application Passwords
- Publication lifecycle monitoring
- Responsive mobile navigation drawer and publication cards

---

## Technology Stack

| Technology | Usage |
| --- | --- |
| React 19 | User interface |
| Vite 8 | Development and production build |
| React Router | Client-side routing |
| Axios | HTTP communication |
| Tailwind CSS 4 | Styling and responsive design |
| Lucide React | Icons |
| ESLint | Static analysis |

---

## Architecture

```text
React Frontend
      |
      | JWT REST API
      v
Spring Boot Publication API
      |
      +--> MariaDB
      |
      +--> Google Gemini
      |
      +--> n8n
              |
              +--> LinkedIn
              |
              +--> WordPress
```

The frontend does not communicate directly with LinkedIn, WordPress, Gemini, or n8n. All business rules and sensitive credentials remain on the backend.

---

## Prerequisites

- Node.js
- npm
- Publication API running on port `8080`

---

## Installation

Clone the repository:

```bash
git clone https://github.com/thelazygenius404/publication-frontend.git
cd publication-frontend
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Default configuration:

```env
VITE_API_URL=http://localhost:8080
```

---

## Development

Start the Vite development server:

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

The Spring Boot backend must allow this origin through CORS.

---

## Production Build

Create the optimized production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview -- --host 0.0.0.0
```

Default preview URL:

```text
http://localhost:4173
```

The backend development configuration supports both:

```text
http://localhost:5173
http://localhost:4173
```

---

## Validation

Run ESLint:

```bash
npm run lint
```

Create the production build:

```bash
npm run build
```

Final verified state:

```text
ESLint: PASS
Production build: PASS
```

Final mobile Lighthouse audit:

```text
Performance:      85
Accessibility:    93
Best Practices:  100
SEO:              82
```

---

## Application Pages

### Login and Registration

Public authentication pages supporting user registration, login, validation errors, and persistent light/dark theme.

### Dashboard

The dashboard displays publication counters, content preparation metrics, account connection states, search, filtering, pagination, CSV export, publication details, and cancellation controls.

On mobile devices, publication rows are rendered as responsive cards instead of a wide table.

### Editor

The editor supports manual content creation, Gemini generation and improvement, draft persistence, human validation, LinkedIn/WordPress selection, immediate publishing, and scheduled publishing.

AI-generated content cannot bypass the human validation step.

### Settings

The Settings page allows users to connect/disconnect LinkedIn and WordPress, inspect integration status, view token expiry information, and review the main backend architecture components.

---

## Publication Lifecycle

```text
Create / Generate
      |
      v
    DRAFT
      |
      | Human validation
      v
    READY
      |
      | Publish
      v
PENDING / SCHEDULED
      |
      v
 PROCESSING
   /      \
  v        v
PUBLISHED FAILED
```

Pending and scheduled publications can also be cancelled.

---

## External Integrations

### LinkedIn

LinkedIn is connected through OAuth 2.0.

The current implementation publishes to the authenticated LinkedIn member profile using:

```text
w_member_social
```

Publishing directly to a LinkedIn organization Page would require LinkedIn Community Management API access and additional organization permissions.

### WordPress

WordPress uses the WordPress REST API, WordPress username, and a WordPress Application Password.

When WordPress runs locally in Docker and n8n must access it, a container-reachable URL can be used, for example:

```text
http://host.docker.internal:8081
```

---

## AI Integration

Google Gemini is accessed through the backend using Spring AI.

The frontend exposes Generate and Improve actions. Gemini quota or provider failures are reported without exposing API credentials.

AI output always remains subject to human review.

---

## Responsive Design

The application has been validated at:

```text
375 × 667
390 × 844
768 × 1024
desktop
```

Responsive behavior includes a mobile navigation drawer, mobile publication cards, stacked filters/actions, responsive dialogs, editor, settings cards, and authentication screens.

---

## Security

The frontend:

- stores the JWT locally for authenticated API calls
- never stores LinkedIn client secrets
- never stores WordPress Application Passwords directly
- never stores the Gemini API key
- never communicates directly with n8n internal endpoints

Third-party credentials are handled and encrypted by the Spring Boot backend.

Never commit `.env` files or credentials.

---

## Related Repository

Backend and n8n workflow:

```text
https://github.com/thelazygenius404/publication-api
```

---

## Final Verified Workflow

The end-to-end WordPress publication flow has been validated successfully:

```text
React
→ Spring Boot
→ n8n
→ WordPress
→ Spring Boot callback
→ Dashboard status: PUBLISHED
```

Scheduled publishing, cancellation, LinkedIn personal publishing, account integrations, and responsive UI behavior were also validated during development.
