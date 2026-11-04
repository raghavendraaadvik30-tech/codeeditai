CREATE TABLE IF NOT EXISTS user_workspace (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES user_login(user_id)
        ON DELETE RESTRICT,

    sub_branch_id UUID NOT NULL
        REFERENCES sub_branches(sub_branch_id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_workspace
        UNIQUE (user_id, sub_branch_id)
);
