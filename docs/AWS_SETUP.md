# AWS setup and credentials (Windows / PowerShell)

This guide separates three different credentials that must never be confused:

1. **AWS CLI identity** — lets your local terminal deploy AWS resources.
2. **data.gov.in API key** — lets the Lambda ingestion function request the upstream dataset.
3. **SchoolAir coordinator token** — authorizes protected demo ledger/metrics API requests.

The data.gov.in key and coordinator token are application secrets, not AWS CLI credentials. Never put either in a `VITE_*` variable, React code, GitHub, a screenshot, or a public issue.

## 1. Create and secure an AWS account

- Use an AWS account you control and enable MFA on the root user.
- Do not create access keys for the root user.
- Check the account's billing page and set a budget/billing alert before deploying. Serverless services can still incur charges.
- Choose one AWS region and use it consistently for the stack, SSM parameters, logs, and deployment.
- Prefer IAM Identity Center/SSO with a least-privilege permission set. If you are in an organization, ask its administrator to provision access rather than creating broad credentials yourself.

Official AWS references:
- AWS CLI credential options: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html
- IAM Identity Center CLI setup: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
- SAM prerequisites: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html
- SAM CLI installation: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

## 2. Install and verify tools

Install the AWS CLI v2 and AWS SAM CLI using the official installers linked above. Install a supported Python version, Node.js LTS, npm, and Git. Docker Desktop may be needed for some SAM local build/test workflows; follow the current SAM documentation for your environment.

Open a **new PowerShell** window and verify:

```powershell
aws --version
sam --version
python --version
node --version
npm --version
git --version
```

If a command is not found, finish its installation and open a new terminal before continuing.

## 3. Preferred authentication: AWS IAM Identity Center (SSO)

Use this when your AWS account has IAM Identity Center enabled and your user has been granted a deployment-capable permission set.

```powershell
aws configure sso
```

Follow the browser/login prompts. Choose the correct account, role/permission set, default region, and a profile name such as `schoolair-dev`.

Then sign in and verify the active identity:

```powershell
aws sso login --profile schoolair-dev
aws sts get-caller-identity --profile schoolair-dev
aws configure get region --profile schoolair-dev
```

The identity returned must be the AWS account you intend to use. Do not paste the output's account details publicly.

For subsequent commands, either add `--profile schoolair-dev` or set the profile for the current PowerShell session:

```powershell
$env:AWS_PROFILE = 'schoolair-dev'
$env:AWS_REGION = 'ap-south-1' # example only; use your selected region
aws sts get-caller-identity
```

The region above is an example. Choose your region deliberately and keep it consistent.

### If SSO is unavailable

Ask your AWS administrator for an approved short-lived role/session or another organization-approved credential method. `aws configure` with long-lived IAM access keys is a fallback, not the preferred approach. Never use root access keys, commit credentials, send keys to a coding assistant, or paste secrets into chat.

## 4. Get a data.gov.in key and verify the source

Obtain the API key from the official data.gov.in account/API workflow. Identify the actual CPCB/AQI resource ID and inspect its real response before enabling live mode.

From the repository root, set temporary environment variables in the current PowerShell session (do not put the key in a file):

```powershell
$env:DATA_GOV_KEY = Read-Host 'Paste data.gov.in API key (input is visible)'
$env:DATA_GOV_RESOURCE_ID = Read-Host 'Enter verified resource ID'
python .\scripts\probe_datagovin.py
```

Because PowerShell's normal `Read-Host` displays typed input, avoid doing this in a screen share or recorded terminal. For a more private entry, use a secure prompt and carefully convert the SecureString to a temporary plaintext value only in memory. Never echo it or save it to disk. The probe must verify the response schema; if the source cannot be verified, keep sample mode explicitly labelled and do not claim live ingestion.

## 5. Create application secrets in SSM Parameter Store

Use the same AWS profile and region that will deploy the SAM stack. The template defaults to these parameter names:

- `/schoolair/coordinator-token` — SecureString
- `/schoolair/datagov-key` — SecureString

Generate a unique, high-entropy coordinator token in a password manager or with a cryptographically secure generator. Do not use example strings such as `admin-secret-token-2026`.

The AWS CLI accepts the value as a command-line argument, which may be visible to local process inspection. On a shared machine, prefer a trusted secrets workflow or a small local script that prompts securely, does not log values, and never saves them. Never commit such a script with a secret inside it.

For a private, local terminal on a trusted machine, you can use PowerShell variables (the variable values themselves are not written to your shell history when the assignment is interactive):

```powershell
$coordinatorToken = Read-Host 'Enter newly generated coordinator token'
$dataGovKey = Read-Host 'Enter data.gov.in API key'

aws ssm put-parameter --name '/schoolair/coordinator-token' --type SecureString --value $coordinatorToken --overwrite
aws ssm put-parameter --name '/schoolair/datagov-key' --type SecureString --value $dataGovKey --overwrite

Remove-Variable coordinatorToken, dataGovKey
```

Note: `Read-Host` input is visible as you type. Do not run this during screen sharing/recording. Use a secure prompt implementation if you need masked input. Also, passing values as CLI arguments can expose them briefly to local process inspection; for sensitive environments use an approved secrets-management workflow.

Verify only parameter metadata, not the secret values:

```powershell
aws ssm describe-parameters --parameter-filters 'Key=Name,Option=BeginsWith,Values=/schoolair/' --query 'Parameters[].{Name:Name,Type:Type,LastModifiedDate:LastModifiedDate}'
```

The deploying identity needs permission to create/update these parameters. The Lambda execution roles should have only the `ssm:GetParameter` permissions required by their specific parameter paths. Do not give the application broad SSM access.

## 6. Run checks before deployment

From the project root:

```powershell
Set-Location .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
python -m pytest -q
sam validate
sam build
```

Run `cfn-lint` if installed. Review the template and every deployment parameter before deploying. Mocked tests and template validation do not prove real AWS permissions, source availability, or SNS delivery.

## 7. Deploy backend with SAM

From `backend/`, use the profile and region you verified above:

```powershell
sam deploy --guided --profile schoolair-dev --region ap-south-1
```

Replace the profile/region with your actual values. Use the correct parameter names displayed by the template and guided prompts. Review the CloudFormation change set and requested IAM capabilities before approving. Do not blindly accept resource replacement or deletion.

Record the actual API URL and table names from the successful stack outputs. Never invent them. Configure `AllowedOrigin` to the exact Amplify HTTPS origin after the frontend exists, then redeploy the backend with the corrected origin if needed.

## 8. Deploy the frontend

In `frontend/`, create a local `.env` file from `.env.example` and set only public configuration, for example:

```dotenv
VITE_API_URL=https://YOUR_REAL_API_ID.execute-api.YOUR_REAL_REGION.amazonaws.com
```

Do **not** add `VITE_COORDINATOR_TOKEN`, the data.gov.in key, AWS access keys, or any private credential to this file. `VITE_*` values are bundled into the public client.

Build locally:

```powershell
Set-Location ..\frontend
npm ci
npm run build
```

Deploy the frontend through AWS Amplify Hosting or another approved static host. Configure the same public API URL in the hosting build environment. The coordinator token should be entered at runtime in the password field and sent only to protected API routes over HTTPS; it must not be baked into the build. This shared-token approach is demo-grade, not a production identity system.

After obtaining the real frontend URL, redeploy/update the API's CORS allow-origin setting to that exact origin. Test in the browser, not only via local build.

## 9. End-to-end verification checklist

- [ ] `aws sts get-caller-identity` returns the intended account.
- [ ] SAM stack is deployed in the intended region.
- [ ] Health/API endpoints return expected results.
- [ ] Live data mode is only enabled after source/schema verification.
- [ ] Sample and cached data are labelled and never passed off as live.
- [ ] Freshness and station disagreement behave as documented.
- [ ] Authenticated ledger write succeeds.
- [ ] Refreshing the UI shows the persisted action and evidence snapshot.
- [ ] Duplicate idempotency submission does not create a second action.
- [ ] Missing/wrong token is rejected.
- [ ] Cross-school history is not exposed.
- [ ] CORS only allows the intended frontend origin.
- [ ] SNS subscription is confirmed and a real test email is received.
- [ ] CloudWatch logs contain no secrets.
- [ ] Budget/cost alerts are active.

## 10. Cleanup and costs

Before teardown, preserve any records you need for the submission. Inspect the stack resources and retention policies before deletion. The action ledger may be retained by design; verify the actual template before assuming `sam delete` removes every table. Delete unused resources and test stacks carefully, and verify the billing page after the event.
