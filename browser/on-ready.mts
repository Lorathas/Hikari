export default function onReady(callback: Function) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(callback, 1)
    } else {
        // @ts-ignore
        document.addEventListener('DOMContentLoaded', callback)
    }
}