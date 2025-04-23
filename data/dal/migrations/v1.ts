import {db} from '../../pg-db.ts'
import {ParameterizedQuery as PQ} from 'pg-promise'
import { insertMigration } from './migrations.ts'

async function createMigrationsTable() {
	await db.none('CREATE TABLE IF NOT EXISTS migrations (id SERIAL PRIMARY KEY, name VARCHAR(256) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());')
}

async function createBoardDefaultsTable() {
	await db.none('CREATE TABLE IF NOT EXISTS board_defaults(id SERIAL PRIMARY KEY, config JSON NOT NULL);')
}

async function createBoardsTable() {
	await db.none('CREATE TABLE IF NOT EXISTS boards (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE, slug CHAR(8) UNIQUE, description VARCHAR(512), last_post_id BIGINT, is_public BOOLEAN DEFAULT true, config JSON, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());')
}

async function createThreadTable(name: string) {
	const tableName = `posts_${name}`

	await db.none(new PQ({
		text: 'CREATE TABLE IF NOT EXISTS ${tableName} (id BIGSERIAL PRIMARY KEY, parent_id BIGINT REFERENCES threads_vt(id), subject VARCHAR(255) DEFAULT NULL, text VARCHAR(8096) NOT NULL, user_name VARCHAR(32) NOT NULL DEFAULT \'anonymous\', post_bump_count INT NOT NULL DEFAULT 0, image_bump_count INT NOT NULL DEFAULT 0, filename VARCHAR(256), file_hash BYTEA, file_path VARCHAR(256), deleted BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());',
		values: [tableName]
	}))
}

export async function up() {
	await createMigrationsTable()

	await createBoardDefaultsTable()
	await createBoardsTable()

	await insertMigration('v1')
}