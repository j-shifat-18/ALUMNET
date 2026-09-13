---
inclusion: auto
name: api-docs
description: Triggered whenever the user asks to implement, add, or modify an API endpoint in the backend
---

# API Documentation Rule

Whenever you implement a new API endpoint or modify an existing one in the backend (`/code/backend/src/`), you **must** also update the API reference file:

```
/Users/shifat/projects/ALUMNET/code/backend/CHAT_API.md
```

## What to document for every endpoint

Add a section (or update the existing section) that includes:

1. **Method + path** — e.g. `POST /api/v1/conversations`
2. **Description** — one paragraph explaining what the endpoint does
3. **Headers table** — `Authorization`, `Content-Type`, required/optional
4. **URL parameters table** — name, type, description (if any)
5. **Query parameters table** — name, type, default, description (if any)
6. **Request body** — Zod schema rules summarized as a table + a JSON example
7. **Success response** — HTTP status code + full JSON example showing the actual shape returned by `sendResponse()`
8. **Error responses table** — status code, message string, cause

## Format rules

- Use the same heading style as the existing file: `## METHOD /path`
- JSON examples must match the actual field names returned by the service (check the Prisma `select` shapes)
- Place new endpoint sections under the correct category heading (e.g. **Conversations**, **Notifications**, **Messages**)
- Add a row to the **Changelog** table at the bottom of the file

## Also update when

- A validation rule changes (add/remove field, change min/max)
- A response shape changes (new field added, field renamed)
- A new error case is added to a service
- A Socket.IO event is implemented (add to the Socket Events table)
