# Vault

Anonymous feedback tool powered by EigenCompute TEE (Trusted Execution Environment).

## Features

- Anonymous review submission (no identity collected)
- TEE-signed reviews with verifiable signatures
- Privacy protections:
  - Timestamps coarsened to hour precision
  - Random submission delays (1-5s) to break timing correlation
  - Global rate limiting (not per-IP)
  - No IP logging in application layer
- Dark mode support

## Live Deployments

- **Vercel (Frontend):** https://eigen-anon-review.vercel.app
- **EigenCompute (TEE Backend):** http://34.67.91.214:3000
- **Verification Dashboard:** https://verify-sepolia.eigencloud.xyz/app/0xc286bE71ce983ec0F674b641e71f2F92C256aeb6

## Tech Stack

- Next.js 16
- @layr-labs/eigen-design component library
- EigenCompute TEE with AMD SEV-SNP
- viem for wallet signing
- better-sqlite3 for local storage

## How It Works

1. User submits anonymous feedback
2. Review is processed inside TEE (Trusted Execution Environment)
3. Content is hashed and signed with TEE-derived wallet
4. Signature can be verified on EigenCompute dashboard

## Development

```bash
npm install
npm run dev
```

## Deployment

### Vercel
```bash
vercel --prod
```

### EigenCompute
```bash
docker build --platform linux/amd64 -t your-registry/image:tag .
docker push your-registry/image:tag
ecloud compute app deploy --image-ref your-registry/image:tag
```

## License

MIT
