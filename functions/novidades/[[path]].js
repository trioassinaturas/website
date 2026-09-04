// The changelog publishes the same `<url>.md` twin as the docs, so /novidades
// negotiates markdown with the exact same handler.
export { onRequestGet } from "../docs/[[path]].js"
