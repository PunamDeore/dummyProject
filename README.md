# ShopScope — E-Commerce Platform with AI Shopping Assistant

ShopScope is a full-stack e-commerce web platform integrating a Spring Boot backend and a modern React frontend. It includes catalog exploration, user authentication, persistent cart and wishlist workflows, mock checkout, real-time product updates via WebSockets, and an intelligent shopping agent powered by Spring AI and Ollama Cloud.

---

## Features

### 🛒 Storefront & Shopping Workflow

* **Product Catalog**: Paginated catalog with filtering by category, search queries, and sorting options (price, rating).


* **Cart & Wishlist State Management**: Dual client-side Redux/Zustand storage paired with persistent backend REST endpoints.


* **Real-Time Catalog Sync**: STOMP over native WebSockets (`/topic/products`) propagates catalog mutations (`CREATED`, `UPDATED`, `DELETED`) across active client windows instantly.


* **Checkout & Orders**: Multi-step checkout simulation with order tracking, historical logs, and status filtering (`PLACED` vs `FAILED`).



### 🤖 AI Shopping Assistant (Ollama Cloud + Spring AI)

* **Natural Language Shopping**: Interactive chat drawer widget connected to an LLM running via Ollama Cloud’s OpenAI-compatible completions API.


* **Session Continuity**: Multi-turn dialogue history tracking isolated per conversation session.


* **Dynamic Timezone Greet**: Automated contextual greeting detection adjusted for the user's local timezone via request headers (`X-Time-Zone`).


* **Model Function Calling / Tool Execution**:
* `getAvailableCategories`: Fetches live categories from the database.


* `getProductsByCategory`: Retrieves matching inventory with plural/singular query handling.


* `addToCart`: Matches user product intent and emits a sync tag to update the client's cart state immediately.


* `placeOrder`: Directly creates orders for confirmed cart lines or specific products with delivery estimates.




* **Automated Client UI Navigation**: Prompts the frontend to automatically close the chat drawer and route directly to the `/account/checkout` window.



### 🔐 Security & Identity

* **JWT Authentication**: Stateless authentication using Access and Refresh tokens with automated silent re-authentication on 401 interceptors.


* **Role-Based Access Control**: Strict access separation between standard customers and `ROLE_ADMIN` users (e.g., adding/editing/deleting products and viewing team directories).



---

## Tech Stack

### Frontend

* **Framework**: React 18 with TypeScript and Vite


* **Routing**: React Router (Data API loaders, actions, middleware)


* **State Management**: Redux Toolkit & Zustand


* **UI & Styling**: React Bootstrap, Bootstrap 5, Bootstrap Icons


* **Validation**: React Hook Form, Zod


* **Networking**: Axios (with custom logging, retry, and token-refresh interceptors) and `@stomp/stompjs`


### Backend

* **Framework**: Spring Boot 3.2.5 (Java 21)


* **AI Integration**: Spring AI (`spring-ai-openai-spring-boot-starter` M6) via Ollama Cloud


* **Database & Persistence**: PostgreSQL, Spring Data JPA, Hibernate


* **Security**: Spring Security 6, JJWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`)


* **Real-Time Communication**: Spring WebSocket & STOMP messaging broker


* **Build Tool**: Gradle 8.8



---

## Project Structure

```text
ShopScope/
├── src/                               # Spring Boot Backend
│   ├── main/
│   │   ├── java/com/ShopScope/ShopScope/
│   │   │   ├── ai/                    # Spring AI ChatClient, Service, & Assistant Tools
│   │   │   ├── auth/                  # Authentication Controller & JWT Services
│   │   │   ├── Cart/                  # Shopping Cart Entities, Repositories, & Endpoints
│   │   │   ├── config/                # Security, Web, WebSocket, & SSL Configurations
│   │   │   ├── Order/                 # Order Management & Checkout Services
│   │   │   ├── Products/              # Product Domain & Realtime Publishing
│   │   │   └── user/                  # User Management & Role Authorization
│   │   └── resources/
│   │       └── application.properties # Spring, Database, & Ollama Cloud Settings
│   └── test/
frontend/                              # React Frontend
├── src/
│   ├── api/                           # Axios Client, Interceptors, & Stomp Client
│   ├── components/                    # UI Components (CartDrawer, ChatAgentWidget, etc.)
│   ├── hooks/                         # Debounce & Product Filter URL Hooks
│   ├── lib/                           # TokenStore, ApiError, & Validations
│   ├── routes/                        # Page Routes, Loaders, Actions, & Middleware
│   ├── store/                         # Redux Slices (Cart, Wishlist) & Zustand Stores
│   ├── types/                         # Shared TypeScript Interfaces & DTOs
│   ├── main.tsx
│   └── router.tsx
├── package.json
└── vite.config.ts

```

---

## Getting Started

### Prerequisites

* **Java 21** or later


* **Node.js 18+** and **npm**
* **PostgreSQL** running locally on port `5432` with a database named `shopscopedb`


---

### Backend Configuration

1. **Verify Database Configuration**:
Ensure PostgreSQL is running and update credentials in `src/main/resources/application.properties` if necessary:


```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shopscopedb
spring.datasource.username=postgres
spring.datasource.password=root

```


2. **Configure Ollama Cloud Integration**:
In `src/main/resources/application.properties`, configure the Ollama Cloud endpoint and model:


```properties
# Ollama Cloud OpenAI-Compatible API
spring.ai.openai.base-url=https://ollama.com
spring.ai.openai.api-key=YOUR_OLLAMA_API_KEY
spring.ai.openai.chat.options.model=gemma4:31b
spring.ai.openai.chat.options.temperature=0.4

```


3. **Run the Spring Boot Application**:
Using the Gradle wrapper:


```bash
# Unix/macOS
./gradlew clean bootRun

# Windows
gradlew.bat clean bootRun

```


The backend will start at `http://localhost:8080`.

---

### Frontend Setup

1. **Install Dependencies**:
From the frontend application root directory:
```bash
npm install

```


2. **Start the Development Server**:
```bash
npm run dev

```


The application will become available at `http://localhost:5173`.

---

## Testing the AI Assistant

1. Click the floating chat bubble in the bottom right corner of the storefront.


2. **Search**: Enter `"laptop"` or `"furniture"` — the assistant searches catalog items using function calling.


3. **Add to Cart**: Type `"add to cart"` or reference the item title (e.g., `"Annibale Colombo"`) — the assistant calls `addToCart`, updates the Redux store instantly, and increments the navbar cart count.


4. **Checkout**: Type `"checkout"` or `"proceed to checkout"` — the assistant confirms the transaction and opens `/account/checkout`.



---

## 🚀 Future Implementations: Role-Based Capabilities (Admin & Moderator)

To evolve ShopScope into a production-grade multi-vendor or enterprise retail platform, the role hierarchy will expand with dedicated permissions and tailored dashboards for `ROLE_ADMIN` and `ROLE_MODERATOR`.

### 🛡️ Role Hierarchy & Permission Matrix

| Feature / Domain | Customer (`user`) | Content Moderator (`moderator`) | System Administrator (`admin`) |
| --- | --- | --- | --- |
| **Browse, Cart & Checkout** | ✅ | ✅ | ✅ |
| **Product Reviews & Ratings** | Create / Edit Own | Moderate / Flag / Delete | Full Oversight |
| **Catalog Management (CRUD)** | ❌ | Review & Approve Drafts | Direct Publish, Edit, Delete |
| **Inventory & Flash Deals** | ❌ | View Only | Adjust Stock, Price, Discounts |
| **Order Dispute & Returns** | Initiate Return | Process Return / Issue Store Credit | Full Refund, Manual Override |
| **User Moderation (Bans/Flags)** | ❌ | Timeout / Suspend Accounts | Terminate / Promote Roles |
| **Analytics & Financial Reports** | ❌ | View Content Quality Stats | Revenue, Sales, Inventory Trends |
| **System Settings & Audit Logs** | ❌ | ❌ | Full Access |

---

### 1. 🛠️ Moderator Role (`ROLE_MODERATOR`) Roadmap

The **Moderator** role focuses on **community trust, content quality, and post-purchase customer resolution** without direct write access to global financials or system-level configuration.

#### A. User-Generated Content (UGC) Moderation

* **Customer Reviews & Q&A Workflow**:
* Moderator queue for new product reviews, images, and user comments before publishing.
* Ability to mask offensive keywords, flag bot activity, and reject spam submissions.
* Verified Purchase badging control.


* **Product Listing Validation (Multi-Vendor Staging)**:
* If third-party sellers submit products, moderators review descriptions, compliance, image guidelines, and category taxonomies before items go live.



#### B. Dispute & Returns Processing Desk

* **Return Merchandise Authorization (RMA)**:
* Dedicated screen to inspect return/refund requests (`PLACED` vs `RETURN_REQUESTED`).
* Authority to approve returns, verify customer-provided return tracking numbers, and credit customer wallets/accounts.


* **Support Chat Oversight**:
* Ability to step in and take over ongoing chats between customers and the AI Assistant when sentiment is flagged as negative or an escalation is triggered.



#### C. Trust & Fraud Prevention

* **Customer Account Flagging**:
* Ability to place abusive or fraud-flagged accounts into temporary read-only/shadow-ban mode.
* Review flagged transactions with repeated card failures.



---

### 2. ⚡ Admin Role (`ROLE_ADMIN`) Roadmap

The **Administrator** holds full control over business operations, catalog financials, marketing configurations, and user identity management.

#### A. Advanced Inventory, Pricing & Promotions Engine

* **Batch Inventory & Price Overrides**:
* Bulk CSV/Excel product imports and updates.
* Low-stock threshold alerts with automated supplier reorder triggers.
* Tiered discounts, coupon promo code management, and scheduled flash sales (start/end timestamp with automatic revert).


* **Dynamic Catalog Taxonomies**:
* Full CRUD operations on categories, subcategories, custom attributes (e.g., size, color, technical specs), and brand profiles.



#### B. Analytics & Executive Dashboard

* **Financial Performance Metrics**:
* Live charts showing Gross Merchandise Value (GMV), Average Order Value (AOV), conversion rates, and cart abandonment stats.


* **Inventory Turnaround & Product Demand**:
* Identification of dead stock vs best-selling products.
* AI Assistant inquiry insights (e.g., top searched terms that returned 0 results).



#### C. Order Operations & Logistics Management

* **Order Fulfillment Lifecycle**:
* Transitions beyond `PLACED` and `FAILED`: `CONFIRMED` ➔ `PACKED` ➔ `SHIPPED` (with tracking URL) ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` ➔ `CANCELLED`.
* Manual payment re-verification and gateway refund processing.



#### D. Security, Access Control & Audit Trails

* **User Role Management**:
* UI to invite, grant, or revoke `moderator` or `admin` privileges.


* **System Audit Logging**:
* Immutable log capturing who changed prices, deleted products, processed refunds, or changed user permissions (with timestamp and IP/correlation ID).



---

### 3. 🏗️ Planned Architecture & Code Updates

#### Backend (Spring Boot 3 + Spring Security)

1. **Method-Level Security Annotations**:
Enable `@EnableMethodSecurity` to replace bulky route matching with granular controllers:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
@GetMapping("/api/moderation/reviews/pending")
public ResponseEntity<List<Review>> getPendingReviews() { ... }

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/api/promotions/flash-sale")
public ResponseEntity<Promotion> createFlashSale(@RequestBody FlashSaleRequest request) { ... }

```


2. **Event-Driven WebSocket Notifications**:
Broadcast instant administrative notifications over STOMP:
* `/topic/admin/disputes` when an order dispute is filed.
* `/topic/admin/stock-alerts` when stock drops below threshold.



#### Frontend (React + React Router)

1. **Role-Gated Route Subtrees**:
Expand `routes/middleware.ts` to support distinct sub-layouts:
* `/moderation/*` guarded with `requireRole('moderator', 'admin')`.
* `/admin/analytics/*` and `/admin/system/*` strictly guarded with `requireRole('admin')`.


2. **Dedicated Operational Consoles**:
* Split navigation in `SiteHeader` into customer view and a "Staff Portal" switch for admins/moderators.
* Moderator Inbox UI featuring quick batch approve/reject actions with keyboard shortcuts.
