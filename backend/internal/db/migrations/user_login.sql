CREATE TABLE IF NOT EXISTS user_login (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sub_branch_id UUID NOT NULL
        REFERENCES sub_branches(sub_branch_id)
        ON DELETE RESTRICT,

    email VARCHAR(100) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    is_active SMALLINT NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
