#!/bin/bash
NAME=$1

if [ -z "$NAME" ]; then
  echo "Usage: ./scripts/new-orm.sh <module-name>"
  exit 1
fi

DIR="src/backend/db/$NAME"
mkdir -p "$DIR"

cat > "$DIR/sql.ts" << 'EOF'
export const GET_BY_ID = `
  SELECT * FROM TABLENAME WHERE id = $1
`;
EOF

cat > "$DIR/index.ts" << 'EOF'
import db from "../connection";
import * as sql from "./sql";

// Add your typed query functions here
EOF

echo "Created $DIR with index.ts and sql.ts"
