#!/bin/bash
set -e

echo "=================================================="
echo "GITHUB ACTIONS DIAGNOSTIC RETRIEVAL SCRIPT"
echo "=================================================="

# 1. Verify gh auth status
echo "Checking GitHub CLI authentication status..."
if ! gh auth status; then
  echo "ERROR: GitHub CLI is not authenticated in your terminal. Please run 'gh auth login' first."
  exit 1
fi

# 2. Automatically identify the repository
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithPath')
echo "Detected Repository: $REPO"

# 3. Find latest runs
echo "Retrieving recent workflow runs..."
RUNS=$(gh run list --limit 20 --json databaseId,status,conclusion,headBranch,headSha,event,title)

echo ""
echo "=== Recent Runs ==="
echo "$RUNS" | jq -r '.[] | "ID: \(.databaseId) | Branch: \(.headBranch) | Conclusion: \(.conclusion) | Commit: \(.title)"'
echo ""

# 4. Automatically identify the newest run containing target tests/failing run
RUN_ID=$(echo "$RUNS" | jq -r '.[] | select(.conclusion=="failure" or .status=="in_progress" or .conclusion=="cancelled") | .databaseId' | head -n 1)

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  RUN_ID=$(echo "$RUNS" | jq -r '.[0].databaseId')
fi

echo "Targeting Run ID: $RUN_ID"
echo "--------------------------------------------------"
gh run view "$RUN_ID"
echo "--------------------------------------------------"

# 5. Download complete logs
echo "Downloading complete raw logs..."
gh run view "$RUN_ID" --log > ./gha-auth-diagnostics.log
echo "Logs saved to ./gha-auth-diagnostics.log ($(du -sh ./gha-auth-diagnostics.log | cut -f1))"

# 6. Download artifacts
echo "Downloading available artifacts..."
rm -rf ./gha-artifacts/
mkdir -p ./gha-artifacts/
if gh run download "$RUN_ID" -D ./gha-artifacts/; then
  echo "Artifacts downloaded to ./gha-artifacts/"
  echo "=== Artifact Files ==="
  find ./gha-artifacts -type f | sort
else
  echo "No artifacts found/downloaded."
fi

# 7. Generate report
REPORT_FILE="./gha-auth-diagnostic-report.txt"
echo "Generating diagnostic report in $REPORT_FILE..."

{
  echo "=== CI AUTHENTICATION DIAGNOSTIC REPORT ==="
  echo "Run ID: $RUN_ID"
  echo "Timestamp: $(date)"
  echo ""
  
  echo "--- URL ---"
  grep -ni "URL:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- Cookies ---"
  grep -ni -C 10 "Cookies:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- LocalStorage ---"
  grep -ni -C 5 "LocalStorage:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- SessionStorage ---"
  grep -ni -C 5 "SessionStorage:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- authenticated-user count ---"
  grep -ni "authenticated-user count:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- authenticated-user DOM count ---"
  grep -ni "authenticated-user DOM count:" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- Browser Consoles / Errors / Request Failures ---"
  grep -ni -E "\[Browser Console\]|\[Browser Error\]|\[Request Failed\]|\[HTTP" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- API Endpoints Activity ---"
  grep -ni -C 5 -E "/api/v1/auth/register|/api/v1/auth/me" ./gha-auth-diagnostics.log || echo "NOT OBSERVED"
  echo ""

  echo "--- WebServer / Prisma / Database / CORS ---"
  grep -ni -C 5 -E "\[WebServer\]|Request ID|Prisma|Database|PostgreSQL|CORS" ./gha-auth-diagnostics.log | head -n 100 || echo "NOT OBSERVED"
  echo ""
} > "$REPORT_FILE"

echo "Report generated successfully!"
echo "Inspect it using: cat ./gha-auth-diagnostic-report.txt"
echo "=================================================="
