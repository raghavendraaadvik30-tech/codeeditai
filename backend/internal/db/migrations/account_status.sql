CREATE TABLE account_status (

    id SERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    status SMALLINT NOT NULL
        CHECK (status IN (0, 1)),
        -- 1 = Active
        -- 0 = Inactive

    reason VARCHAR(255) NOT NULL,

    deactivated_by UUID,

    action_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_account_status_user
        FOREIGN KEY (user_id)
        REFERENCES user_login(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_account_status_admin
        FOREIGN KEY (deactivated_by)
        REFERENCES user_login(user_id)
        ON DELETE SET NULL
);
