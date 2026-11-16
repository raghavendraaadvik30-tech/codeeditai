-- super_admin initialization & permissions
-- Ensures roles 'super_admin' and 'admin' are available

INSERT INTO roles (role_name)
SELECT 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) = 'super_admin');

INSERT INTO roles (role_name)
SELECT 'admin'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) = 'admin');

INSERT INTO roles (role_name)
SELECT 'author'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) = 'author');

INSERT INTO roles (role_name)
SELECT 'reviewer'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE LOWER(role_name) = 'reviewer');
