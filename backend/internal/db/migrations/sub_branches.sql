CREATE TABLE IF NOT EXISTS sub_branches (
    sub_branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    branch_id UUID NOT NULL,

    workspace_id UUID,

    workspace_name VARCHAR(150),

    sub_branch TEXT,

    workspace_code VARCHAR(25),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_branch_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_sub_branch_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(workspace_id)
        ON DELETE SET NULL,

    CONSTRAINT uq_sub_branch_name
        UNIQUE (branch_id, sub_branch),

    CONSTRAINT uq_sub_branch_code
        UNIQUE (branch_id, workspace_code)
);

ALTER TABLE sub_branches ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(workspace_id) ON DELETE SET NULL;
ALTER TABLE sub_branches ADD COLUMN IF NOT EXISTS workspace_name VARCHAR(150);
