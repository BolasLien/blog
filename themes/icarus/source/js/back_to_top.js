$(document).ready(() => {
    const $button = $('#back-to-top');
    const $footer = $('footer.footer');
    const $mainColumn = $('.column-main');
    const $leftSidebar = $('.column-left');
    const $rightSidebar = $('.column-right');
    let lastScrollTop = 0;
    const rightMargin = 20;
    const bottomMargin = 20;
    let lastState = null;
    const state = {
        base: {
            classname: 'card has-text-centered',
            left: '',
            width: 64,
            bottom: bottomMargin
        }
    };
    state['desktop-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' rise-up'
    });
    state['desktop-visible'] = Object.assign({}, state['desktop-hidden'], {
        classname: state['desktop-hidden'].classname + ' fade-in'
    });
    state['desktop-dock'] = Object.assign({}, state['desktop-visible'], {
        classname: state['desktop-visible'].classname + ' fade-in is-rounded',
        width: 40
    });
    state['mobile-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' fade-in',
        right: rightMargin
    });
    state['mobile-visible'] = Object.assign({}, state['mobile-hidden'], {
        classname: state['mobile-hidden'].classname + ' rise-up'
    });

    function isStateEquals(prev, next) {
        return ![].concat(Object.keys(prev), Object.keys(next)).some(key => {
            return !Object.prototype.hasOwnProperty.call(prev, key)
                || !Object.prototype.hasOwnProperty.call(next, key)
                || next[key] !== prev[key];
        });
    }

    function applyState(state) {
        if (lastState !== null && isStateEquals(lastState, state)) {
            return;
        }
        $button.attr('class', state.classname);
        for (const prop in state) {
            if (prop === 'classname') {
                continue;
            }
            $button.css(prop, state[prop]);
        }
        lastState = state;
    }

    function isDesktop() {
        return window.innerWidth >= 1078;
    }

    function isTablet() {
        return window.innerWidth >= 768 && !isDesktop();
    }

    function isScrollUp() {
        return window.scrollY < lastScrollTop && window.scrollY > 0;
    }

    function hasLeftSidebar() {
        return $leftSidebar.length > 0;
    }

    function hasRightSidebar() {
        return $rightSidebar.length > 0;
    }

    // Cached layout values — recalculated only on resize, not every scroll
    let cache = {};

    function updateCache() {
        cache.rightSidebarBottom = hasRightSidebar()
            ? Math.max.apply(null, $rightSidebar.find('.widget').map(function() {
                const rect = this.getBoundingClientRect();
                return rect.bottom + window.scrollY;
            }))
            : 0;
        cache.buttonWidth = $button.outerWidth(true);
        cache.buttonHeight = $button.outerHeight(true);
        cache.mainColumnPadding = ($mainColumn.outerWidth() - $mainColumn.width()) / 2;
        cache.mainColumnLeft = $mainColumn.offset().left;
        cache.mainColumnRight = cache.mainColumnLeft + $mainColumn.outerWidth();
        cache.footerTop = $footer.offset().top;
        cache.windowWidth = window.innerWidth;
        cache.windowHeight = window.innerHeight;
    }

    function getScrollTop() {
        return window.scrollY;
    }

    function getScrollBottom() {
        return window.scrollY + cache.windowHeight;
    }

    function updateScrollTop() {
        lastScrollTop = window.scrollY;
    }

    function update() {
        if (isDesktop() || (isTablet() && !hasLeftSidebar() && hasRightSidebar())) {
            let nextState;
            const scrollTop = getScrollTop();
            const scrollBottom = getScrollBottom();
            const maxLeft = cache.windowWidth - cache.buttonWidth - rightMargin;
            const maxBottom = cache.footerTop + (cache.buttonHeight / 2) + bottomMargin;

            if (scrollTop === 0 || scrollBottom < cache.rightSidebarBottom + cache.mainColumnPadding + cache.buttonHeight) {
                nextState = state['desktop-hidden'];
            } else if (scrollBottom < maxBottom) {
                nextState = state['desktop-visible'];
            } else {
                nextState = Object.assign({}, state['desktop-dock'], {
                    bottom: scrollBottom - maxBottom + bottomMargin
                });
            }

            nextState = Object.assign({}, nextState, {
                left: Math.min(cache.mainColumnRight + cache.mainColumnPadding, maxLeft)
            });
            applyState(nextState);
        } else {
            if (!isScrollUp()) {
                applyState(state['mobile-hidden']);
            } else {
                applyState(state['mobile-visible']);
            }
            updateScrollTop();
        }
    }

    // rAF-throttled handlers to avoid long tasks
    let rafPending = false;
    function onScroll() {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                update();
                rafPending = false;
            });
        }
    }

    function onResize() {
        updateCache();
        update();
    }

    updateCache();
    update();
    $(window).resize(onResize);
    $(window).scroll(onScroll);

    $('#back-to-top').on('click', () => {
        if (CSS && CSS.supports && CSS.supports('(scroll-behavior: smooth)')) {
            window.scroll({ top: 0, behavior: 'smooth' });
        } else {
            $('body, html').animate({ scrollTop: 0 }, 400);
        }
    });
});
