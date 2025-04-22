import onReady from '../on-ready.mts'
import {getPostLinks} from '../util/get-post-links'

let postPreviewElement: HTMLDivElement

function updatePostPreview(this: HTMLAnchorElement) {
	// this.parentElement

	showPostPreview()
}

function createPostPreviewElement() {
	postPreviewElement = document.createElement('div')
}

function showPostPreview() {
	postPreviewElement.style.display = 'visible'
}

function hidePostPreview() {
	postPreviewElement.style.display = 'none'
}

function init() {
	createPostPreviewElement()

	for (const link of getPostLinks()) {
		link.addEventListener('mouseenter', updatePostPreview)
		link.addEventListener('mouseleave', hidePostPreview)
	}
}

onReady(init)