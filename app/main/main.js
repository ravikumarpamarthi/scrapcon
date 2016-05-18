'use strict';
angular.module('main', [
    'ionic',
    'ionic.rating',
    'ngCordova',
    'ui.router',
    'ngMessages',
    'ngMap',
    'ionic-datepicker',
    'ionic-timepicker',
    'tabSlideBox',
    'LocalStorageModule',
    'environment',
    'base64',
    'checklist-model',
    'angular-momentjs',
    'chart.js',
    'ion-affix'
]).config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider, envServiceProvider, localStorageServiceProvider) {
    $ionicConfigProvider.navBar.alignTitle('left');
    localStorageServiceProvider.setPrefix('scrapq')
        .setStorageType('localStorage')
        .setNotify(true, true);
    /* ImgCacheProvider.setOptions({
         debug: true,
         usePersistentCache: true
     });
     ImgCacheProvider.manualInit = true;*/
    /* environment start*/
    var restApi = {
        signup: "/api/registration/consumer",
        locations: "http://scrapq.digitelenetworks.com/locations.json",
        updateProfile: "/api/consumer/profile",
        getProfile: "/api/consumer/profile/:cid",
        consumerCategories: "/api/consumer/categories",
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        otpVerification: "/api/registration/verification",
        ScrapCategories: "/api/categories",
        sellNowPickup: "/api/sell/pickup",
        sellNowDrop: "/api/sell/drop",
        getSellById: "/api/sell/:id",
        saveAddress: "/api/address",
        deleteAddress: "/api/address/:id/deleteaddress",
        getAddress: "/api/addresses",
        getSlots: "/api/sell/slots/available",
        getPriceTrends: "/api/category/price/trends",
        setDefault: "/api/address/:id/default",
        getSellRquests: "/api/sells",
        cancelSellRquests: "/api/sell/:cid/cancel",
        getAgentsByLatLng: "/api/addresses/lng/:lng/lat/:lat/agents",
        complaintsCategory: "/api/complaint/categories",
        complaintsType: "/api/complaint/:cid/types",
        postComplaint: "/api/complaint",
        getRatings: "/api/feedback/ratings",
        getPendingFeedBacks: "/api/feedbacks?consumerid=:cid&status=pending",
        getRatingTags: "/api/feedback/rating/:id",
        submitFeedBack: "/api/feedback",
        skipFeedBack: "/api/feedback/:id/skip",
        getImageFileById: "/fileManager/getImageFileById",
        getAbout: "/api/consumer/about",
        getFaqs: "/api/consumer/faqs",
        forgotpassword: "/api/registration/:usertext/reset/pwd",
        placeBid: "/api/bid",
        getBidById: "/api/bid/:id",
        getBids: "/api/bids",
        getReferral: "/api/registration/referral/:cid",
        resetPwd: "/api/registration/pwd",
        updatePickup: "/api/sell/:sellId/pickup",
        updateDrop: "/api/sell/:sellId/drop",
        getOffercount: "/api/offers/offercount/:cid",
        getOfferDetails: "/api/offers/offerDetails/:cid",

    };
    var debugmode = false;
    envServiceProvider.config({
        vars: {
            development: {
                // apiUrl: 'http://192.168.101.116:9080/rest',
                //apiUrl: 'http://10.80.80.105:8080/scrapq',
                 apiUrl: 'http://10.80.80.121:8080/rest',
                staticUrl: 'http://localhost:3000',
                restApi: restApi,
                debugmode: debugmode

            },
            localhost: {
                apiUrl: 'http://localhost:3000',
                staticUrl: 'http://localhost:3000',
                restApi: restApi,
                debugmode: debugmode
            },
            qaserver: {
                apiUrl: 'http://scrapq.digitelenetworks.com/scrapq',
                staticUrl: 'http://localhost:3000',
                restApi: restApi,
                debugmode: debugmode
            }
        }
    });

    envServiceProvider.check();
    envServiceProvider.set('qaserver');
    /* environment end*/
    // ROUTING with ui.router
    $urlRouterProvider.otherwise('/main/dashboard');
    $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
        .state('main', {
            url: '/main',
            abstract: true,
            cache: false,
            templateUrl: 'main/templates/menu.html',
            controller: 'MenuCtrl as menu',
           /* resolve:{
                init: ['commonSevices',function(commonSevices) {
                    return commonSevices.getLocations()
                }]
            }*/
        })
        .state('main.sell-now', {
            url: '/sell-now',
            views: {
                'pageContent': {
                    /*templateUrl: 'main/templates/sell-now.html',
                    controller: 'SellNowCtrl'*/
                    templateUrl: 'main/templates/sellnow-by-nativemap.html',
                    controller: 'SellnowByNativeMapCtrl'
                }
            }
        }).state('main.edit-sell', {
            url: '/edit-sell/:id',
            views: {
                'pageContent': {
                    /* templateUrl: 'main/templates/edit-sell.html',
                     controller: 'EditSellCtrl'*/
                    templateUrl: 'main/templates/edit-sellnow.html',
                    controller: 'EditSellnowCtrl'
                }
            }
        }).state('main.edit-appointment-by-native', {
            url: '/edit-appointment-by-native/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/edit-appointment-by-native.html',
                    controller: 'EditAppointmentByNativeCtrl'
                }
            }
        }).state('main.edit-drop-by-native', {
            url: '/edit-drop-by-native/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/edit-drop-by-native-ctrl.html',
                    controller: 'EditDropByNativeCtrl'
                }
            }
        }).state('main.edit-sell-now-by-native', {
            url: '/edit-sell-now-by-native/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/edit-sell-now-by-native.html',
                    controller: 'EditSellNowByNativeCtrl'
                }
            }
        }).state('main.catselection', {
            url: '/catselection',
            params: {
                queryParams: null
            },
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/catselection.html',
                    controller: 'CatSelectionCtrl'
                }
            }
        })
        .state('main.login', {
            url: '/login',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('main.offers', {
            url: '/offers',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/offers.html',
                    controller: 'OffersCtrl'
                }
            }
        })
        .state('main.forgotpassword', {
            url: '/forgotpassword',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/forgotpassword.html',
                    controller: 'ForgotpasswordCtrl'
                }
            }
        })
        .state('main.profile', {
            url: '/profile',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/profile.html',
                    controller: 'AccorCtrl as ctrl'
                }
            }
        })
        .state('main.registration', {
            url: '/registration',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/registration.html',
                    controller: 'RegistrationCtrl'
                }
            }
        })
        .state('main.registration-new', {
            url: '/registration-new',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/registration-new.html',
                    //controller: 'RegistrationCtrl'
                }
            }
        })
        .state('main.otp-new', {
            url: '/otp-new',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/otp-new.html',
                    //controller: 'RegistrationCtrl'
                }
            }
        })
        .state('main.passcode-new', {
            url: '/passcode-new',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/passcode-new.html',
                    //controller: 'RegistrationCtrl'
                }
            }
        })
        .state('main.category-new', {
            url: '/category-new',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/category-new.html',
                    //controller: 'RegistrationCtrl'
                }
            }
        })
        .state('main.fb', {
            url: '/fb',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/fb.html',
                    controller: 'FbCtrl'
                }
            }
        })
        .state('main.trends', {
            url: '/trends',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/trends.html',
                    controller: 'TrendsCtrl'
                }
            }
        }).state('main.dashboard', {
            url: '/dashboard',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/dashboard.html',
                    controller: 'DashboardCtrl'
                }
            }
        })
        .state('main.otp', {
            url: '/otp',
            params: {
                queryParams: null
            },
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/otp.html',
                    controller: 'OtpCtrl'
                }
            }
        })
        .state('main.viewappnts', {
            url: '/viewappnts',
            views: {
                'pageContent': {
                    // templateUrl: 'main/templates/viewappnts.html',
                    templateUrl: 'main/templates/va.html',
                    controller: 'ViewAppntsCtrl'
                }
            }
        })
        .state('main.complaints', {
            url: '/complaints',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/complaints.html',
                    controller: 'ComplaintsCtrl'
                }
            }
        })
        .state('main.myaccount', {
            // cache: false,
            url: '/myaccount?from',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/myaccount.html',
                    controller: 'MyAccountCtrl'
                }
            }
        })
        .state('main.refer', {
            url: '/refer',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/refer.html',
                    controller: 'ReferCtrl'
                }
            }
        }).state('main.ngmap', {
            // cache: false,
            url: '/ngmap',
            views: {
                'pageContent': {
                    //templateUrl: 'main/templates/ngmap.html',
                    //controller: 'NgmapCtrl'
                    templateUrl: 'main/templates/add-location.html',
                    controller: 'Add-locationCtrl'
                }
            }
        }).state('main.add-location', {
            url: '/add-location',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/add-location.html',
                    controller: 'Add-locationCtrl'
                }
            }
        })
        .state('main.sellconfirm', {
            // cache: false,
            url: '/sellconfirm/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/sellconfirm.html',
                    controller: 'SellconfirmCtrl'
                        /* templateUrl: 'main/templates/sell-confirmation-by-native-map.html',
                         controller: 'SellConfirmationByNativeMapCtrl'*/
                }
            }
        })
        .state('main.bookappointment', {
            // cache: false,
            url: '/bookappointment',
            views: {
                'pageContent': {
                    /*templateUrl: 'main/templates/bookappointment.html',
                    controller: 'BookAppointmentCtrl'*/
                    templateUrl: 'main/templates/book-appointment-by-nativemap.html',
                    controller: 'Book-appointment-by-nativemapCtrl'
                }
            }
        })
        .state('main.bookappointmentconfirm', {
            // cache: false,
            url: '/bookappointmentconfirm/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/bookappointmentconfirm.html',
                    controller: 'BookAppointmentConfirmCtrl'
                }
            }
        })
        .state('main.place-bid', {
            // cache: false,
            url: '/place-bid',
            views: {
                'pageContent': {
                    /*templateUrl: 'main/templates/place-bid.html',
                    controller: 'placeBidCtrl' */
                    templateUrl: 'main/templates/place-bid-by-nativemap.html',
                    controller: 'PlaceBidByNativemapCtrl'
                }
            }
        }).state('main.bid-confirmation', {
            // cache: false,
            url: '/bid-confirmation/:id',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/bid-confirmation.html',
                    controller: 'Bid-confirmationCtrl'
                }
            }
        })
        .state('main.bid-list', {
            // cache: false,
            url: '/bid-list',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/bid-list.html',
                    controller: 'Bid-listCtrl'
                }
            }
        })
        .state('main.about', {
            // cache: false,
            url: '/about',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/about.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('main.faq', {
            // cache: false,
            url: '/faq',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/faq.html',
                    controller: 'FaqCtrl'
                }
            }
        })
        .state('main.default', {
            // cache: false,
            url: '/default',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/default.html',
                    controller: 'DefaultCtrl'
                }
            }
        })
        .state('main.otp-modal', {
            // cache: false,
            url: '/otp-modal',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/otp-modal.html',
                    //controller: 'DefaultCtrl'
                }
            }
        })
        .state('main.resetPassword', {
            // cache: false,
            url: '/resetPassword',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/reset-password.html',
                    controller: 'ResetPasswordCtrl'
                }
            }
        }).state('main.va', {
            // cache: false,
            url: '/va',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/va.html',
                    //controller: 'ResetPasswordCtrl'
                }
            }
        }).state('main.rd', {
            // cache: false,
            url: '/rd',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/rd.html',
                    //controller: 'ResetPasswordCtrl'
                }
            }
        }).state('main.share', {
            // cache: false,
            url: '/share',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/share.html',
                    controller: 'MenuCtrl'
                }
            }
        })
        .state('main.honor', {
            // cache: false,
            url: '/honor',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/honor.html',
                    //controller: 'MenuCtrl'
                }
            }
        })
        .state('main.pickupdrop', {
            // cache: false,
            url: '/pickupdrop',
            views: {
                'pageContent': {
                    templateUrl: 'main/templates/pickupdrop.html',
                    //controller: 'MenuCtrl'
                }
            }
        });

}).run(function($state, $ionicPopup, $ionicHistory, $global, $log, $rootScope, $ionicPlatform, Complaints, $cordovaStatusbar) {

    


    ImgCache.options.debug = false;
    ImgCache.options.chromeQuota = 50 * 1024 * 1024;
    $global.removeLocalItem("sellReuestItems");
    // Disable BACK button on home
    //console.log($ionicPlatform);
    $ionicPlatform.registerBackButtonAction(function(event) {
        if($state.current.name == "main.registration"){
            event.preventDefault();
            $state.go('main.default');
        }

        if ($state.current.name == "main.dashboard" || $state.current.name == "main.default") {
            if ($global.backExit == false) {
                $global.showToastMessage("Press again to exit", 'short', 'center')
                $global.backExit = true;
            } else if ($global.backExit == true) {
                $global.backExit = false;
                ionic.Platform.exitApp();
            }
            event.preventDefault();
            /*$i\\\\\\onicPopup.confirm({
                        title: 'System warning',
                        template: 'are you sure you want to exit?'
                    }).then(function(res) {
                        if (res) {
                            ionic.Platform.exitApp();
                        }
                    })*/
        } else {
            $ionicHistory.goBack();
        }
    }, 100);
    $ionicPlatform.ready(function() {
        ImgCache.init(function() {
            // $log.debug('ImgCache init: success!');
            // alert("ImgCache init: success!");
        }, function() {
            // alert("ImgCache init: error! Check the log for errors");
            // $log.error('ImgCache init: error! Check the log for errors');
        });
    }); /**/

    /* ImgCache.init(function() {
         $log.debug('ImgCache init: success!');
     }, function(){
         $log.error('ImgCache init: error! Check the log for errors');
     });
     $ionicPlatform.ready(function() {
         ImgCache.$init();
           if (window.StatusBar) {
              $cordovaStatusbar.overlaysWebView(true);
              $cordovaStatusbar.styleHex('#126B2B');
          }
      });*/

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        var isLogin = toState.name === 'main.login';
        $global.init();
        $rootScope.$emit('initMenu', "ok");
        if (isLogin) {
            $global.removeLocalItem("authentication");
            $global.removeLocalItem("sellReuestItems");
            $global.removeLocalItem("registration");
            return;
        } else {
            var toStateName = toState.name;
            if (toStateName == 'main.category-new' || toStateName == 'main.passcode-new' || toStateName == 'main.otp-new' ||toStateName == 'main.registration-new' || toStateName == 'main.va' || toStateName == 'main.otp-modal' || toStateName == 'main.default' || toStateName == 'main.faq' || toStateName == 'main.about' || toStateName == 'main.otp' || toStateName == 'main.registration' || toStateName == 'main.forgotpassword') {
                return;
            }
            if ($global.authentication == null || $global.authentication == undefined || $global.authentication == '') {
                e.preventDefault();
                $state.go('main.default');
                return;
            }

            if ($global.feedBackChecked == false) {
                Complaints.getPendingFeedBacks().then(function(res) {
                    if (res.status == $global.SUCCESS) {
                        if (res.data.feedbacks.length > 0) {
                            e.preventDefault();
                            $state.go('main.fb');
                        } else {
                            $global.feedBackChecked = true;
                        }
                    }
                });

            }
        }
    });
})
