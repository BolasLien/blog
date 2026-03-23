const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Gallery extends Component {
    render() {
        const { head, lightGallery, justifiedGallery } = this.props;
        if (head) {
            // async-load gallery CSS to avoid render-blocking
            return <Fragment>
                <link rel="preload" href={lightGallery.cssUrl} as="style" onload="this.onload=null;this.rel='stylesheet'" />
                <noscript><link rel="stylesheet" href={lightGallery.cssUrl} /></noscript>
                <link rel="preload" href={justifiedGallery.cssUrl} as="style" onload="this.onload=null;this.rel='stylesheet'" />
                <noscript><link rel="stylesheet" href={justifiedGallery.cssUrl} /></noscript>
            </Fragment>;
        }
        const js = `window.addEventListener("load", () => {
            if (typeof $.fn.lightGallery === 'function') {
                $('.article').lightGallery({ selector: '.gallery-item' });
            }
            if (typeof $.fn.justifiedGallery === 'function') {
                if ($('.justified-gallery > p > .gallery-item').length) {
                    $('.justified-gallery > p > .gallery-item').unwrap();
                }
                $('.justified-gallery').justifiedGallery();
            }
        });`;
        return <Fragment>
            <script src={lightGallery.jsUrl} defer></script>
            <script src={justifiedGallery.jsUrl} defer></script>
            <script dangerouslySetInnerHTML={{ __html: js }}></script>
        </Fragment>;
    }
}

Gallery.Cacheable = cacheComponent(Gallery, 'plugin.gallery', function (props) {
    const { head, helper } = props;
    return {
        head,
        lightGallery: {
            jsUrl: helper.cdn('lightgallery', '1.10.0', 'dist/js/lightgallery.min.js'),
            cssUrl: helper.cdn('lightgallery', '1.10.0', 'dist/css/lightgallery.min.css')
        },
        justifiedGallery: {
            jsUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/js/jquery.justifiedGallery.min.js'),
            cssUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/css/justifiedGallery.min.css')
        }
    };
});

module.exports = Gallery;
