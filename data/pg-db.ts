import pgPromise from 'pg-promise'

export const pgp = pgPromise({})

export const db = pgp(process.env.HIKARI_CONN_STRING!)