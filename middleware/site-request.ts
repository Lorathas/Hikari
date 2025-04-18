import { type Request } from 'express'

export interface SiteRequest extends Request {
	ipHash: string
	userHash: string
}