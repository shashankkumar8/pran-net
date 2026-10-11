# PRAN-NET — Security Architecture & Threat Model

**System:** PRAN-NET (Pran Operational Mitigation Network)  
**Security Posture:** Defense-in-Depth, Least-Privilege IAM, Parameterized Secrets, Zero PII Collection  
**Classification:** Operational Decision Support & Immutable Audit Logging

---

## 1. Authentication & Authorization Model

### A. Dual-Header Authentication
All mutating routes (`POST /actions`) and sensitive operational metrics (`GET /actions`, `GET /metrics`) require authenticated coordinator authorization. The application supports two standard HTTP header formats:
1. `x-coordinator-token: <TOKEN>` (Custom API header)
2. `Authorization: Bearer <TOKEN>` (RFC 6750 Standard Bearer token)

Unauthenticated requests or requests with invalid tokens are immediately rejected with **HTTP 401 Unauthorized**.

### B. Timing-Safe Token Verification
Tokens are verified against server-side configuration using `hmac.compare_digest` in `backend/common.py`:
```python
def coordinator_token_ok(supplied):
    name = cfg("COORDINATOR_TOKEN_PARAMETER")
    if not name or not supplied:
        return False
    if name not in _token_cache:
        try:
            _token_cache[name] = boto3.client("ssm").get_parameter(
                Name=name, WithDecryption=True
            )["Parameter"]["Value"]
        except Exception:
            return False
    return hmac.compare_digest(supplied.encode(), _token_cache[name].encode())
```
This prevents timing-attack side channels that could reveal token characters based on comparison latency.

---

## 2. Secrets Management & Zero-Leakage Architecture

### A. Parameterized Server-Side Secret Storage
- **No Hardcoded Credentials:** Zero API keys, passwords, private keys, or tokens are stored in the codebase, Git history, or container images.
- **AWS SSM Parameter Store:** Sensitive parameters are stored as encrypted `SecureString` values in AWS Systems Manager (SSM) Parameter Store:
  - `/schoolair/coordinator-token`: Protects ledger access.
  - `/schoolair/datagov-key`: Protects upstream CPCB data extraction.
- **Frontend Isolation:** The frontend only consumes public endpoints and configuration through `VITE_API_URL`. No AWS credentials or upstream API keys ever touch client-side bundles or `import.meta.env`.

### B. Verification & Scanning
Automated regex pattern scans over all Git-tracked source files verify:
- 0 AWS Access Keys (`AKIA...`).
- 0 AWS Secret Keys.
- 0 Private Keys (`-----BEGIN RSA PRIVATE KEY-----`).
- Only `frontend/.env.example` is tracked; no production `.env` files are committed.

---

## 3. Data Integrity & Input Sanitization

### A. Transactional Idempotency Enforcement
To prevent network retries from creating duplicate actions or double-counting interventions, write operations enforce client-provided idempotency keys:
- The client passes a unique `idempotency-key` header (max 200 characters).
- The backend writes an idempotency claim (`IDEM#{school_id}#{idempotency_key}`) transactionally alongside the action record using DynamoDB `TransactWriteItems`.
- If the claim already exists, DynamoDB cancels the transaction, and the backend safely returns the existing record with `"duplicate": true`.

### B. Strict Input Validation & Length Limits
All payloads undergo strict boundary validation before processing:
- `activity`: Must exist within the audited `ACTIVITIES` enumeration (`outdoor_assembly`, `sports`, `routine_outdoor`, `indoor_class`).
- `decision`: Must exist within the audited `DECISIONS` enumeration (`followed`, `modified`, `overridden`, `reviewed`).
- `action_taken`: Must be a non-empty string capped at 120 characters.
- `note`: Must be text capped at 500 characters.
- **Audited Overrides:** Overriding an advisory requires an explicit, audited explanation of at least 10 characters. Empty or trivial reasons (`"no"`) are rejected with **HTTP 400 Bad Request**.

---

## 4. Least-Privilege IAM Policies

Each Lambda function has tightly scoped IAM permissions defined in `backend/template.yaml`:

1. **`ApiFunction`:**
   - `DynamoDBReadPolicy` on `ObservationsTable`.
   - Explicit append-only permissions on `LedgerTable`: `PutItem`, `GetItem`, `Query`, `TransactWriteItems`.
   - **Explicitly omitted:** `UpdateItem` and `DeleteItem` on historical action records, guaranteeing an append-only audit trail.
   - `ssm:GetParameter` scoped strictly to `arn:aws:ssm:...:parameter${CoordinatorTokenParameter}`.
2. **`IngestFunction`:**
   - `PutItem` and `BatchWriteItem` on `ObservationsTable`.
   - `ssm:GetParameter` scoped strictly to `arn:aws:ssm:...:parameter${DataGovKeyParameter}`.
3. **`EscalateFunction`:**
   - Read on `ObservationsTable`.
   - Update permission on `LedgerTable` scoped to setting notification timestamps (`notified_at`).
   - `sns:Publish` scoped strictly to `AlertTopic`.

---

## 5. Network & Edge Protections

- **API Gateway Throttling:** `ThrottlingBurstLimit: 20`, `ThrottlingRateLimit: 10` requests/second per client IP to mitigate denial-of-service (DoS) and abusive automated traffic.
- **CORS Restrictions:** `SchoolAirApi` restricts origins to `AllowedOrigin` (defaults to the deployed frontend domain). Allowed headers are explicitly declared (`content-type, x-coordinator-token, idempotency-key, authorization`). Wildcard origins (`*`) are disallowed in production deployments.
- **Data Retention & Privacy:**
  - Automated DynamoDB Time-to-Live (TTL) deletes raw station observations after `expires_at`.
  - Zero Personal Identifiable Information (PII) is captured, stored, or processed.

---

## 6. Known Limitations & Threat Residuals

1. **Station vs. Personal Exposure:** Station-level observations represent ambient regional air quality within an atmospheric grid cell; they do not measure individual micro-environmental or indoor personal exposure.
2. **Single Coordinator Shared Token:** The current demonstration architecture uses an SSM-managed shared secret token for coordinator authorization. Future production iterations should integrate Amazon Cognito User Pools or OIDC/OAuth 2.0 with JSON Web Tokens (JWT) for individual role-based access control (RBAC).
3. **Upstream Network Failures:** If Open-Meteo or CPCB APIs experience upstream outages, the system fails closed and falls back to cached or sample data with clear user notifications, avoiding false live claims.
