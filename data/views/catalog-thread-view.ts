export interface CatalogThreadView {
	thread_id: number
	thread_subject: string
	thread_text: string
	thread_user_name: string
	thread_post_bump_count: number
	thread_image_bump_count: number
	thread_filename: string|null
	thread_file_hash: string|null
	thread_file_path: string|null
	thread_created_at: Date
	thread_bumped_at: Date
	reply_id: number
	reply_text: string
	reply_user_name: string
	reply_filename: string|null
	reply_file_hash: string|null
	reply_file_path: string|null
	reply_created_at: Date
}