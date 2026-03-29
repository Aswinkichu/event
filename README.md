# 📚 How to Build an App Like Eventora — Learning Guide

This guide covers all the concepts your brother needs to research to understand and build a full-stack web app like this one. Each concept has a plain-English definition.

---

## 🧩 1. The Big Picture — What Kind of App Is This?

### Full-Stack Web App
An app with two parts working together:
- **Frontend** — what the user sees in the browser (HTML, CSS, JavaScript)
- **Backend** — a server that handles logic, stores data, and sends emails

### Client-Server Model
The browser (client) asks the server for data. The server processes the request and sends back a response. Like ordering food — you order (request), kitchen prepares it (server processes), waiter brings it (response).

### REST API
A standard way for frontend and backend to talk to each other using HTTP. Each "endpoint" is a URL that does something:
- `GET /bookings` → fetch list of bookings
- `POST /bookings` → create a new booking
- `PATCH /bookings/123/status` → update booking status
- `DELETE /bookings/123` → delete a booking

---

## 🖥️ 2. Frontend Concepts

### HTML
The structure of a webpage. Defines elements like buttons, forms, tables, images.

### CSS
Styles the HTML — colors, fonts, spacing, animations, layouts. This project uses Vanilla CSS (no frameworks).

### JavaScript
Makes the page interactive. Handles button clicks, form submissions, fetching data from the server, updating the page without reloading.

### ES Modules (`import` / `export`)
A modern way to split JavaScript into multiple files and share code between them.
```js
// In utils.js
export function greet(name) { return `Hello, ${name}`; }

// In app.js
import { greet } from './utils.js';
```

### `fetch` / `async` / `await`
JavaScript's way to make HTTP requests to the backend without freezing the page.
```js
const data = await fetch('/api/users');
const json = await data.json();
```

### DOM Manipulation
Using JavaScript to read and change HTML elements on the page dynamically.
```js
document.getElementById('title').innerText = 'Hello!';
```

### SPA — Single Page Application
The page never fully reloads. JavaScript swaps out content based on the URL hash (`#home`, `#auth`, `#contact`). Makes apps feel fast.

### Vite
A modern build tool and dev server for frontend projects. Bundles all JS/CSS files for the browser.

---

## 🔧 3. Backend Concepts

### Node.js
JavaScript runtime that lets you run JS on the server (outside the browser). This is what powers the API.

### Express.js
A Node.js framework for building APIs. Makes it easy to define routes, handle requests, and send responses.
```js
app.get('/bookings', (req, res) => {
  res.json({ bookings: [] });
});
```

### Middleware
Functions that run between receiving a request and sending a response. Used for authentication, validation, logging, etc.

### Environment Variables (`.env`)
Secret config values stored in a file instead of hardcoded in code. Database passwords, API keys, etc. Never commit this file to Git.
```
DATABASE_URL=postgresql://...
JWT_SECRET=my_secret_key
```

### nodemon
A dev tool that automatically restarts the Node server whenever you save a file.

### JSON (JavaScript Object Notation)
The data format used to send information between frontend and backend. Like a dictionary/object:
```json
{ "name": "Jane", "email": "jane@example.com" }
```

---

## 🗄️ 4. Database Concepts

### Database
Where all data is permanently stored — users, bookings, categories, options, etc.

### PostgreSQL
A powerful, open-source relational database. Data is stored in tables with rows and columns, like Excel but much more powerful.

### SQL (Structured Query Language)
The language used to talk to relational databases:
```sql
SELECT * FROM bookings WHERE status = 'PENDING';
```

### ORM — Object Relational Mapper (Prisma)
A tool that lets you write database queries in JavaScript instead of SQL. Prisma also manages the database schema (structure of tables).
```js
const bookings = await prisma.booking.findMany({ where: { status: 'PENDING' } });
```

### Schema / Migration
**Schema** = the structure of your database (what tables exist, what columns they have).
**Migration** = a script that changes the schema (e.g. adds a new column). Prisma generates these automatically.

### Relations
Tables can be linked to each other. For example, a `Booking` belongs to a `User`, and has many `Options`. This is called a **foreign key** relationship.

---

## 🔐 5. Authentication & Security

### Authentication vs Authorization
- **Authentication** = proving who you are (login)
- **Authorization** = proving you're allowed to do something (admin vs customer)

### Password Hashing (bcrypt)
Never store plain passwords. bcrypt converts a password into a scrambled hash. Even if the database is stolen, passwords can't be read.

### JWT — JSON Web Token
After login, the server gives the user a signed token. The user sends this token with every future request to prove they're logged in. No session stored on the server.

### Middleware for Auth (`protect`)
A middleware that checks if the JWT token is valid before allowing access to protected routes like `POST /bookings`.

---

## 📦 6. File Handling & Storage

### Multer
A Node.js middleware for handling file uploads (images) sent from forms.

### Supabase Storage / S3
Cloud storage for uploaded files. Instead of saving images on the server's disk, they're stored in the cloud and accessed via a URL.

---

## 📧 7. Email

### SMTP
Protocol for sending emails. Gmail, Outlook, etc. are SMTP servers.

### Nodemailer
A Node.js library that sends emails through an SMTP server.

### App Password (Gmail)
Google requires a special 16-character app password instead of your real Gmail password when using Gmail's SMTP server programmatically.

### HTML Email
Emails can be styled with HTML and inline CSS to look like a proper designed email (not just plain text).

---

## 🛡️ 8. Validation

### Input Validation
Always check user input on the server before using it. Never trust what the user sends.

### Zod
A JavaScript library for defining schemas and validating data:
```js
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```
If validation fails, it returns a detailed error explaining what's wrong.

---

## 🛠️ 9. Development Tools & DevOps

### Git & GitHub
**Git** = version control. Track changes to your code, go back in time if you break something.
**GitHub** = host your Git repository online, collaborate with others.

### npm (Node Package Manager)
Installs and manages JavaScript libraries (packages/dependencies) for your project.

### Monorepo
A single code repository containing multiple projects (in this case, `apps/api` and `apps/web` live together in one repo).

### Docker
Packages your app and all its dependencies into a "container" that runs the same everywhere. Useful for running PostgreSQL locally.

### docker-compose
A tool to run multiple Docker containers together (e.g. your database + your API) with one command: `docker-compose up`.

### CORS — Cross-Origin Resource Sharing
A browser security rule. If your frontend is on `localhost:5173` and your API is on `localhost:5000`, you must explicitly allow the frontend to talk to the API.

### Helmet
A Node.js security library that sets HTTP headers to protect against common attacks.

---

## 📐 10. Project Architecture

### MVC — Model, View, Controller
A pattern for organizing backend code:
- **Model** = database schema (Prisma models)
- **View** = API response (JSON)
- **Controller** = business logic (what happens when a route is hit)

### Service Layer
Extra separation where controllers call *services* which contain the actual business logic. Keeps controllers clean and code reusable.

### Routes
Define what URL maps to what controller function:
```
POST /auth/register → register controller
GET  /admin/bookings → getAllBookings controller
```

---

## 🗺️ Suggested Learning Roadmap

Start in this order — each step builds on the previous:

| Step | Topic | Resources to Search |
|------|-------|---------------------|
| 1 | HTML & CSS basics | "HTML Crash Course", "CSS Flexbox Tutorial" |
| 2 | JavaScript fundamentals | "JavaScript for Beginners", "JS async/await explained" |
| 3 | Node.js & Express | "Node.js Express REST API tutorial" |
| 4 | SQL & PostgreSQL basics | "PostgreSQL beginner tutorial" |
| 5 | Prisma ORM | "Prisma getting started guide" |
| 6 | JWT Authentication | "JWT authentication Node.js tutorial" |
| 7 | File uploads with Multer | "Multer file upload Express tutorial" |
| 8 | Git basics | "Git and GitHub beginner tutorial" |
| 9 | Vite + ES Modules | "Vite JS beginner guide" |
| 10 | Docker basics | "Docker Compose for beginners" |

> **Tip:** Build small projects at each step before moving on. For example, after learning Express, build a simple to-do list API before moving to authentication.
