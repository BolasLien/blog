/* global hexo */

/**
 * Hexo filter: add loading="lazy" to all <img> tags in post content
 * Skips images that already have a loading attribute.
 * Cover/hero images are handled separately in the theme template.
 */
hexo.extend.filter.register('after_post_render', function (page) {
    if (!page.content) return page;

    page.content = page.content.replace(
        /<img(?![^>]*\bloading=)([^>]*)>/gi,
        '<img loading="lazy"$1>'
    );

    return page;
});
