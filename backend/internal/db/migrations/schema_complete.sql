-- =========================================================================
-- COMPLETE AUTHENTICATION & MULTI-TENANT WORKSPACE DATABASE SCHEMA
-- =========================================================================

-- 1. Branches Table
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

-------------------------------------------------------------------------
-- 2. Sub-Branches Table
CREATE TABLE IF NOT EXISTS sub_branches (
    sub_branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    branch_id UUID NOT NULL,

    sub_branch TEXT,

    workspace_code VARCHAR(25),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_branch_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_sub_branch_name
        UNIQUE (branch_id, sub_branch),

    CONSTRAINT uq_sub_branch_code
        UNIQUE (branch_id, workspace_code)
);

-------------------------------------------------------------------------------------
-- 3. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_name VARCHAR(150) NOT NULL UNIQUE,
    workspace_code VARCHAR(50) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-------------------------------------------------------------------------------------
-- 4. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_name VARCHAR(50) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------------------------------
-- 5. User Login (Authentication Credentials) Table
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

----------------------------------------------------------------
-- 6. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    role_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES user_login(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

----------------------------------------------------------------------------------
-- 7. User Profiles Table
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

--------------------------------------------------------------------------------------
-- 8. Added Users (Admin Assignment Audit) Table
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

-----------------------------------------------------------------------------------
-- 9. User Workspace Mapping Table
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
