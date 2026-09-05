CREATE EXTENSION IF NOT EXISTS pgcrypto;
/*
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS users_in_events;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS slots;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
*/

CREATE TABLE IF NOT EXISTS organizations (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, 
    password_hash TEXT NOT NULL,
    authorization_level INTEGER NOT NULL DEFAULT 0,
    organization_id UUID NOT NULL 
    REFERENCES organizations(organization_id)
    ON DELETE CASCADE,

    CONSTRAINT unique_username_per_org
        UNIQUE (name, organization_id)
);
/*
DO $$
BEGIN
    IF to_regclass('public.temp_users') IS NOT NULL THEN
        EXECUTE '
            INSERT INTO users (user_id, name, password_hash, organization_id, authorization_level)
            SELECT user_id, name, password_hash, organization_id, authorization_level
            FROM temp_users
            ON CONFLICT DO NOTHING';
        EXECUTE 'DROP TABLE temp_users';
    END IF;
END $$;
*/
CREATE TABLE IF NOT EXISTS events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL 
    REFERENCES organizations(organization_id)
    ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL 
    REFERENCES events(event_id)
    ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL 
    REFERENCES slots(slot_id)
    ON DELETE CASCADE,
    location_info TEXT NOT NULL,
    general_info TEXT NOT NULL,
    module_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID NOT NULL 
    REFERENCES users(user_id)
    ON DELETE CASCADE,
    module_id UUID NOT NULL 
    REFERENCES modules(module_id)
    ON DELETE CASCADE,
    preference_value INTEGER NOT NULL,

    CONSTRAINT unique_user_module_combo
        UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS users_in_events (
    event_id UUID NOT NULL 
    REFERENCES events(event_id)
    ON DELETE CASCADE,
    user_id UUID NOT NULL 
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    CONSTRAINT unique_user_event_combo
        UNIQUE (user_id, event_id)
);



INSERT INTO organizations (organization_name) VALUES ('TestOrganization');