CREATE TABLE IF NOT EXISTS branches (
    branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    country VARCHAR(100) NOT NULL,

    city VARCHAR(50) NOT NULL,

    state_province_region VARCHAR(150),

    branch_code VARCHAR(25) UNIQUE,

    branch_name VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_branch_location
        UNIQUE (country, city, branch_name)
);
