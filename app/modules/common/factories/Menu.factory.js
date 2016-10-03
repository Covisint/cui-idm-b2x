angular.module('common')
.factory('Menu', (snapRemote, $rootScope, $window) => {

    const shouldShowMobileNav = () => {
        if ($window.innerWidth >= 1000) {
            snapRemote.close()
        }
    }

    // Fixes issue where opening up the mobile menu and then expanding into desktop mode 
    // would leave all content pushed to the right.
    $window.onresize = _.debounce(function() {
        shouldShowMobileNav()
    }, 1000)

    return {
        desktop: {
            state: 'open', // default state for desktop menu
            enabled: true,
            open: function() {
                this.state = 'closed'
            },
            close: function() {
                this.state = 'closed'
            },
            toggle: function() { 
                this.state === 'open' ? this.state = 'closed' : this.state = 'open' 
            },
            hide: function() {
                this.enabled = false
            },
            show: function() {
                this.enabled = true
            }
        },

        mobile: {
            state: 'closed', // default state for mobile menu
            enabled: true,
            open: function() {
                this.state = 'open'
            },
            close: function() {
                this.state = 'close'
            },
            toggle: function() {
                this.state === 'open' ? this.state = 'closed' : this.state = 'open'
            },
            hide: function() {
                this.enabled = false
            },
            show: function() {
                this.state = true
            }
        },

        handleStateChange: function(stateMenuOptions){
            if (!angular.isDefined(stateMenuOptions)){
                this.desktop.show()
                this.mobile.show()
            }
            else {
                (angular.isDefined(stateMenuOptions.desktop) && stateMenuOptions.desktop=== false)? this.desktop.hide() : this.desktop.show()
                (angular.isDefined(stateMenuOptions.mobile) && stateMenuOptions.mobile=== false)? this.mobile.hide() : this.mobile.show()
            }
        }
    }
})
