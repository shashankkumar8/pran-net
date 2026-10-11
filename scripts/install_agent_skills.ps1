$ErrorActionPreference = 'Stop'

# Run from the SchoolAir Ledger repository root.
# The skill installer may ask interactive questions; review each prompt.
$skills = @(
  @{ Repo = 'https://github.com/astrolicious/agent-skills'; Name = 'astro' },
  @{ Repo = 'https://github.com/vercel-labs/agent-skills'; Name = 'web-design-guidelines' },
  @{ Repo = 'https://github.com/anthropics/skills'; Name = 'frontend-design' },
  @{ Repo = 'https://github.com/langgenius/dify'; Name = 'backend-code-review' }
)

foreach ($skill in $skills) {
  Write-Host "`nInstalling skill: $($skill.Name)" -ForegroundColor Cyan
  & npx skills add $skill.Repo --skill $skill.Name
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Installation failed for $($skill.Name). Review the error, then retry that command manually. Continuing with the remaining skills."
  }
}

Write-Host "`nReview docs/AGENT_SKILLS.md and inspect installed SKILL.md files before using them." -ForegroundColor Green
