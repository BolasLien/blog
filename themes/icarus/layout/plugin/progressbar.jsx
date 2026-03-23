const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class ProgressBar extends Component {
    render() {
        const { jsUrl } = this.props;
        const css = '.pace{-webkit-pointer-events:none;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.pace-inactive{display:none}.pace .pace-progress{background:#3273dc;position:fixed;z-index:2000;top:0;right:100%;width:100%;height:2px}';
        return <Fragment>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <script src={jsUrl} async></script>
        </Fragment>;
    }
}

ProgressBar.Cacheable = cacheComponent(ProgressBar, 'plugin.progressbar', function (props) {
    const { head, helper } = props;
    if (!head) {
        return null;
    }
    return {
        jsUrl: helper.cdn('pace-js', '1.2.4', 'pace.min.js')
    };
});

module.exports = ProgressBar;
