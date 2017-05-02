const AutoLaunch = require('auto-launch')

class AppLauncher {
    constructor(name) {
        this.name = name
    }

    autoLaunch() {
        const launcher = new AutoLaunch({
            name: this.name
        })
        launcher.enable();
        launcher.isEnabled()
            .then(function (isEnabled) {
                if (isEnabled) {
                    return;
                }
                launcher.enable();
            })
            .catch(function (err) {
                console.error('auto launch failed')
            });
    }
}

module.exports = AppLauncher