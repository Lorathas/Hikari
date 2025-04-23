import {db} from '../../pg-db.ts'

export async function insertMigration(migrationName: string) {
	await db.none('INSERT INTO migrations (NAME) VALUES (${migrationName});', {
		migrationName
	})
}