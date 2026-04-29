# Vault - Anonymous Reviews on EigenCompute TEE

**Speak freely. Stay hidden.**

Vault is a truly anonymous feedback and review platform that runs inside a Trusted Execution Environment (TEE) on [EigenCompute](https://eigencloud.xyz). Unlike traditional "anonymous" platforms where you trust the operator not to log your identity, Vault provides cryptographic guarantees — even the server administrators cannot link submissions to users.

![Vault Screenshot](https://img.shields.io/badge/Status-Live-emerald?style=for-the-badge)
![TEE](https://img.shields.io/badge/TEE-SEV--SNP-cyan?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)

## Live Demo

- **App**: http://34.12.126.114:3000
- **TEE Attestation**: [Verify on EigenCloud](https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd)

---

## Why Vault?

### The Problem with "Anonymous" Platforms

Most anonymous feedback tools rely on trust:
- They promise not to log your IP address
- They claim not to track sessions or cookies
- They say they don't correlate submissions with identities

But you have no way to verify these claims. The server operator could be logging everything.

### The TEE Solution

Vault runs inside a **Trusted Execution Environment** — a hardware-isolated enclave that:

1. **Encrypts memory**: Even the host OS cannot read the application's memory
2. **Provides attestation**: Cryptographic proof that the code running is exactly what was deployed
3. **Seals secrets**: Encryption keys are bound to the TEE and inaccessible outside it
4. **Zero metadata**: No IP logging, no cookies, no session tracking — enforced by hardware

This isn't "we promise not to look" — it's "we mathematically cannot look."

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                    (No cookies, no tracking)                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EigenCompute TEE Instance                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    SEV-SNP Secure Enclave                 │  │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐   │  │
│  │  │   Next.js App   │───▶│   SQLite Database           │   │  │
│  │  │   (Port 3000)   │    │   /app/data/reviews.db      │   │  │
│  │  └─────────────────┘    └─────────────────────────────┘   │  │
│  │           │                                               │  │
│  │           ▼                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              KMS Client (Attestation)               │  │  │
│  │  │         /usr/local/bin/kms-client                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Memory encrypted by AMD SEV-SNP hardware                       │
│  Attestation verifiable at verify-sepolia.eigencloud.xyz        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack React framework with API routes |
| **SQLite** | Lightweight embedded database for reviews |
| **SEV-SNP** | AMD's Secure Encrypted Virtualization with Secure Nested Paging |
| **KMS Client** | Handles TEE attestation and secret management |
| **EigenCompute** | TEE-as-a-service infrastructure by EigenLayer |

---

## App Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Vault UI   │     │   TEE API    │
│   Browser    │     │  (React)     │     │  (Next.js)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  1. Visit site     │                    │
       │───────────────────▶│                    │
       │                    │                    │
       │  2. Render form    │                    │
       │◀───────────────────│                    │
       │                    │                    │
       │  3. Type review    │                    │
       │───────────────────▶│                    │
       │                    │                    │
       │  4. Click "Drop it"│                    │
       │───────────────────▶│                    │
       │                    │  5. POST /api/reviews
       │                    │───────────────────▶│
       │                    │                    │
       │                    │                    │ 6. Generate UUID
       │                    │                    │    (no user data)
       │                    │                    │
       │                    │                    │ 7. Insert to SQLite
       │                    │                    │    (content + timestamp only)
       │                    │                    │
       │                    │  8. Return success │
       │                    │◀───────────────────│
       │                    │                    │
       │  9. Show success   │                    │
       │◀───────────────────│                    │
       │                    │                    │
       │  10. View "The Wall"                    │
       │───────────────────▶│                    │
       │                    │  11. GET /api/reviews
       │                    │───────────────────▶│
       │                    │                    │
       │                    │  12. Return reviews│
       │                    │◀───────────────────│
       │                    │                    │
       │  13. Display reviews                    │
       │◀───────────────────│                    │
       │                    │                    │
```

### What Gets Stored

| Field | Stored | Notes |
|-------|--------|-------|
| Review content | Yes | The actual feedback text |
| Timestamp | Yes | When the review was submitted |
| UUID | Yes | Random identifier, not linked to user |
| IP Address | **No** | Never logged or stored |
| User Agent | **No** | Never logged or stored |
| Cookies | **No** | None set or read |
| Session | **No** | Stateless requests only |

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/zeeshan8281/eigenreview.git
cd eigenreview

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
npm start
```

---

## Deploy to EigenCompute

### Prerequisites

1. Install the EigenCompute CLI (v0.4.3+):
   ```bash
   npm install -g @layr-labs/ecloud-cli@latest
   ```

2. Authenticate:
   ```bash
   ecloud auth login
   ```

3. Subscribe to billing:
   ```bash
   ecloud billing subscribe
   ```

4. Get Sepolia ETH for gas fees:
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - https://sepoliafaucet.com/

### Deploy

```bash
# Build Docker image
docker build --platform linux/amd64 -t YOUR_DOCKERHUB/eigenreview:latest .

# Push to registry
docker push YOUR_DOCKERHUB/eigenreview:latest

# Deploy to EigenCompute
# (Remove Dockerfile first to avoid interactive prompts)
mv Dockerfile Dockerfile.bak
touch .env

ecloud compute app deploy \
  --name eigenreview \
  --image-ref YOUR_DOCKERHUB/eigenreview:latest \
  --skip-profile \
  --env-file .env \
  --instance-type g1-custom-2-4096s \
  --log-visibility public \
  --resource-usage-monitoring enable \
  --force

# Restore Dockerfile
mv Dockerfile.bak Dockerfile
```

### Instance Types

| Type | vCPUs | Memory | TEE | Cost/hr |
|------|-------|--------|-----|---------|
| g1-micro-1v | 2 shared | 1 GB | Shielded VM | ~$0.03 |
| g1-medium-1v | 2 shared | 4 GB | Shielded VM | ~$0.04 |
| g1-custom-2-4096s | 2 | 4 GB | SEV-SNP | ~$0.07 |
| g1-standard-2s | 2 | 8 GB | SEV-SNP | ~$0.12 |
| g1-standard-4t | 4 | 16 GB | TDX | ~$0.33 |

We recommend `g1-custom-2-4096s` for a balance of cost and reliability.

### Upgrade Existing Deployment

```bash
# Build and push new image
docker build --platform linux/amd64 -t YOUR_DOCKERHUB/eigenreview:latest .
docker push YOUR_DOCKERHUB/eigenreview:latest

# Upgrade
ecloud compute app upgrade YOUR_APP_ID \
  --image-ref YOUR_DOCKERHUB/eigenreview:latest \
  --env-file .env \
  --instance-type g1-custom-2-4096s \
  --log-visibility public \
  --resource-usage-monitoring enable \
  --force
```

---

## Project Structure

```
eigenreview/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── reviews/
│   │   │       └── route.ts    # API endpoints (GET/POST reviews)
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main UI component
│   └── lib/
│       └── db.ts               # SQLite database operations
├── public/                     # Static assets
├── Dockerfile                  # Production Docker build
├── next.config.ts              # Next.js configuration
├── package.json
└── README.md
```

---

## Security Model

### Threat Model

| Threat | Mitigated? | How |
|--------|------------|-----|
| Server admin logs IPs | Yes | TEE prevents host access to application memory |
| Database leak exposes users | Yes | No user identifiers stored |
| Network sniffing | Yes | HTTPS encryption |
| Malicious code injection | Yes | TEE attestation proves code integrity |
| Memory dump attack | Yes | SEV-SNP encrypts all memory |

### What TEE Does NOT Protect Against

- **Content analysis**: If you write "I'm John from Engineering", that's in the review
- **Timing attacks**: Submission times are recorded
- **Application bugs**: Code vulnerabilities are still exploitable (but auditable)

### Verify the TEE

Anyone can verify that Vault is running in a genuine TEE:

1. Visit the [attestation page](https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd)
2. Check the TEE type (SEV-SNP)
3. Verify the code hash matches this repository

---

## API Reference

### GET /api/reviews

Returns all approved reviews.

**Response:**
```json
{
  "reviews": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Great team culture!",
      "created_at": 1714380000000,
      "status": "approved"
    }
  ]
}
```

### POST /api/reviews

Submit an anonymous review.

**Request:**
```json
{
  "content": "Your anonymous feedback here"
}
```

**Response:**
```json
{
  "review": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Your anonymous feedback here",
    "created_at": 1714380000000,
    "status": "approved"
  }
}
```

**Constraints:**
- Content max length: 500 characters
- Content min length: 1 character (after trimming)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: better-sqlite3
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 20 (Alpine)
- **TEE**: AMD SEV-SNP via EigenCompute
- **Container**: Docker (linux/amd64)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT

---

## Acknowledgments

- [EigenLayer](https://eigenlayer.xyz) for EigenCompute infrastructure
- [AMD](https://amd.com) for SEV-SNP technology
- The cypherpunk community for inspiration

---

**Built with privacy in mind. Verified by hardware.**
