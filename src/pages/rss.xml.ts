/**
 * `/rss.xml` is where feed readers and people guess a site's feed lives, so
 * the root serves the blog feed itself, byte for byte, rather than a redirect.
 */
export { GET } from "./blog/rss.xml"
