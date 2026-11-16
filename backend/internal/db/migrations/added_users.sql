CREATE TABLE IF NOT EXISTS added_users (
    added_user_id BIGSERIAL PRIMARY KEY,

    admin_user_id UUID NOT NULL
        REFERENCES user_login(user_id)
        ON DELETE RESTRICT,

    user_id UUID NOT NULL
        REFERENCES user_login(user_id)
        ON DELETE RESTRICT,

    full_name VARCHAR(100),

    sub_branch_id UUID NOT NULL
        REFERENCES sub_branches(sub_branch_id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_added_users_user UNIQUE (user_id),

    CONSTRAINT chk_admin_not_same_user
        CHECK (admin_user_id <> user_id)
);
