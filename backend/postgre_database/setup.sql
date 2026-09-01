CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    authorization_level INTEGER DEFAULT 0,
    organization_id UUID NOT NULL REFERENCES organizations(organization_id),

    CONSTRAINT unique_username_per_org
        UNIQUE (name, organization_id)
);

CREATE TABLE IF NOT EXISTS events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(organization_id),
    event_name TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES slots(slot_id),
    location_info TEXT NOT NULL,
    general_info TEXT NOT NULL,
    module_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS temp_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(organization_id),
    authorization_level INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID NOT NULL REFERENCES users(user_id),
    module_id UUID NOT NULL REFERENCES modules(module_id),
    preference_value INTEGER NOT NULL,

    CONSTRAINT unique_user_module_combo
        UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS users_in_events (
    event_id UUID NOT NULL REFERENCES events(event_id),
    user_id UUID NOT NULL REFERENCES users(user_id),

    CONSTRAINT unique_user_event_combo
        UNIQUE (user_id, event_id)
);
