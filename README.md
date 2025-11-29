# 🔐 DataGuard – Secure Data Masking & Anonymization Platform

DataGuard is a secure, full-stack data anonymization system designed to process sensitive datasets (PII/PHI) using modern privacy-preserving techniques.  
Built for the **Secure Software Design (SSD)** course, the system incorporates **secure coding**, **RBAC**, **audit trails**, **SAST**, and **privacy engineering**.

---

# 🚀 Features

### 🔐 Authentication & Role-Based Access Control
- JWT authentication  
- Roles: **Admin, Analyst, Compliance Officer**  
- Signup → Pending Approval → Admin assigns role  
- Dynamic dashboard based on user role  

### 📂 Dataset Management
- Upload CSV/JSON files  
- Server-side encryption at rest (AES-256)  
- View dataset metadata  

### 🔍 Automatic PII Detection
- Email, phone, address, DOB, name, etc.  
- Confidence scores  
- Manual override support  

### 🛡 Masking & Anonymization Engine
Supports advanced masking techniques:
- Pseudonymization  
- Generalization (low/medium/high)  
- Suppression  
- Tokenization  
- **k-anonymity**, **l-diversity**, **Differential Privacy (ε)**  
- Preview masked dataset  
- Download encrypted masked dataset  

### 📜 Policy Framework
- Create custom policies  
- Built-in templates: **GDPR** and **HIPAA**  
- Policy versioning (history tracking)  
- Attach policies to datasets  

### ⚙️ Job Processing
- Run anonymization jobs  
- Live status polling  
- Masking preview (first 10 rows)  

### 📝 Audit Logging
- Logs every action: auth, uploads, classification, policy creation, masking jobs, downloads  
- Hash-chained, tamper-evident logs  
- Filter, search, export CSV/PDF  
- Only Admin + Compliance can view  

### 📊 Dashboard
- Dataset count  
- Jobs count  
- Recent logs  
- Recent masking jobs  
- Role-aware UI  

### 📈 Privacy–Utility Tradeoff
- Privacy ↔ Utility slider  
- Real-time computation of privacy score, risk, and information loss  

### 📝 Compliance Reporting
- GDPR Report  
- HIPAA Report  
- PIA (Privacy Impact Assessment)  
- PDF export  

### 🔒 Security
- AES-256 encrypted file storage  
- Bcrypt password hashing  
- Zod input validation  
- Rate limiting  
- Sanitized file paths (Semgrep fixes)  
- SAST integrated (Semgrep CI)  

---

# 🛠 Tech Stack

### Frontend
- React + Vite  
- TailwindCSS  
- Axios  
- Radix UI  
- React Router  
- Toastify  
- AuthContext (global state)  

### Backend
- Node.js + Express  
- MongoDB + Mongoose  
- Multer for file upload  
- AES encryption utilities  
- Zod validation  
- Semgrep SAST  
- Role-based middleware  

---

# 📁 Project Structure

```
dataGuard/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   ├── uploads/ (encrypted)
│   └── .env  (ignored)
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── .env (ignored)
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repo
```bash
git clone https://github.com/tehreemcodes/dataGuard
cd dataGuard
```

---

## 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env`:

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_64byte_secret
REFRESH_TOKEN_SECRET=your_64byte_secret
FILE_KEY=your_32byte_hex_key
PORT=5000
```

Start backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

---

# 🧪 Usage Workflow

1. User signs up → **Pending**  
2. Admin approves → assign **role**  
3. Analyst uploads dataset  
4. System auto-detects PII → classification page  
5. Create policy (manual / GDPR / HIPAA template)  
6. Redirect to anonymization job page  
7. Run job → view results → download masked file  
8. Admin/Compliance view **audit logs**  
9. Generate GDPR / HIPAA / PIA reports  

---

# 🔎 Security & SAST

- Zod schema validation on all inputs  
- Multer file validation  
- Rate limiting  
- Sanitized file paths  
- Secrets removed from Git history  
- `.env` ignored  
- Semgrep CI integration  
- Fixes applied for path traversal risks  

---

# 🧩 SAST CI Pipeline

Runs automatically on every push using GitHub Actions:

- Semgrep (27839 rules)  
- ESLint security plugin  
- npm audit  
- Dependabot alerts  

Findings available here:

🔗 https://semgrep.dev/orgs/tehreem-zafar/findings  


# 📄 License
Project is for academic use under SSD Course.  
Not intended for production deployment.
