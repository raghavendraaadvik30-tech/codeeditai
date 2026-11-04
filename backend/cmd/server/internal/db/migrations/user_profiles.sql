CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_login(user_id) ON DELETE CASCADE,

    full_name VARCHAR(100) NOT NULL,

    contact_number VARCHAR(20) NOT NULL,

    sub_branch_id UUID NOT NULL
        REFERENCES sub_branches(sub_branch_id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
