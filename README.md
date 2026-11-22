# ShopEase — Full Stack E-Commerce Web Application

**A BCA Final Year Project by Aayush**

A complete online shopping website where customers can browse products, add them to a cart, place orders and pay cash-on-delivery, while an Admin can manage products, users, orders and view sales analytics on a dashboard.

This README is written so that **even if you have never built a web project before, you can understand, explain and run this entire project** — what each technology is, why it was used, how the two halves (frontend + backend) talk to each other, how to set it up from zero, and how to explain it confidently to your project reviewer/examiner.

---

## Table of Contents

1. [What This Project Actually Is](#1-what-this-project-actually-is)
2. [The Big Picture — How a Website Like This Works](#2-the-big-picture--how-a-website-like-this-works)
3. [Tech Stack — Full List](#3-tech-stack--full-list)
4. [Backend — Theory, Libraries & Why Each One Is Used](#4-backend--theory-libraries--why-each-one-is-used)
5. [Frontend — Theory, Libraries & Why Each One Is Used](#5-frontend--theory-libraries--why-each-one-is-used)
6. [Database Design](#6-database-design)
7. [Folder Structure](#7-folder-structure)
8. [Full Setup Guide (From Zero)](#8-full-setup-guide-from-zero)
9. [All Features in the Website](#9-all-features-in-the-website)
10. [API Routes Summary](#10-api-routes-summary)
11. [3-Month Week-by-Week Development Journey](#11-3-month-week-by-week-development-journey)
12. [What to Tell Your Reviewer / Viva Preparation](#12-what-to-tell-your-reviewer--viva-preparation)
13. [Future Scope](#13-future-scope)

---

## 1. What This Project Actually Is

ShopEase is an **e-commerce website** — basically a mini Amazon/Flipkart. It has two types of users:

- **Customer** — can sign up, log in, browse products, search/filter them, add to cart, checkout (enter address, Cash on Delivery), see their past orders, and edit their profile.
- **Admin** — can log in to a special dashboard to: add/edit/delete products, mark a product "Sold" or "Active", manage all users (create/edit/delete, change roles), view and update the status of every order placed by every customer (Pending → Confirmed → Shipped → Delivered → Cancelled), see sales analytics (total revenue, total orders, daily sales chart), and read messages submitted through the "Contact Us" form.

The project is split into **two completely separate applications** that talk to each other over the internet (technically, over HTTP, but since we run both on your own PC, it's `localhost`):

| Part | What it is | Technology | Runs on |
|---|---|---|---|
| **Frontend** | What the user sees and clicks in the browser | React (JavaScript) | `http://localhost:5173` |
| **Backend** | The "brain" — processes requests, talks to the database | Node.js + Express | `http://localhost:3000` |
| **Database** | Where all the data (users, products, orders) is permanently stored | MySQL | `localhost:3306` |

---

## 2. The Big Picture — How a Website Like This Works

Imagine you walk into a restaurant:

- **You (the customer)** = the **Frontend**. You look at the menu, decide what you want, and tell the waiter.
- **The waiter** = the **API / Backend routes**. They take your order and walk it to the kitchen. They don't cook anything themselves.
- **The kitchen** = the **Backend logic (Controllers)**. This is where the actual "cooking" (business logic — checking stock, calculating totals, validating passwords) happens.
- **The store room / fridge** = the **Database (MySQL)**. This is where all the raw ingredients (data) are permanently kept.

So when you click "Add to Cart" on the website:
1. Your browser (**Frontend**, React) sends a request like *"Hey backend, please add product #6 to my cart"* — this is done using a library called **Axios**, over a plain HTTP request.
2. This request reaches the **Backend** (Node.js + Express), specifically a **route** (`POST /cart/add`).
3. The route hands it to a **controller function** (`addToCart` in `cartController.js`), which contains the actual logic: *is the user logged in? Does this product exist? Is it in stock?*
4. The controller talks to **MySQL** (using the `mysql2` library) to read/write data.
5. The result travels all the way back to the browser, and React updates the screen (e.g., shows "Added to Cart!").

This request-response cycle happens for every single action on the site (login, viewing products, placing an order, etc.). This overall style of building an API is called a **REST API** — a very common, standard way for a frontend and backend to communicate using simple HTTP methods:

| HTTP Method | Meaning | Example in this project |
|---|---|---|
| `GET` | "Give me data" | Get all products |
| `POST` | "Create something new" | Register a new user, place an order |
| `PUT` | "Update something existing" | Update a product's stock, change order status |
| `DELETE` | "Remove something" | Delete a product, delete a user |

---

## 3. Tech Stack — Full List

### Backend
- **Node.js** — lets JavaScript run outside the browser (on a server)
- **Express.js** — a framework that makes building a backend server easy
- **MySQL** — the database (stores data in tables, like Excel sheets)
- **mysql2** — the library that lets Node.js talk to MySQL
- **jsonwebtoken (JWT)** — for login sessions/security
- **bcryptjs** — for safely storing passwords
- **multer** — for handling image uploads (product photos, profile pictures)
- **cors** — allows the frontend (different port) to talk to the backend
- **dotenv** — keeps secret settings (passwords) out of the code
- **nodemailer** — sends emails (used for "Forgot Password")
- **nodemon** (dev tool) — automatically restarts the server when you edit code

### Frontend
- **React** — builds the user interface using reusable components
- **Vite** — a fast tool that runs/builds the React app
- **Redux Toolkit** — manages data that is shared across many pages (e.g., "is the user logged in?", "what's in the cart?")
- **React Router DOM** — handles page navigation without full page reloads
- **Axios** — sends requests from the browser to the backend
- **Tailwind CSS** — styles the website using small utility classes instead of writing custom CSS
- **js-cookie** — stores the login token in the browser's cookies
- **jwt-decode** — reads information out of the login token
- **SweetAlert2** — nice-looking popup alert boxes (instead of ugly browser `alert()`)
- **Recharts** — draws the charts/graphs on the Admin Dashboard
- **React Icons** — ready-made icon set (cart icon, edit icon, etc.)

---

## 4. Backend — Theory, Libraries & Why Each One Is Used

The backend lives in the `backend/` folder. Its job: receive requests from the frontend, validate them, read/write the database, and send back a response (usually as **JSON** — a simple text format for structured data, e.g. `{"name": "Shoes", "price": 500}`).

### Node.js
JavaScript was originally made to run *only inside a web browser* (to make webpages interactive). **Node.js** is a program that lets you run JavaScript *outside* the browser — on your computer, as a server. This is why we can write the whole project (frontend **and** backend) in the same language, JavaScript — a big reason it's a popular choice for beginners and for full-stack projects like this one.

### Express.js
Express is a **framework** built on top of Node.js that makes it much easier to:
- define URLs ("routes") that the frontend can call, like `/cart/add` or `/allproducts`
- read data sent by the frontend (`req.body`, `req.params`, `req.query`)
- send a response back (`res.json(...)`)

Without Express, you'd have to write a lot of complicated low-level code to do the same thing. Example from this project (`backend/routes/cartRoutes.js`):
```js
router.post('/add', protect, addToCart);
```
This one line says: *"When a POST request comes to `/cart/add`, first run the `protect` middleware (check login), then run the `addToCart` function."*

**Middleware** is simply a function that runs *before* the final handler — like a security guard checking your ID before letting you into a room. We use it for:
- `protect` — checks if the user is logged in (has a valid JWT token)
- `requireAdmin` — checks if the logged-in user's role is `admin`
- `multer` — processes an uploaded image file before the controller runs

### MySQL & mysql2
**MySQL** is a **relational database** — it stores data in **tables** (rows and columns), very similar to an Excel sheet, and tables can be linked to each other (e.g., every row in the `orders` table is linked to a row in the `users` table via a `user_id` column — this link is called a **Foreign Key**).

We chose MySQL (instead of something like MongoDB, which stores flexible "documents") because our data is naturally structured and relational: a user has many orders, an order has many order items, a product belongs to one seller. This is exactly what relational databases are built for.

`mysql2` is the Node.js library (npm package) that lets our Express backend actually send SQL commands (like `SELECT * FROM products`) to the MySQL server and get results back. We use a **connection pool** (`mysql.createPool(...)` in `db.js`) instead of a single connection — a pool keeps several ready-to-use connections open at once so multiple requests from different users can be handled at the same time without waiting in a queue.

### JWT (jsonwebtoken) — How Login Sessions Work
HTTP is "stateless" — the server doesn't naturally remember who you are between requests. So how does the site know you're logged in when you go from page to page?

**JWT (JSON Web Token)** solves this:
1. When you log in with the correct email/password, the backend creates a special signed "token" — a long string containing your user ID and role, cryptographically signed with a secret key (`JWT_SECRET` in `.env`) so it can't be faked.
2. The frontend saves this token (in a cookie, via `js-cookie`).
3. On every future request that needs login (add to cart, checkout, admin actions), the frontend attaches this token in the request header: `Authorization: Bearer <token>`.
4. The backend's `protect` middleware verifies the token's signature. If valid, it knows exactly who is making the request — without needing to look anything up in a "sessions" table.

This is why you don't get logged out every time you refresh the page — the token lives in the browser until it expires (we set it to expire after 1 day) or you log out.

### bcryptjs — Password Security
We **never** store a user's actual password in the database. If the database were ever leaked/hacked, every user's real password would be exposed. Instead, `bcryptjs` turns the password into a one-way scrambled string called a **hash** (e.g. `Admin@123` becomes something like `$2b$10$BQ.mDOWr3KUQnhDZzTWEm...`).

- `bcrypt.hashSync(password, 10)` — creates the hash when a user registers (the `10` is the "cost factor" — how many times it scrambles, making it slow/expensive to crack by brute force).
- `bcrypt.compareSync(enteredPassword, storedHash)` — during login, it re-hashes what the user typed and checks if it matches the stored hash. It's mathematically impossible to reverse a hash back into the original password, which is the whole point.

### Multer — File Uploads
Normal form data (text) is easy to send, but **files** (images) need special handling because they're binary data, not plain text. `multer` is Express middleware that intercepts an incoming file upload, saves it to a folder on the server (`backend/uploads/` for profile pictures, `backend/products/` for product images), and gives the rest of our code a simple `req.file` object with the saved filename — which we then store as a path (e.g. `/products/12345.jpg`) in the database.

### CORS
By default, browsers block a webpage from one "origin" (e.g. `localhost:5173`) from making requests to a different origin (e.g. `localhost:3000`) — this is a browser security feature called the **Same-Origin Policy**. Since our frontend and backend run on different ports, we need to explicitly tell the backend "it's okay, allow requests from the frontend." The `cors` npm package does exactly that with one line: `app.use(cors())`.

### dotenv
Our backend needs secret configuration values: the database password, the JWT secret key, email credentials. We never want to write these directly in the code (especially if the code is ever shared/uploaded publicly, e.g. to GitHub) — anyone could read the file and steal the password. `dotenv` lets us put these values in a separate `.env` file (which is excluded from Git via `.gitignore`) and load them into `process.env.VARIABLE_NAME` at runtime.

### nodemailer
Used only for the "Forgot Password" feature — it connects to a Gmail account (using an **App Password**, not your real Gmail password, for security) and sends the 6-digit verification code to the user's email.

### nodemon (development only)
Normally, if you edit a backend file, you'd have to manually stop and restart `node index.js` to see the change. `nodemon` watches your files and automatically restarts the server the instant you save a change — pure convenience during development, not used in the final production app.

---

## 5. Frontend — Theory, Libraries & Why Each One Is Used

The frontend lives in `frontend/` and is a **Single Page Application (SPA)** — the browser loads one HTML page once, and then React swaps content in and out *without* reloading the whole page, making navigation feel instant.

### React
React is a JavaScript **library** for building user interfaces out of **components** — small, reusable, self-contained pieces of UI. For example, `Products.jsx` is a single "product card" component; we reuse it to display all 26 products on the Home page just by looping over the product list and rendering `<Products product={p} />` once per product.

React tracks **state** (data that can change, like "is the modal open?") inside each component using the `useState` hook, and whenever state changes, React automatically re-renders only the parts of the screen that need to change — it doesn't repaint the whole page, which is what makes it fast.

### Vite
Vite is the build tool that takes all our `.jsx` files (which browsers can't actually run directly) and:
- During development (`npm run dev`), serves them instantly with hot-reload (edit code → browser updates in milliseconds, without losing your current page state)
- For production (`npm run build`), bundles/minifies everything into a few small optimized `.js`/`.css` files that a real web server can host

### Redux Toolkit — Global State Management
Some pieces of data are needed in *many* different components at once — e.g., "who is logged in" is needed in the Navbar (to show Login/Logout), in checkout (to pre-fill the name), and in admin route guards. Passing this data manually from component to component ("prop drilling") through many layers gets extremely messy.

**Redux** solves this by keeping a single, central "store" of shared data that *any* component can read from or write to directly, no matter how deep it is in the component tree.

In this project we have three "slices" (separate sections of the store), each in `frontend/src/redux/`:
- `authSlice.js` — the logged-in user and their token
- `cartSlice.js` — the current contents of the shopping cart
- `productsSlice.js` — the currently loaded list of products

A component reads from the store with `useSelector(state => state.auth.user)`, and updates it by `dispatch`-ing an **action** (e.g. `dispatch(setCredentials({...}))`). "Redux Toolkit" is simply the modern, simplified official way of writing Redux (it removes a lot of repetitive old-style boilerplate code that plain Redux used to require).

### React Router DOM
This library gives our SPA real, bookmarkable URLs (`/product/6`, `/cart`, `/dashboard`) while still only loading one HTML page. `<Routes>` and `<Route path="..." element={...} />` in `App.jsx` define which component shows for which URL, and `<Link to="/cart">` navigates between them instantly (no full page reload, unlike a normal `<a href>`).

We also use it for **route guards** — `AdminRoutes.jsx` wraps all admin-only pages (`/dashboard`, `/allusers`, etc.) and redirects anyone whose role isn't `admin` back to the home page.

### Axios
A library for making HTTP requests from the browser to our backend API (it does the same basic job as the browser's built-in `fetch`, but with a nicer, shorter syntax and automatic JSON conversion). Used throughout the app, e.g.:
```js
axios.post('http://localhost:3000/auth/login', { email, password })
```

### Tailwind CSS
Instead of writing separate CSS files with custom class names (`.product-card { ... }`), Tailwind gives you small, single-purpose utility classes you apply directly in your JSX, e.g. `className="flex items-center gap-2 bg-brand-600 text-white rounded-lg"`. Each word is one specific CSS rule (`flex` = `display: flex`, `bg-brand-600` = a specific background color). This makes styling much faster once you learn the class names, and keeps all the styling information visible right next to the markup instead of in a separate file.

### js-cookie & jwt-decode
- `js-cookie` — a tiny helper library to easily set/get/remove browser cookies (we store the JWT token, and small user info, in cookies so they survive a page refresh).
- `jwt-decode` — reads the information *inside* a JWT token (like the user's role) on the frontend, without needing to ask the backend again.

### SweetAlert2
Replaces the browser's ugly built-in `alert()`/`confirm()` popups with modern, styled, animated dialog boxes (`Swal.fire({...})`) — used for every success/error message and "are you sure you want to delete this?" confirmation in the app.

### Recharts
A charting library used only in the Admin Dashboard to draw the "Orders & Revenue (Last 30 Days)" line chart from the data the backend's `/dashboard/stats` endpoint provides.

### React Icons
Gives access to thousands of ready-made icon components (shopping bag, edit pencil, trash can, chevron arrows, etc.) as simple React components, e.g. `<FaBagShopping />`, so we don't need to design or import individual icon image files.

---

## 6. Database Design

The full schema (table definitions + seed data) is in **`new_ecommerce.sql`** at the project root. Run this single file once in MySQL/phpMyAdmin to create everything from scratch.

| Table | Purpose |
|---|---|
| `users` | Every account — customers and admins. Has a `role` column (`customer`/`admin`) that controls what the person can do. |
| `addresses` | Delivery addresses submitted during checkout, linked to a user. |
| `products` | Every product listing — name, price (INR), stock, category, image, `status` (`active`/`sold`/`inactive`), and which user (`seller_id`) listed it. |
| `carts` / `cart_items` | Each user has one cart (`carts`), and the cart holds multiple products with quantities (`cart_items`). |
| `orders` / `order_items` | When checkout happens, a row is created in `orders` (total, status, payment method), and one row per product is created in `order_items` (a **snapshot** of the product's name/price at the time of purchase — so if the product is later edited or deleted, the old order still shows what was actually bought). |
| `contact_messages` | Messages submitted via the "Contact Us" form, readable only by the Admin. |

Key relational design ideas used here (good viva talking points):
- **Primary Key (PK)** — a unique ID for every row (e.g. `users.id`).
- **Foreign Key (FK)** — a column in one table that points to the PK of another, creating a link (e.g. `orders.user_id` → `users.id`). This is what makes it a "relational" database.
- **ON DELETE CASCADE / SET NULL** — rules for what happens to child rows if a parent row is deleted (e.g. if a product is deleted, its old `order_items` keep the snapshot data but `product_id` becomes `NULL` instead of breaking).
- **ENUM columns** — a column restricted to a fixed list of values (e.g. `orders.status` can only ever be `pending`, `confirmed`, `shipped`, `delivered`, or `cancelled`) — this prevents invalid/typo data from ever being stored.

---

## 7. Folder Structure

```
ecommerce/
├── new_ecommerce.sql          ← run this once to set up the database
├── backend/
│   ├── index.js               ← server entry point, mounts all routes
│   ├── db.js                  ← MySQL connection pool setup
│   ├── .env                   ← secret config (DB password, JWT secret) — not committed to git
│   ├── routes/                ← defines URLs (e.g. /cart/add) and which middleware/controller handles them
│   ├── controllers/           ← the actual logic for each route
│   ├── middleware/
│   │   └── authMiddleware.js  ← protect (login check) and requireAdmin (role check)
│   ├── uploads/                ← uploaded profile pictures
│   └── products/               ← uploaded product images
└── frontend/
    ├── index.html
    ├── src/
    │   ├── App.jsx             ← all page routes defined here
    │   ├── main.jsx             ← React app entry point
    │   ├── components/          ← reusable pieces (Navbar, Footer, Logo, Products card)
    │   ├── pages/                ← one file per full page (Home, Cart, Dashboard, etc.)
    │   ├── redux/                ← global state (auth, cart, products slices)
    │   └── utils/                ← small helper functions (e.g. formatINR currency formatter)
    └── tailwind.config.js       ← Tailwind theme/colors configuration
```

---

## 8. Full Setup Guide (From Zero)

### Prerequisites — install these first
1. **Node.js** (v18 or higher) — [nodejs.org](https://nodejs.org) — this also installs `npm`
2. **MySQL Server** (via XAMPP, WAMP, or standalone MySQL + phpMyAdmin/MySQL Workbench)
3. A code editor (VS Code recommended)

### Step 1 — Set up the Database
1. Start your MySQL server.
2. Run the single file `new_ecommerce.sql` (found at the project root) using **one** of these methods:
   - **phpMyAdmin**: open it → click the **Import** tab (not the SQL query box, which can cut off long pastes) → choose `new_ecommerce.sql` → Go.
   - **MySQL CLI**:
     ```
     mysql -u root -p < new_ecommerce.sql
     ```
3. This creates a fresh `ecommerce` database with all tables and two ready-to-use accounts:
   - **Admin:** `admin@gmail.com` / `Admin@123`
   - **Customer:** `customer@gmail.com` / `Customer@123`

### Step 2 — Backend Setup
```
cd backend
npm install
```
Create a file named `.env` inside `backend/` (copy `.env.example` and fill in your real values):
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
JWT_SECRET=any_random_long_secret_string
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```
> `EMAIL_USER`/`EMAIL_PASS` are only needed for the "Forgot Password" email feature. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) — never put your real Gmail login password here.

Start the backend:
```
npm run start
```
You should see:
```
Server running on port 3000
MySQL Connected
```

### Step 3 — Frontend Setup
In a **new terminal**:
```
cd frontend
npm install
npm run dev
```
Open the URL it prints (usually `http://localhost:5173`) in your browser.

### Step 4 — Try it out
- Log in as Admin (`admin@gmail.com` / `Admin@123`) to see the Dashboard, manage Products/Users/Orders.
- Log in as Customer (`customer@gmail.com` / `Customer@123`) to shop, add to cart, and checkout.

---

## 9. All Features in the Website

**Customer-facing:**
- Register / Login / Logout / Forgot Password (email verification code)
- Browse products with pagination, search (by name/category/description), category filter, price range filter
- Product detail page with quantity stepper, "already in cart" indicator
- Add to cart / update quantity / remove item / clear cart (with real-time stock checks)
- Checkout — enter delivery address, Cash on Delivery, place order
- Order history — view all past orders and their status
- Edit own profile (name, email, password, profile picture)
- List your own product for sale ("Add Product" — any logged-in user can be a seller)
- Contact Us form (stored in the database for Admin to read)

**Admin-only:**
- Dashboard — total users, products, orders, revenue, and a 30-day sales chart
- Manage Users — create, edit (including profile picture), delete, change role
- Manage Products — edit any field, mark Sold/Active (blocked from reactivating with 0 stock), delete
- Manage Orders — grouped by customer, change order status (cancelling automatically restores stock)
- Read Contact Us messages, mark as read, delete

**Security features built in:**
- Passwords hashed with bcrypt, never stored in plain text
- JWT-based authentication on every protected route
- Role-based authorization (`protect` + `requireAdmin` middleware) — e.g. only an Admin can delete a user or change an order's status
- All currency displayed in proper Indian Rupee (₹) formatting via `Intl.NumberFormat`

---

## 10. API Routes Summary

| Method | Route | Who can call it | What it does |
|---|---|---|---|
| POST | `/auth/register` | anyone | Create a new account |
| POST | `/auth/login` | anyone | Log in, get a JWT token |
| POST | `/sendcode`, `/resetpassword` | anyone | Forgot password flow |
| GET | `/allproducts`, `/filter-products` | anyone | Browse/search products |
| GET | `/product/:id` | anyone | View one product |
| POST | `/addproduct` | logged in | List a new product |
| PUT | `/updateproduct/:id` | Admin only | Edit a product / change status |
| DELETE | `/product/:id` | Admin only | Delete a product |
| GET/POST/PUT/DELETE | `/cart/*` | logged in | Manage your own cart |
| POST | `/orders/checkout` | logged in | Place an order |
| GET | `/orders/my` | logged in | Your own order history |
| GET | `/orders/` | Admin only | All orders, every customer |
| PUT | `/orders/:id/status` | Admin only | Update an order's status |
| GET | `/dashboard/stats` | Admin only | Analytics numbers for the dashboard |
| GET/POST/PUT/DELETE | `/getalluser`, `/createuser`, `/updateuser/:id`, `/deleteuser/:id` | Admin only | Manage users |
| POST | `/contact-messages` | anyone | Submit a Contact Us message |
| GET/PUT/DELETE | `/contact-messages/*` | Admin only | Read/manage messages |

---

## 11. 3-Month Week-by-Week Development Journey

Use this as your project diary / progress report. It tells the story of how a working e-commerce site is realistically built, stage by stage — from nothing, to a finished, secure, polished application.

### Month 1 — Foundations & Core Backend

**Week 1 — Planning & Environment Setup**
Decided on the project idea (an e-commerce site), chose the tech stack (MERN-style but with MySQL instead of MongoDB, since the data is clearly relational — users, products, orders are all linked to each other). Installed Node.js, MySQL, VS Code. Designed the initial database schema on paper (users and products tables) before writing any code — planning the data model first avoids painful restructuring later.

**Week 2 — Backend Skeleton**
Set up a basic Express server (`index.js`), connected it to MySQL using `mysql2`, and built the first simple route: fetching all products. Learned the basic request/response cycle and how `.env`/`dotenv` keep secrets out of code.

**Week 3 — Authentication**
Implemented user registration and login: `bcryptjs` to hash passwords, `jsonwebtoken` to issue a token on successful login. Learned why plain-text passwords are a serious security risk and how JWTs let the backend "remember" a logged-in user without a traditional server-side session.

**Week 4 — Product CRUD & Image Uploads**
Built full product management: add, edit, delete, list products. Integrated `multer` to handle image uploads for product photos, storing them on disk and saving just the file path in MySQL (storing actual image binaries directly in a database is inefficient — this is the standard real-world approach).

### Month 2 — Frontend & Core Shopping Flow

**Week 5 — React Frontend Setup**
Set up the React project with Vite, planned the page structure, and installed Tailwind CSS for styling. Built the Navbar and Home page, and connected them to the backend's product API using Axios for the first time — the first real end-to-end request from browser → server → database → back to browser.

**Week 6 — State Management & Routing**
Introduced Redux Toolkit to manage login state and the product list globally, and React Router DOM to create real pages (Home, Product detail, Login/Signup) without full page reloads. Learned the difference between local component state (`useState`) and shared global state (Redux).

**Week 7 — Cart & Checkout**
Designed and built the `carts`/`cart_items`/`orders`/`order_items` database tables. Implemented add-to-cart, update quantity, remove item, and a full checkout flow that validates stock, creates an order, and decreases product stock — the most logically complex part of the whole project, since multiple database writes need to stay consistent.

**Week 8 — Order History & Role-Based Access**
Built the customer's "My Orders" page and introduced the concept of **roles** (`customer` vs `admin`) in the users table, plus backend middleware (`protect`, `requireAdmin`) to lock down sensitive actions so a regular customer can never call an admin-only API, even if they tried to guess the URL.

### Month 3 — Admin Tools, Polish & Deployment Readiness

**Week 9 — Admin Dashboard & Analytics**
Built the admin-only Dashboard page with real aggregated statistics (total users/products/orders/revenue) pulled via SQL `COUNT`/`SUM` queries, and a 30-day sales chart using Recharts — learned basic SQL aggregation and date grouping.

**Week 10 — Full Admin Management Tools**
Completed Admin capability to manage Users (create/edit/delete/change role) and Orders (view all orders grouped by customer, update status, with automatic stock-restoration logic when an order is cancelled) — this required careful handling of "what happens to related data when something changes" (e.g. restoring stock, but only once, even if an order is cancelled twice).

**Week 11 — UI/UX Redesign & Currency Localization**
Switched the entire site's currency display to Indian Rupees (₹) using `Intl.NumberFormat`, redesigned the whole visual theme (new color palette, new logo, consistent card/button styling, hover and loading animations) to make the project look professional and polished rather than a bare-bones prototype — a strong presentation matters for marks, not just working code.

**Week 12 — Testing, Security Hardening & Documentation**
Went through the whole site end-to-end testing every flow (signup, login, cart, checkout, admin actions) to catch and fix bugs, removed hardcoded/leftover credentials and secured the `.env` file properly, added search and filtering with pagination, added a Contact Us system, and wrote this complete documentation (README) explaining every design decision for the final submission and viva.

---

## 12. What to Tell Your Reviewer / Viva Preparation

### "Explain your project in one line."
*"ShopEase is a full-stack e-commerce web application where customers can browse and purchase products online, and an admin can manage the entire store — products, users, and orders — through a secure dashboard."*

### "What is the architecture of your project?"
*"It follows a classic three-tier architecture: a React frontend for the user interface, a Node.js/Express backend that exposes a REST API, and a MySQL relational database. The frontend and backend communicate over HTTP using JSON, and the backend is the only part allowed to talk directly to the database — this separation means the frontend never has direct access to sensitive data or credentials."*

### "Why MySQL and not MongoDB?"
*"My data is naturally relational — a user has many orders, an order has many items, a product belongs to a seller. MySQL's foreign keys let the database itself enforce these relationships and prevent invalid data (e.g. an order pointing to a user that doesn't exist), which is harder to guarantee in a document database like MongoDB."*

### "How do you keep the website secure?"
*"Three main layers: passwords are hashed with bcrypt so even I, as the developer, can never see a user's real password; every sensitive action requires a valid JWT token proving who you are; and role-based middleware (`protect` + `requireAdmin`) ensures only an admin account can reach admin-only operations, checked on the server — never trusting the frontend alone, since a user could bypass frontend restrictions by calling the API directly."*

### "What was the hardest part?"
*"Checkout, because it has to do several database operations that all must succeed together: validating current stock, creating the order record, creating each order-item record, decreasing stock, and clearing the cart — if any step were to fail partway, the data could become inconsistent (e.g. stock reduced but no order created). I handled this by checking each step's result before proceeding to the next."*

### "What would you improve if you had more time?"
*"Add real online payment gateway integration (Razorpay/Stripe) instead of only Cash on Delivery, add product reviews/ratings, add email notifications when an order's status changes, and move from storing uploaded images on the local disk to a cloud storage service so it can be deployed to a real production server."*

### "Did you use AI tools while building this?"
Be honest if asked — many reviewers today expect candidates to have used AI coding assistants as a *tool*, the same way developers use Google/StackOverflow/documentation. What matters for your marks is that **you understand what the code does and why** — which is exactly why this README explains the reasoning behind every technology choice. Be ready to explain any piece of code if asked to open a file and walk through it.

---

## 13. Future Scope

- Online payment gateway integration (Razorpay/Stripe/UPI)
- Product reviews and star ratings
- Email/SMS notifications on order status changes
- Wishlist feature
- Multi-image gallery per product
- Deployment to a live server (e.g. Render/Railway for backend, Vercel/Netlify for frontend, with cloud image storage like Cloudinary)
- Admin analytics expansion (top-selling products, customer retention charts)
