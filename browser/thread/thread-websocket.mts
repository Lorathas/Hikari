import onReady from '../on-ready.mts'
import {
	HikariWebSocketMessageSchema,
	MessageType,
	type PostCreatedMessage, PostCreatedMessageSchema,
	type PostDeletedMessage, PostDeletedMessageSchema,
	type SubscribeToThreadMessage
} from '../hikari-websocket-message.ts'

let socket: WebSocket

//region WebSocket Handlers

/**
 * Process messages from the server for the websocket
 * @param event WebSocket event
 */
function onMessageReceived(event: MessageEvent) {
	console.info('Received WS Message: %s', event.data)

	if (typeof event.data !== 'string') {
		return
	}

	const parsed = JSON.parse(event.data)
	const baseParseResult = HikariWebSocketMessageSchema.safeParse(parsed)

	if (!baseParseResult.success) {
		console.error('Invalid WS message received %s', event.data)
		return
	}

	switch (baseParseResult.data.type) {
	case MessageType.enum.PostCreated:
		const postCreatedResult = PostCreatedMessageSchema.safeParse(parsed)
		if (postCreatedResult.success) {
			addPost(postCreatedResult.data)
		}
		break
	case MessageType.enum.PostDeleted:
		const postDeletedResult = PostDeletedMessageSchema.safeParse(parsed)
		if (postDeletedResult.success) {
			removePost(postDeletedResult.data)
		}
		break
	}
}

/**
 * Register the thread with the websocket once it's opened
 */
function onSocketOpened() {
	const thread = document.getElementById('thread') as HTMLDivElement|null

	if (!thread) {
		console.error('Could not find thread element')
		return
	}

	const threadNumber = parseInt(thread.dataset.threadNumber!)

	if (isNaN(threadNumber)) {
		console.error(`Failed to get the thread post number, found: ${thread.dataset.threadNumber}`)
		return
	}

	const message: SubscribeToThreadMessage = {
		type: MessageType.enum.SubscribeToThread,
		threadNumber,
	}

	socket.send(JSON.stringify(message))
}

/**
 * Called on socket closed
 */
function onSocketClosed(this:  WebSocket) {
	console.info('Socket Closed')
}

/**
 * Socket error handler
 * @param event
 */
function onSocketError(this: WebSocket, event: Event) {
	console.error(event.type)
}

//endregion

//region Message Handlers

/**
 * Remove post from the page
 * @param message Message received from the server
 */
function removePost(message: PostDeletedMessage) {
	const post = document.getElementById(message.postNumber.toString()) as HTMLDivElement|null

	if (!post) {
		console.warn(`Could not find post #${message.postNumber} to remove`)
		return
	}

	post?.remove()
}

/**
 * Add post to the page
 * @param message Message received from the server
 */
function addPost(message: PostCreatedMessage) {
	const threadWall = document.getElementById('thread-wall') as HTMLDivElement|null

	if (!threadWall) {
		console.error('Could not find thread wall to add post to')
		return
	}

	const newPost = document.createElement('div')

	newPost.innerText = message.postHtml

	threadWall.appendChild(newPost)
}

//endregion

function init() {
	socket = new WebSocket(`ws://${window.location.host}`)

	socket.addEventListener('message', onMessageReceived)
	socket.addEventListener('open', onSocketOpened)
	socket.addEventListener('close', onSocketClosed)
	socket.addEventListener('error', onSocketError)
}

onReady(init)