import onReady from '../on-ready.mjs'
import {getPostLinks} from '../util/get-post-links'

function addHighlightToPost(this: HTMLAnchorElement) {
	const postNumber = this.dataset.postNumber

	const targetPost = document.getElementById(postNumber!)

	if (!targetPost) {
		return
	}

	targetPost.classList.add('highlighted')
}

function removeHighlightFromPost(this: HTMLAnchorElement) {
	const postNumber = this.dataset.postNumber
	const targetPost = document.getElementById(postNumber!)

	if (!targetPost) {
		return
	}

	targetPost.classList.remove('highlighted')
}

function addPostLinkListeners() {
	for (const postLink of getPostLinks()) {
		const postNumber = postLink.dataset.postNumber

		if (typeof postNumber === 'undefined') {
			continue
		}

		postLink.addEventListener('mouseover', addHighlightToPost)
		postLink.addEventListener('mouseleave', removeHighlightFromPost)
	}
}

onReady(addPostLinkListeners)