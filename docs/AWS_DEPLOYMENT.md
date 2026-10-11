# PRAN-NET — AWS Deployment Guide & Runbook

**Audience:** Cloud Engineers, DevOps Reviewers, Hackathon Evaluators  
**Target AWS Profile:** `schoolair-dev`  
**Deployment Toolchain:** AWS SAM CLI / AWS CloudFormation  
**Runtime:** Python 3.12 (Lambda), Node 20.x (Frontend build)

---

## 1. Prerequisites Checklist

Before deploying the PRAN-NET backend to AWS, verify the following local and cloud prerequisites:

1. **AWS CLI:** Version 2.x recommended (or 1.46+).
2. **AWS SAM CLI:** Required for `sam build` and `sam deploy`.  
   *(Install via Windows winget: `winget install Amazon.SAMCLI`, or download the official MSI installer).*
3. **AWS Account Access:** An active AWS IAM Identity Center (SSO) account with administrative or scoped deployment permissions (CloudFormation, Lambda, API Gateway, DynamoDB, SNS, EventBridge, IAM).
4. **Target Region:** Choose an AWS region with full serverless feature parity (recommended: `ap-south-1` [Mumbai] for low-latency India access, or `us-east-1` [N. Virginia]).

---

## 2. AWS SSO Profile Configuration

Configure the `schoolair-dev` profile to link to your AWS IAM Identity Center portal:

```powershell
aws configure sso --profile schoolair-dev
```

When prompted:
- **SSO start URL:** `https://<your-sso-directory>.awsapps.com/start`
- **SSO Region:** Target SSO region (e.g. `ap-south-1` or `us-east-1`)
- **AWS Account ID:** Select your development account
- **Role Name:** Select your developer/administrator role
- **CLI default client Region:** `ap-south-1`
- **CLI default output format:** `json`

Authenticate in the browser when prompted, then verify your identity:

```powershell
aws sts get-caller-identity --profile schoolair-dev
```

Expected output:
```json
{
    "UserId": "AROA...:user@example.com",
    "Account": "123456789012",
    "Arn": "arn:aws:sts::123456789012:assumed-role/.../user@example.com"
}
```

---

## 3. Secret Parameters Setup (SSM Parameter Store)

Before deploying the CloudFormation stack, create the required parameters in AWS Systems Manager (SSM) Parameter Store in your chosen region.

### A. Coordinator Authorization Token (Mandatory)
Protects write access to the `/actions` ledger endpoint:
```powershell
aws ssm put-parameter `
  --name "/schoolair/coordinator-token" `
  --value "YOUR_CHOSEN_SECURE_TOKEN" `
  --type "SecureString" `
  --profile schoolair-dev
```

### B. CPCB Data.gov.in API Key (Optional)
Required only if `DataSourceMode=live` is enabled for direct CPCB station ingestion:
```powershell
aws ssm put-parameter `
  --name "/schoolair/datagov-key" `
  --value "YOUR_DATA_GOV_IN_API_KEY" `
  --type "SecureString" `
  --profile schoolair-dev
```

---

## 4. SAM Validation & Build

Navigate to the `backend` directory:

```powershell
cd c:\Users\LENOVO\Downloads\PRAN_NET_Final_Project_Source_Package\PRAN_NET_Antigravity_Polish_Pack\schoolair-ledger\backend
```

### Validate Template Syntax:
```powershell
sam validate --lint
```

### Build Serverless Artifacts:
```powershell
sam build
```
*This command bundles Python dependencies, builds the Lambda functions in `.aws-sam/build`, and prepares CloudFormation templates.*

---

## 5. Deployment Commands

Execute guided deployment to provision the CloudFormation stack:

```powershell
sam deploy --guided --profile schoolair-dev
```

Prompts & Recommended Responses:
- **Stack Name:** `pran-net-backend`
- **AWS Region:** `ap-south-1` (or your chosen region)
- **Parameter DataSourceMode:** `sample` *(use `sample` for demo; change to `live` only with valid CPCB key)*
- **Parameter AllowedOrigin:** `http://localhost:5173` *(or your production frontend URL)*
- **Parameter SchoolId:** `delhi-central`
- **Parameter SchoolName:** `Delhi Central Environmental Zone`
- **Parameter AlertEmail:** `your-email@example.com` *(receives severe escalation notifications)*
- **Confirm changes before deploy:** `Y`
- **Allow SAM CLI IAM role creation:** `Y`
- **Disable rollback:** `N`
- **Save arguments to configuration file (samconfig.toml):** `Y`

Once deployed, SAM outputs the public API endpoint:
```text
CloudFormation outputs from deployed stack
-----------------------------------------------------------------------------
Outputs
-----------------------------------------------------------------------------
Key                 ApiUrl
Description         -
Value               https://abc123xyz.execute-api.ap-south-1.amazonaws.com
-----------------------------------------------------------------------------
```

---

## 6. Post-Deployment Verification & Smoke Tests

Replace `<API_URL>` with your actual deployed API endpoint.

### 1. Public Health Check
```powershell
curl -i https://<API_URL>/health
```
*Expect: HTTP 200 `{"ok": true, "rules_version": "0.3.0", "data_source_mode": "sample"}`.*

### 2. Live Telemetry Proxy
```powershell
curl -i "https://<API_URL>/telemetry/live?lat=28.6139&lon=77.2090"
```
*Expect: HTTP 200 with Copernicus CAMS air quality and ECMWF weather telemetry.*

### 3. Unauthenticated Ledger Rejection
```powershell
curl -i https://<API_URL>/actions
```
*Expect: HTTP 401 Unauthorized `{"error": "Valid coordinator token required."}`.*

### 4. Authenticated Ledger Write
```powershell
curl -i -X POST https://<API_URL>/actions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_CHOSEN_SECURE_TOKEN" `
  -H "idempotency-key: smoke-test-1" `
  -d '{"activity":"sports","decision":"followed","action_taken":"Moved sports drills indoors","note":"Smoke test verified"}'
```
*Expect: HTTP 201 Created with a returned UUID `action_id`.*

### 5. Idempotent Duplicate Replay
Re-run the exact command above with `idempotency-key: smoke-test-1`.  
*Expect: HTTP 200 OK with `"duplicate": true` and the matching `action_id`.*

### 6. SNS Email Subscription Confirmation
Check the inbox of the email entered in `AlertEmail` and click **"Confirm subscription"** in the AWS email.

---

## 7. Connecting Frontend to Cloud Backend

To point your local or hosted frontend to the live AWS API:

1. In `frontend/`:
   ```powershell
   cd ..\frontend
   echo "VITE_API_URL=https://<API_URL>" > .env.production
   npm run build
   ```
2. For local testing against the deployed cloud API:
   ```powershell
   echo "VITE_API_URL=https://<API_URL>" > .env.local
   npm run dev
   ```

---

## 8. Cost Management & Stack Teardown

### Idle Cost: **$0.00 / month**
- DynamoDB uses on-demand billing (`PAY_PER_REQUEST`).
- Lambda and API Gateway operate within standard AWS Free Tier allowances.
- SNS charges only for messages exceeding 1,000 notifications/month.

### Safe Cloud Teardown
To remove all AWS resources and prevent recurring charges:
```powershell
sam delete --stack-name pran-net-backend --profile schoolair-dev
```
*Note: Because `LedgerTable` has `DeletionPolicy: Retain`, the audit ledger table will remain in DynamoDB to protect historical records. Delete it manually from the DynamoDB console if you wish to wipe all data.*
