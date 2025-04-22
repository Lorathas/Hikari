export function* getPostLinks(): Generator<HTMLAnchorElement> {
	const postLinks = getAllPostLinks()

	for (const link of postLinks) {
		if (link.classList.contains('preview')) {
			continue
		}

		yield link
	}
}

export function getAllPostLinks() {
	return Array.from(document.getElementsByClassName('post-link')) as HTMLAnchorElement[]
}