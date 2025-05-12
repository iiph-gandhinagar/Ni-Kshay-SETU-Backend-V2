#!/bin/sh
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

BRANCH_NAME=$(git symbolic-ref --short HEAD)
CONVENTIONAL_REGEX='^((feat|fix|docs|style|refactor|perf|test|chore)\(.+\))|(\w+/\w+)$'

if ! echo "$BRANCH_NAME" | grep -qE "$CONVENTIONAL_REGEX"; then
    echo -e "
    ${RED}❌ Branch name '$BRANCH_NAME' does not follow conventional naming conventions.${NC}

    ${YELLOW}Branch names should be in one of the following formats:${NC}
    1. <type>(<scope>): <subject> (e.g., 'feat(auth): add login feature')
    2. <type>/<scope> (e.g., 'feature/auth', 'bugfix/auth')

    ${YELLOW}Types:${NC}
    - feat: A new feature
    - fix: A bug fix
    - docs: Documentation changes
    - style: Code style changes (formatting, missing semi colons, etc)
    - refactor: Code changes that neither fix a bug nor add a feature
    - perf: Performance improvements
    - test: Adding or correcting tests
    - chore: Other changes that don't modify src or test files

    ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
    " >&2
    exit 1
else
    echo -e "${GREEN}✅ Branch name '$BRANCH_NAME' is correctly named.${NC}"
fi
