
/**
 * Try to find a collection and execute a function if it exists, offers and optional function for it it isn't found.
 * @param collection Collection to search
 * @param predicate Predicate for finding the element
 * @param exists Function to call if element exists in collection
 * @param doesNotExist Optional function to call if element does not exist in collection
 */
export default function tryFind<T>(collection: T[], predicate: (ele: T) => boolean, exists: (val: T) => void, doesNotExist: (() => void)|undefined = undefined): boolean {
    const result = collection.find(predicate)

    if (result) {
        exists(result)
        return true
    } else if (doesNotExist) {
        doesNotExist()
    }

    return false
}