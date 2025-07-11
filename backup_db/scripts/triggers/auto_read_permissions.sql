-- Copyright (c) 2025 Karlsruhe Institute of Technology - Scientific Centre for Computing
-- This code is distributed under the Apache 2.0 License
-- Please, see the LICENSE file
--
-- SQL Query to assign read permissions to the user "mlflowAgent-read-all" for experiments and registered models
--
-- @author: lisanaberberi
-- @date: 2025-07-11

-- Auto Read Permissions Setup for MLflow
-- This script creates triggers to automatically grant read permissions to 'mlflowAgent-read-all' user
-- for all new experiments and registered models

-- First, ensure the read-all user exists
INSERT OR IGNORE INTO experiment_permissions (experiment_id, user_id, permission)
SELECT DISTINCT
    ep.experiment_id,
    u.id as user_id,
    'READ' as permission
FROM experiment_permissions ep
CROSS JOIN users u
WHERE u.username = 'mlflowAgent-read-all'
AND NOT EXISTS (
    SELECT 1 
    FROM experiment_permissions ep2 
    WHERE ep2.experiment_id = ep.experiment_id 
    AND ep2.user_id = u.id
);

-- Grant read permissions to existing registered models
INSERT OR IGNORE INTO registered_model_permissions (name, user_id, permission)
SELECT DISTINCT
    rmp.name,
    u.id as user_id,
    'READ' as permission
FROM registered_model_permissions rmp
CROSS JOIN users u
WHERE u.username = 'mlflowAgent-read-all'
AND NOT EXISTS (
    SELECT 1 
    FROM registered_model_permissions rmp2 
    WHERE rmp2.name = rmp.name 
    AND rmp2.user_id = u.id
);

-- Create the trigger for new experiments
CREATE TRIGGER IF NOT EXISTS add_read_permission_new_experiment
AFTER INSERT ON experiment_permissions
WHEN NOT EXISTS (
    SELECT 1 FROM experiment_permissions
    WHERE experiment_id = NEW.experiment_id
    AND user_id = (SELECT id FROM users WHERE username = 'mlflowAgent-read-all')
)
BEGIN
    INSERT INTO experiment_permissions (experiment_id, user_id, permission)
    VALUES (
        NEW.experiment_id,
        (SELECT id FROM users WHERE username = 'mlflowAgent-read-all'),
        'READ'
    );
END;

-- Create the trigger for new registered models
CREATE TRIGGER IF NOT EXISTS add_read_permission_new_model
AFTER INSERT ON registered_model_permissions
WHEN NOT EXISTS (
    SELECT 1 FROM registered_model_permissions
    WHERE name = NEW.name
    AND user_id = (SELECT id FROM users WHERE username = 'mlflowAgent-read-all')
)
BEGIN
    INSERT INTO registered_model_permissions (name, user_id, permission)
    VALUES (
        NEW.name,
        (SELECT id FROM users WHERE username = 'mlflowAgent-read-all'),
        'READ'
    );
END;
