import onReady from "../on-ready.mjs";

function addHighlightToPost(this: HTMLAnchorElement, event: MouseEvent) {
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
    // const currentThreadNumber = document.getElementById('thread-wall').dataset.threadNumber
    // @ts-ignore
    const postLinks: HTMLAnchorElement[] = <HTMLAnchorElement> Array.from(document.getElementsByClassName('post-link'))

    for (const postLink of postLinks) {
        const postNumber = postLink.dataset.postNumber

        if (typeof postNumber === 'undefined') {
            continue
        }

        postLink.addEventListener('mouseover', addHighlightToPost)
        postLink.addEventListener('mouseleave', removeHighlightFromPost)
    }
}

onReady(addPostLinkListeners)