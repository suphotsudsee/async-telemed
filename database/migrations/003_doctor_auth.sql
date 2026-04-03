ALTER TABLE app_users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_username_unique ON app_users (LOWER(username)) WHERE username IS NOT NULL;

UPDATE app_users
SET username = 'dr.narin',
    password_hash = 'scrypt:c600d1c430b5c0f5a42d8bbd3496f2cc:15a31fab390ee2e6873343cdaf74d841b8f3b97827013b8ea0150fa7cf76560bcecbed49892bce91e7c5211519b47a0868b68f028a0589a7ac1543dd632bab5f'
WHERE id = '00000000-0000-0000-0000-000000000101'
  AND (username IS NULL OR password_hash IS NULL);

UPDATE app_users
SET username = 'dr.pim',
    password_hash = 'scrypt:52925e1a6a3b449aae23a4b0acb073ca:0fe8fde4f5e819d28204d70e5859b71b84f5c3e724dd3a5966e9f1384191f94dcd710d3ffbecc5f9931e6b61b2c263810e6362601998b1b2d0af8b08295e72b9'
WHERE id = '00000000-0000-0000-0000-000000000102'
  AND (username IS NULL OR password_hash IS NULL);
