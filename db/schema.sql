DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tasks;

CREATE TABLE users (
    id          SERIAL      PRIMARY KEY,
    username    TEXT        UNIQUE          NOT NULL,
    password    TEXT        NOT NULL
);

CREATE TABLE tasks (
    id          SERIAL      PRIMARY KEY,
    title       TEXT        NOT NULL,
    done        BOOLEAN     DEFAULT false   NOT NULL,
    user_id     INTEGER     NOT NULL        REFERENCES users    ON DELETE CASCADE
);