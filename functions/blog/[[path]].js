// Blog posts publish the same `<url>.md` twins as the docs, so /blog/*
// negotiates markdown with the exact same handler.
export { onRequestGet } from "../docs/[[path]].js"
