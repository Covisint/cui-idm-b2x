angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('assets/app/applications/applications.html',
    "<div ui-view class=cui-applications></div>"
  );


  $templateCache.put('assets/app/applications/my-applications/my-application-details.html',
    "<div>\n" +
    "\n" +
    "  <div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/my-applications target=blank>here</a></div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title ui-sref=applications.myApplications>{{'my-applications' | translate}}</span>\n" +
    "    \n" +
    "    <div class=cui-action__actions>\n" +
    "      <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n" +
    "      </svg>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=\"cui-applications__main-container cui-applications__main-container--full\">\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n" +
    "      <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=myApplicationDetails.doneLoading>\n" +
    "      \n" +
    "      <div class=\"cui-media cui-media--vertical\">\n" +
    "        \n" +
    "        <div class=cui-media__image-container>\n" +
    "          <a ng-href={{myApplicationDetails.app.mangledUrl}} target=_blank>\n" +
    "            <div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=myApplicationDetails.app.name cui-avatar-cuii18n-filter cui-avatar=myApplicationDetails.app.iconUrl></div>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div>\n" +
    "          <h3 class=cui-media__title>{{myApplicationDetails.app.name | cuiI18n}}</h3>\n" +
    "          <span class=cui-media__content>{{ 'granted' | translate }}: {{myApplicationDetails.app.grantedDate | date:base.appConfig.dateFormat}}</span>\n" +
    "          <span ng-class=\"'cui-status--'+myApplicationDetails.app.status\">{{myApplicationDetails.app.status | uppercase}}</span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=\"cui-tabs class-toggle\">\n" +
    "        <ul class=cui-tabs__nav>\n" +
    "          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab1 ng-class=\"{'cui-tabs__tab--active':!myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=false\">{{'application-details' | translate}}</a></li>\n" +
    "          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab2 ng-class=\"{'cui-tabs__tab--active':myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=true\">{{'my-claims' | translate}}</a></li>\n" +
    "        </ul>\n" +
    "        <div class=cui-tabs__content>\n" +
    "          \n" +
    "          <div id=tab1 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':!myApplicationDetails.inClaims}\">\n" +
    "            <div class=cui-applications__details>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n" +
    "                <p>{{'cui-no-application-details' | translate}}</p>\n" +
    "              </div>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n" +
    "                <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n" +
    "                    <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.related.length!==0\">\n" +
    "                <h4 class=h6>{{'related-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n" +
    "                    <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          \n" +
    "          <div id=tab2 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':myApplicationDetails.inClaims}\">\n" +
    "            <p ng-if=!myApplicationDetails.claims>{{'cui-no-claims' | translate}}</p>\n" +
    "            <span ng-repeat=\"claim in myApplicationDetails.claims.packageClaims\">\n" +
    "              <p ng-repeat=\"claimValue in claim.claimValues\">{{claimValue.name | cuiI18n}}</p>\n" +
    "            </span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-applications__desktop-tabs>\n" +
    "\n" +
    "        \n" +
    "        <div class=\"cui-tile cui-applications__left\">\n" +
    "          <h4 class=\"cui-tile__title cui-applications__title\">{{'application-details' | translate}}</h4>\n" +
    "          <div class=\"cui-tile__body cui-applications__details\">\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n" +
    "              <p>{{'cui-no-application-details' | translate}}</p>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n" +
    "              <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n" +
    "              <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n" +
    "                <div class=cui-media__body>\n" +
    "                  <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                  <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                  <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n" +
    "                  <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                </div>\n" +
    "                <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "              </div>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.related.length!==0\">\n" +
    "              <h4 class=h6>{{'related-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n" +
    "                    <span class=cui-button ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          \n" +
    "          <div class=\"cui-tile cui-applications__right\">\n" +
    "            <h4 class=\"cui-tile__title cui-tile__title--bg-light cui-applications__title\">{{'my-claims' | translate}}</h4>\n" +
    "            <div class=cui-tile__body>\n" +
    "              <p ng-if=!myApplicationDetails.claims>{{'cui-no-claims' | translate}}</p>\n" +
    "              <span ng-repeat=\"claim in myApplicationDetails.claims.packageClaims\">\n" +
    "                <p ng-repeat=\"claimValue in claim.claimValues\">{{claimValue.name | cuiI18n}}</p>\n" +
    "              </span>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n"
  );


  $templateCache.put('assets/app/applications/my-applications/my-applications.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/my-applications target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-action>\n" +
    "  <span class=cui-action__title>\n" +
    "    <a ui-sref=applications.orgApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'organization-applications' | translate}}</a> | \n" +
    "    <a ui-sref=applications.myApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'my-applications' | translate}}</a>\n" +
    "  </span>\n" +
    "  <div class=cui-action__actions>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"myApplications.sortClicked =! myApplications.sortClicked\" id=sort-button off-click=\"myApplications.sortClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'sort' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.sortClicked>\n" +
    "        <p ng-click=\"myApplications.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n" +
    "        <p ng-click=\"myApplications.sort('date'); \">{{'cui-by-date-added' | translate}}</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"myApplications.refineClicked =! myApplications.refineClicked\" id=refine-button off-click=\"myApplications.refineClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'refine' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.refineClicked>\n" +
    "        <p ng-click=\"myApplications.parseAppsByStatus('all')\">{{'all' | translate}} ({{myApplications.statusCount[0]}})</p>\n" +
    "        <div ng-repeat=\"status in myApplications.statusList\" ng-if=\"myApplications.statusCount[$index+1]!==0\">\n" +
    "          <p ng-click=myApplications.parseAppsByStatus(status)>{{status | translate}} ({{myApplications.statusCount[$index+1]}})</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"myApplications.categoriesClicked =! myApplications.categoriesClicked\" id=categories-button off-click=\"myApplications.categoriesClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'categories' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.categoriesClicked>\n" +
    "        <p ng-click=\"myApplications.parseAppsByCategory('all')\">{{'all' | translate}} ({{myApplications.categoryCount[0]}})</p>\n" +
    "        <div ng-repeat=\"category in myApplications.categoryList\">\n" +
    "          <p ng-click=myApplications.parseAppsByCategory(category)>{{category| cuiI18n}} ({{myApplications.categoryCount[$index+1]}})</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "      <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n" +
    "    </svg>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-applications__main-container>\n" +
    "  <div class=cui-loading__container ng-if=!myApplications.doneLoading>\n" +
    "    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "  </div>\n" +
    "  <div class=sorting>\n" +
    "    \n" +
    "  </div>\n" +
    "  <div ng-if=myApplications.doneLoading>\n" +
    "    <div class=\"cui-media cui-media--border\" ng-repeat=\"application in myApplications.list track by application.id\" ng-click=myApplications.goToDetails(application)>\n" +
    "      <div class=cui-media__image-container>\n" +
    "        <a ng-href={{application.mangledUrl}} target=_blank><div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=application.name cui-avatar-cuii18n-filter cui-avatar=application.iconUrl></div></a>\n" +
    "      </div>\n" +
    "      <div class=\"cui-media__body cui-media__body--full\">\n" +
    "        <h3 class=cui-media__title ng-bind=\"application.name | cuiI18n\"></h3>\n" +
    "        <span class=cui-media__content ng-if=application.category> {{application.category | cuiI18n}}</span>\n" +
    "        <span class=cui-status ng-class=\"'cui-status--'+application.status\" ng-bind=\"application.status | lowercase\"></span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/new-request&review/new-request.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/new-request%26review target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss class=cui-link target=blank>here</a></div>\n" +
    "<div class=cui-applications__new-request>\n" +
    "    <div class=cui-action>\n" +
    "        <div class=cui-action__title>{{'new-request' | translate}}</div>\n" +
    "        <div class=cui-action__actions>\n" +
    "            <svg ui-sref=applications.myApplications xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--close\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <h3 class=cui-action__title>{{'select-applications' | translate}}</h3>\n" +
    "        <div class=cui-action__actions>\n" +
    "            <svg ng-click=\"newAppRequest.requestPopover=!newAppRequest.requestPopover\" off-click=\"newAppRequest.requestPopover=false\" xmlns=http://www.w3.org/2000/svg id=cui-applications__requested-apps class=\"cui-icon cui-icon--folder\" ng-class=\"{'cui-action__icon--active': newAppRequest.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#folder></use>\n" +
    "            </svg>\n" +
    "            <sup class=cui-action__icon-counter ng-class=\"{'cui-action__icon-counter--active': newAppRequest.numberOfRequests != 0}\">{{newAppRequest.numberOfRequests}}</sup>\n" +
    "            \n" +
    "            <div tether class=cui-action__popover target=#cui-applications__requested-apps attachment=\"top middle\" targetattachment=\"bottom left\" offset=\"-20px 50px\" ng-if=newAppRequest.requestPopover constraints=\"[{to:'scrollParent',attachment:'together',pin:['right']}]\">\n" +
    "              <span class=cui-action__popover-title>{{'collected-items-for-request' | translate}}</span>\n" +
    "              <div class=cui-action__popover-section>\n" +
    "                <span ng-if=\"newAppRequest.appsBeingRequested.length===0\">{{'no-selected-apps' | translate}}<br></span>\n" +
    "                <ul ng-if=\"newAppRequest.appsBeingRequested.length > 0\">\n" +
    "                    <li ng-repeat=\"application in newAppRequest.appsBeingRequested\">{{application.name | cuiI18n}}</li>\n" +
    "                </ul>\n" +
    "              </div>\n" +
    "              <span ng-if=\"newAppRequest.appsBeingRequested.length > 0\" class=cui-action__popover-button ui-sref=applications.reviewRequest>{{'submit-request' | translate}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=cui-applications__main-container>\n" +
    "        <div>\n" +
    "            <div class=cui-applications__search-options>\n" +
    "                <div class=cui-input-button>\n" +
    "                    <input type=text class=cui-input-button__input ng-model=newAppRequest.search placeholder=\"{{'search-by-app-name' | translate}}\" on-enter=\"newAppRequest.searchCallback\">\n" +
    "                    <button class=cui-input-button__button ui-sref=applications.search({name:newAppRequest.search})>{{'go' | translate}}</button>\n" +
    "                </div>\n" +
    "                <div class=cui-applications__center-text>{{'or' | translate}}</div>\n" +
    "                <button class=\"cui-button cui-button--full-width\" ui-sref=applications.search>{{'browse-applications' | translate}}</button>\n" +
    "                \n" +
    "            </div>\n" +
    "            <div ng-if=!newAppRequest.loadingDone> \n" +
    "                <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n" +
    "                    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-repeat=\"category in newAppRequest.categories\" ng-if=newAppRequest.loadingDone>\n" +
    "                \n" +
    "                <div class=cui-applications__categories ui-sref=\"applications.search({category:'{{ category | cuiI18n }}' })\">\n" +
    "                    <h4 class=cui-applications__category>{{ category | cuiI18n }}</h4>\n" +
    "                    <svg xmlns=http://www.w3.org/2000/svg class=\"cui-icon cui-icon--light-grey\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "                      <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#chevron18></use>\n" +
    "                    </svg>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/new-request&review/review.html',
    "<div class=\"class-toggle cui-modal\" ng-if=\"applicationReview.success\" toggled-class=\"cui-modal--hide\" ng-click=\"toggleClass()\">\n" +
    "    <div class=\"cui-modal__pane\">\n" +
    "        <div class=\"cui-modal__icon\">\n" +
    "            <cui-icon cui-svg-icon=\"cui:check-with-border\" class=\"cui-modal__icon\"></cui-icon>\n" +
    "        </div>\n" +
    "        <span class=\"cui-modal__primary-message\">{{'cui-success' | translate}}</span>\n" +
    "        <span class=\"cui-modal__secondary-message\">{{'your-app-request-in-review' | translate}}</span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"code-info\">Code for this page can be found <a class=\"cui-link\" href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/mew-request&review\" target=\"blank\">here</a> and the layout styles <a href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss\" class=\"cui-link\" target=\"blank\">here</a></div>\n" +
    "<div class=\"cui-applications__review\">\n" +
    "    <div class=\"cui-action\">\n" +
    "        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ng-click=\"base.goBack()\">< {{'new-request' | translate}}</div>\n" +
    "        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ng-click=\"base.goBack()\">< {{applicationSearch.category}}</span>\n" +
    "        <div class=\"cui-input-button cui-input-button--alt-bg\">\n" +
    "            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" ng-keypress=\"applicationSearch.listenForEnter($event)\" placeholder=\"{{'filter-list' | translate}}\"/>\n" +
    "            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n" +
    "        </div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationReview.numberOfRequests != 0}\"preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n" +
    "            </svg>\n" +
    "            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationReview.numberOfRequests != 0}\">{{applicationReview.numberOfRequests}}</sup>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-applications__main-container\" style=\"position:relative\">\n" +
    "        <div class=\"cui-loading__container\" ng-if=\"applicationReview.attempting\">\n" +
    "          <div class=\"cui-loading cui-loading--center\" ></div>\n" +
    "        </div>\n" +
    "            <div>\n" +
    "                <h3 class=\"h4 h4--bold\">{{'requested-items' | translate}}:</h3>\n" +
    "                <div class=\"cui-applications__review-apps\">\n" +
    "                 <div class=\"cui-tile--headless\" ng-repeat=\"applicationGroup in applicationReview.appRequests\">\n" +
    "                    <div ng-repeat=\"application in applicationGroup\" ng-if=\"application.name\"> <!-- Put the flex wrapper here @shane -->\n" +
    "                        <div class=\"cui-media\">\n" +
    "                          <!-- Image container to be added when images are available\n" +
    "                          <div class=\"cui-media__image-container\">\n" +
    "                            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-media__image\">\n" +
    "                              <use xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#user\"></use>\n" +
    "                            </svg>\n" +
    "                          </div> -->\n" +
    "                          <div class=\"cui-media__body\">\n" +
    "                            <h3 class=\"cui-media__title\">{{application.name | cuiI18n}}</h3>\n" +
    "                            <span class=\"cui-media__content\">{{'owning-org' | translate}}: {{application.owningOrganization.name}}</span>\n" +
    "                          </div>\n" +
    "                        </div>\n" +
    "                        <!-- Terms and conditions is not provided by the API, leaving it out for now -->\n" +
    "                        <div class=\"cui-applications__review-text-input\">\n" +
    "                            <label class=\"cui-text-area__label\">{{'request-reason' | translate}}</label>\n" +
    "                            <span class=\"cui-error h6\" ng-if=\"application.reasonRequired\">{{'you-must-enter-a-reason' | translate}}</span>\n" +
    "                            <textarea class=\"cui-text-area\" ng-model=\"application.reason\" ng-class=\"{'<!-- @shane textarea invalid class here -->' : application.reasonRequired}\"></textarea>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                </div>\n" +
    "                <div class=\"cui-applications__submit-options\">\n" +
    "                    <a class=\"cui-link\" ng-click=\"base.goBack()\">{{'cui-cancel' | translate}}</a>\n" +
    "                    <button class=\"cui-button\" ng-click=\"applicationReview.submit()\">\n" +
    "                        <span ng-if=\"!applicationReview.error\">{{'submit-request' | translate}}</span>\n" +
    "                        <span ng-if=\"applicationReview.error===true\">{{'cui-error-try-again' | translate}}</span>\n" +
    "                    </button>\n" +
    "                </div>\n" +
    "                <!-- @shane ng-if=\"applicationReview.attempting\" is when submit gets pressed and it's trying to submit the requests  ^ put a spinner on the button-->\n" +
    "                <!-- if there's an error ng-if=\"applicationReview.error\" -->\n" +
    "                <!-- if it's successful ng-if=\"applicationReview.success\" -->\n" +
    "\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/org-applications/org-applications.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/org-applications target=blank>here</a></div>\n" +
    "\n" +
    "\n" +
    "<div class=cui-action>\n" +
    "  <span class=cui-action__title>\n" +
    "    <a ui-sref=applications.orgApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'organization-applications' | translate}}</a> | \n" +
    "    <a ui-sref=applications.myApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'my-applications' | translate}}</a>\n" +
    "  </span>\n" +
    "  <div class=cui-action__actions>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"orgApplications.sortClicked =! orgApplications.sortClicked\" id=sort-button off-click=\"orgApplications.sortClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'sort' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.sortClicked>\n" +
    "        <p ng-click=\"orgApplications.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n" +
    "        <p ng-click=\"orgApplications.sort('date'); \">{{'cui-by-date-added' | translate}}</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"orgApplications.refineClicked =! orgApplications.refineClicked\" id=refine-button off-click=\"orgApplications.refineClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'refine' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.refineClicked>\n" +
    "        <p ng-click=\"orgApplications.parseAppsByStatus('all')\">{{'all' | translate}} ({{orgApplications.statusCount[0]}})</p>\n" +
    "        <div ng-repeat=\"status in orgApplications.categoryList\" ng-if=\"orgApplications.statusCount[$index+1]!==0\">\n" +
    "          <p ng-click=orgApplications.parseAppsByStatus(status)>{{status | translate}} ({{orgApplications.statusCount[$index+1]}})</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"orgApplications.categoriesClicked =! orgApplications.categoriesClicked\" id=categories-button off-click=\"orgApplications.categoriesClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>{{'categories' | translate}}</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.categoriesClicked>\n" +
    "        <p ng-click=\"orgApplications.parseAppsByCategory('all')\">{{'all' | translate}} ({{orgApplications.categoryCount[0]}})</p>\n" +
    "        <div ng-repeat=\"category in orgApplications.categoryList\">\n" +
    "          <p ng-click=orgApplications.parseAppsByCategory(category)>{{category| cuiI18n}} ({{orgApplications.categoryCount[$index+1]}})</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "      <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n" +
    "    </svg>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=cui-applications__main-container>\n" +
    "  \n" +
    "  <div class=cui-loading__container ng-if=orgApplications.loading>\n" +
    "    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if=!orgApplications.loading>\n" +
    "    <div class=\"cui-media cui-media--border\" ng-repeat=\"application in orgApplications.appList track by application.id\" ng-click=orgApplications.goToDetails(application)>\n" +
    "      <div class=cui-media__image-container>\n" +
    "        <a ng-href={{application.mangledUrl}} target=_blank><div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=application.name cui-avatar-cuii18n-filter cui-avatar=application.iconUrl></div></a>\n" +
    "      </div>\n" +
    "      <div class=\"cui-media__body cui-media__body--full\">\n" +
    "        <h3 class=cui-media__title ng-bind=\"application.name | cuiI18n\"></h3>\n" +
    "        <span class=cui-media__content ng-if=application.category> {{application.category | cuiI18n}}</span>\n" +
    "        <span class=cui-status ng-class=\"'cui-status--'+application.status\" ng-bind=\"application.status | lowercase\"></span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/search/search.html',
    "<div class=\"code-info\">Markup for this page can be found <a class=\"cui-link\" href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/search\" target=\"blank\">here</a> and the layout styles <a href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss\" class=\"cui-link\" target=\"blank\">here</a></div>\n" +
    "<div class=\"cui-applications__search\">\n" +
    "    <div class=\"cui-action\">\n" +
    "        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ui-sref=\"applications.newRequest\"><\n" +
    "            {{'categories' | translate}}</div>\n" +
    "        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ui-sref=\"applications.newRequest\">< {{applicationSearch.category}}</span>\n" +
    "        <div class=\"cui-input-button cui-input-button--alt-bg\">\n" +
    "            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" placeholder=\"{{'filter-list' | translate}}\" on-enter=\"applicationSearch.parseAppsByCategoryAndName\"/>\n" +
    "            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n" +
    "        </div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg ng-click=\"applicationSearch.requestPopover=!applicationSearch.requestPopover\" off-click=\"applicationSearch.requestPopover=false\" xmlns=\"http://www.w3.org/2000/svg\" id=\"cui-applications__requested-apps\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationSearch.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n" +
    "            </svg>\n" +
    "            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationSearch.numberOfRequests != 0}\">{{applicationSearch.numberOfRequests}} </sup>\n" +
    "\n" +
    "            <div tether class=\"cui-action__popover\" target=\"#cui-applications__requested-apps\" attachment=\"top middle\" targetAttachment=\"bottom left\" offset=\"-20px 50px\" ng-if=\"applicationSearch.requestPopover\">\n" +
    "              <span class=\"cui-action__popover-title\">{{'collected-items-for-request' | translate}}</span>\n" +
    "              <div class=\"cui-action__popover-section\">\n" +
    "                <span ng-if=\"applicationSearch.numberOfRequests === 0\">{{'no-selected-apps' | translate}}<br/></span>\n" +
    "                <ul ng-if=\"applicationSearch.numberOfRequests > 0\">\n" +
    "                    <li ng-repeat=\"(key,value) in applicationSearch.packageRequests\">{{value.name | cuiI18n}}</li>\n" +
    "                </ul>\n" +
    "              </div>\n" +
    "              <span ng-if=\"applicationSearch.numberOfRequests > 0\" class=\"cui-action__popover-button\" ui-sref=\"applications.reviewRequest\">{{'submit-request' | translate}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-applications__main-container\">\n" +
    "        <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.doneLoading\">\n" +
    "            <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n" +
    "        </div>\n" +
    "        <cui-expandable class=\"cui-expandable\" ng-repeat=\"application in applicationSearch.list track by application.id\" ng-if=\"applicationSearch.doneLoading\" transition-speed=\"150\">\n" +
    "            <cui-expandable-title class=\"cui-expandable__title cui-expandable__title--flex\" >\n" +
    "                <!-- @Shane, right now the above ng-click triggers when you click the checkbox, move that ng-click wherever you see appropriate -->\n" +
    "                <!-- application image -->\n" +
    "                <div class=\"cui-applications__expandable-info\" ng-click=\"toggleExpand();!applicationSearch.detailsLoadingDone[application.id] && applicationSearch.getRelatedAndBundled($index,application);\">\n" +
    "                    <h3 class=\"cui-expandable__title-left\">{{application.name | cuiI18n}}</h3>\n" +
    "                    <span class=\"cui-expandable__title-middle\" ng-if=\"application.orgHasGrants\">{{'granted-to-my-org' | translate}}</span>\n" +
    "                    <div></div>\n" +
    "                </div>\n" +
    "                <!-- Not sure what the exclamation mark bubble means or what triggers it, but you can put it in here @Shane, I'll come back to this once we get an answer -->\n" +
    "                <!-- TODO Figure out above ^  (leave this so I can find it later)-->\n" +
    "                <div class=\"cui-expandable__title-end\">\n" +
    "                    <span class=\"cui-checkbox__container\">\n" +
    "                        <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[application.id]\" />\n" +
    "                        <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[application.id]=!applicationSearch.appCheckbox[application.id]; applicationSearch.toggleRequest(application)\"></label>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </cui-expandable-title>\n" +
    "            <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "                <div class=\"cui-expandable__body-pane\">\n" +
    "                    <span class=\"cui-expandable__body-close\" ng-click=\"collapse()\">\n" +
    "                        <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "                          <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "                        </svg>\n" +
    "                    </span>\n" +
    "                    <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.detailsLoadingDone[application.id]\"> <!-- @Shane, this loading seems to be overlapping the expandable title -->\n" +
    "                        <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n" +
    "                    </div>\n" +
    "                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.bundled.length!==0\">\n" +
    "                        <h4 class=\"cui-expandable__pane-title\">{{'bundled-applications' | translate}}</h4>\n" +
    "                        <div class=\"cui-expandable__pane-content\">\n" +
    "                            <span ng-repeat=\"bundledApp in application.details.bundled\" ng-if=\"application.details.bundled.length!==0\">\n" +
    "                                {{bundledApp.name | cuiI18n}}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.related.length!==0\">\n" +
    "                        <h4 class=\"cui-expandable__pane-title\">{{'related-applications' | translate}}</h4>\n" +
    "                        <div class=\"cui-expandable__pane-content\">\n" +
    "                            <span class=\"cui-expandable__pane-content-item\" ng-repeat=\"relatedApp in application.details.related\">\n" +
    "                                <span class=\"\">{{relatedApp.name | cuiI18n}} </span>\n" +
    "                                <span class=\"cui-checkbox__container\">\n" +
    "                                    <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[relatedApp.id]\" />\n" +
    "                                    <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[relatedApp.id]=!applicationSearch.appCheckbox[relatedApp.id]; applicationSearch.toggleRequest(relatedApp)\"></label>\n" +
    "                                </span>\n" +
    "                            </span>\n" +
    "\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </cui-expandable-body>\n" +
    "        </cui-expandable>\n" +
    "        <div class=\"cui-applications__search-button\">\n" +
    "            <button class=\"cui-button\" ng-class=\"{'cui-button--error' : applicationSearch.numberOfRequests===0}\" ng-click=\"applicationSearch.numberOfRequests != 0 && applicationSearch.saveRequestsAndCheckout()\">{{'review-request' | translate}}</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('assets/app/base/base.html',
    ""
  );


  $templateCache.put('assets/app/common-templates/messages.html',
    "<div class=cui-error__message ng-message=required>{{'cui-this-field-is-required' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=minlength>{{'cui-this-field-needs-to-be-longer' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=tosRequired>{{'cui-you-need-to-agree-to-toc' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=email>{{'cui-this-is-not-valid-email' | translate}}</div>"
  );


  $templateCache.put('assets/app/common-templates/password-validation.html',
    "<p>{{'passwords-must' | translate}}</p>\n" +
    "\n" +
    "<div class=cui-error__message ng-message=lowercaseNotAllowed>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.lowercaseNotAllowed}\"></div>\n" +
    "    {{'lowercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=uppercaseNotAllowed>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.uppercaseNotAllowed}\"></div>\n" +
    "    {{'uppercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=numberNotAllowed>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.numberNotAllowed}\"></div>\n" +
    "    {{'numbers-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=specialNotAllowed>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass':!errors.specialNotAllowed}\"></div>\n" +
    "    {{'special-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=disallowedWords>\n" +
    "    <div class=cui-error__status></div> \n" +
    "    {{'words-not-allowed' | translate:errors}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=disallowedChars>\n" +
    "    <div class=cui-error__status></div>\n" +
    "    {{'chars-not-allowed' | translate:errors}}\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.length}\"></div>\n" +
    "        {{'password-length' | translate:policies}}<br><br>\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-error__message ng-if=\"policies.requiredNumberOfCharClasses>1\">{{'password-rules' | translate:policies}}<br></div>\n" +
    "\n" +
    "<div class=cui-error__message ng-if=policies.allowLowerChars>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.lowercase}\"></div>\n" +
    "    {{'password-lowercase' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-if=policies.allowUpperChars>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.uppercase}\"></div>\n" +
    "    {{'password-uppercase' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-if=policies.allowNumChars>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.number}\"></div>\n" +
    "    {{'password-number' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-if=policies.allowSpecialChars>\n" +
    "    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.special}\"></div>\n" +
    "    {{'password-special' | translate}}\n" +
    "</div>"
  );


  $templateCache.put('assets/app/empty/empty.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/invitations/invite/users.invite.html',
    "<h2 ng-click=base.goBack()>Go Back</h2>\n" +
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>Invite User</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "      <cui-wizard class=cui-wizard step=1 clickable-indicators minimum-padding=30>\n" +
    "        <indicator-container class=indicator-container></indicator-container>\n" +
    "        <step title=\"User details\">\n" +
    "          <form name=invite novalidate>\n" +
    "\n" +
    "            \n" +
    "            <label for=user-email>{{'cui-email' | translate}}</label>\n" +
    "            <div class=cui-error ng-messages=invite.email.$error ng-if=invite.email.$touched>\n" +
    "              <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "            </div>\n" +
    "            <input type=text name=email class=cui-input ng-required=true ng-model=\"usersInvite.userToInvite.email\">\n" +
    "\n" +
    "            <div class=cui-wizard__field-row>\n" +
    "              \n" +
    "              <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "                <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "                <div class=cui-error ng-messages=invite.firstName.$error ng-if=invite.firstName.$touched>\n" +
    "                  <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "                </div>\n" +
    "                <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersInvite.userToInvite.name.given\">\n" +
    "              </div>\n" +
    "\n" +
    "              \n" +
    "              <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "                <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "                <div class=cui-error ng-messages=invite.lastName.$error ng-if=invite.lastName.$touched>\n" +
    "                  <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "                </div>\n" +
    "                <input type=text ng-model=usersInvite.userToInvite.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            \n" +
    "            <label for=custom-message>Custom message</label>\n" +
    "            <textarea ng-model=usersInvite.message class=cui-input style=resize:vertical;height:100px></textarea>\n" +
    "\n" +
    "        </form>\n" +
    "\n" +
    "        <div class=cui-wizard__controls>\n" +
    "          <button class=cui-wizard__next ng-click=usersInvite.saveUser(invite) ng-class=\"invite.$invalid? 'cui-wizard__next--error' : usersInvite.sent? 'success' : usersInvite.fail? 'fail' : ''\" style=position:relative>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=\"usersInvite.sending && !usersInvite.sent\"></div>\n" +
    "            <span ng-if=\"(!usersInvite.sending && !usersInvite.sent && !usersInvite.fail)\">Send invite</span>\n" +
    "            <span ng-if=usersInvite.sent>Invite sent!</span>\n" +
    "            <span ng-if=usersInvite.fail>Error! Try again?</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </step>\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/invitations/search/users.invitations.search.html',
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>User Invitations</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "        <div class=cui-loading__container ng-if=usersInvitations.listLoading>\n" +
    "            <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "        </div>\n" +
    "        <a ui-sref=users.invite class=cui-link>Invite new user</a><br><br>\n" +
    "\n" +
    "        <div class=cui-expandable__container>\n" +
    "            <div class=cui-expandable__tr>\n" +
    "              <span class=cui-expandable__td>Invitation ID</span>\n" +
    "              <span class=cui-expandable__td>Email</span>\n" +
    "              <span class=cui-expandable__td></span>\n" +
    "            </div>\n" +
    "            <cui-expandable class=cui-expandable ng-repeat=\"invitation in usersInvitations.list\">\n" +
    "                <cui-expandable-title class=cui-expandable__title ng-click=usersInvitations.getInfo(invitation.invitor.id,invitation.invitee.id,$index);toggleExpand()>\n" +
    "                    <div class=cui-expandable__tr>\n" +
    "                        <span class=cui-expandable__td>{{invitation.id}}</span>\n" +
    "                        <span class=cui-expandable__td>{{invitation.email}}</span>\n" +
    "                        <span class=cui-expandable__td><a class=cui-link>View</a></span>\n" +
    "                    </div>\n" +
    "                </cui-expandable-title>\n" +
    "                <cui-expandable-body class=cui-expandable__body style=position:relative>\n" +
    "                    <div class=cui-loading ng-if=\"usersInvitations.invitorLoading[$index] || usersInvitations.inviteeLoading[$index]\"></div>\n" +
    "                    \n" +
    "                    <div ng-if=\"!usersInvitations.invitorLoading[$index] && !usersInvitations.inviteeLoading[$index]\">\n" +
    "                        <ul>\n" +
    "                            <li class=cui-expandable__review-item>\n" +
    "                                Invitor: {{usersInvitations.invitor[$index].name.given}} {{usersInvitations.invitor[$index].name.surname}}\n" +
    "                            </li>\n" +
    "                            <li class=cui-expandable__review-item>\n" +
    "                                Invitee: {{usersInvitations.invitee[$index].name.given}} {{usersInvitations.invitee[$index].name.surname}} ({{invitation.email}})\n" +
    "                            </li>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "                    \n" +
    "                </cui-expandable-body>\n" +
    "            </cui-expandable>\n" +
    "\n" +
    "    </div>\n" +
    "</div></div>"
  );


  $templateCache.put('assets/app/misc/invitations/users.invitations.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/misc.404.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-page-not-found' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-page-not-found' | translate}}.</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "      	<svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#ask-file></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-page-not-found-content' | translate}}</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/misc.notAuth.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-access-denied' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-access-denied' | translate}}.</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#not-authorized></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-access-denied-content' | translate}}</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.pendingStatus.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-registration-status' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-pending-status' | translate}}...</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#status-pending></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-pending-status-content' | translate}}</p>\n" +
    "			<p>{{'cui-thank-you' | translate}}!</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.success.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-request-submitted' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-success' | translate}}!</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#success></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-success-content' | translate}}</p>\n" +
    "			<p>{{'cui-check-your' | translate}} <a href=\"\">{{'cui-registration-status-lower' | translate}}</a>.</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/users/activate/users.activate.html',
    ""
  );


  $templateCache.put('assets/app/misc/users/search/users.search.html',
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>Organization Users</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "        <div class=cui-loading__container ng-if=usersSearch.listLoading>\n" +
    "            <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "        </div>\n" +
    "        <input class=cui-input placeholder=\"{{'cui-search-user-name' | translate}}\" ng-model=\"usersSearch.search['name.given']\">\n" +
    "        <input class=cui-input placeholder=\"{{'cui-num-results-page' | translate}}\" ng-model=usersSearch.search.pageSize>\n" +
    "        <input class=cui-input placeholder=\"{{'page' | translate}}\" ng-model=usersSearch.search.page>\n" +
    "        <table class=\"cui-table cui-table--borderless\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>User ID</th>\n" +
    "                    <th>Name</th>\n" +
    "                    <th>Title</th>\n" +
    "                    <th></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"user in usersSearch.list\">\n" +
    "                    <td>{{user.id}}</td>\n" +
    "                    <td>{{user.name.given}} {{user.name.surname}}</td>\n" +
    "                    <td>{{user.title}}</td>\n" +
    "                    <td>{{user.status}}\n" +
    "                        <div ng-if=\"user.status==='pending'\"><a class=cui-link ui-sref=\"users.activate({id: user.id})\">Activate!</a></div>\n" +
    "                    </td>\n" +
    "                    <td><a class=cui-link ui-sref=\"profile.user({id: user.id})\">Edit</a></td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/users/users.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/organization/directory/directory.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/organization/directory/organization.directory.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/organization/directory target=blank>here</a>.</div>\n" +
    "\n" +
    "<div class=cui-organization>\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>\n" +
    "      <a ui-sref=organization.profile({id:orgDirectory.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n" +
    "      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n" +
    "      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n" +
    "      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n" +
    "    </span>\n" +
    "    <div class=cui-action__actions>\n" +
    "      <div class=cui-action__action-container id=invitation-button ng-click=\"orgDirectory.invitationClicked=!orgDirectory.invitationClicked\" off-click=\"orgDirectory.invitationClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n" +
    "        </svg>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.invitationClicked>\n" +
    "          <p>{{'user' | translate}}</p>\n" +
    "          <p>{{'cui-org' | translate}}</p>\n" +
    "          <p>{{'top-level-orgs' | translate}}</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>{{orgDirectory.organization.name}}</span>\n" +
    "    <div class=cui-action__actions>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"orgDirectory.sortClicked=!orgDirectory.sortClicked\" id=sort-button off-click=\"orgDirectory.sortClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>{{'sort' | translate}}</span>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.sortClicked>\n" +
    "          <p ng-click=\"orgDirectory.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n" +
    "          <p ng-click=\"orgDirectory.sort('date')\">{{'cui-by-date-added' | translate}}</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"orgDirectory.refineClicked=!orgDirectory.refineClicked\" id=refine-button off-click=\"orgDirectory.refineClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>{{'refine' | translate}}</span>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.refineClicked>\n" +
    "          <p ng-click=\"orgDirectory.parseUsersByStatus('all')\">{{'all' | translate}} ({{orgDirectory.statusCount[0]}})</p>\n" +
    "          <div ng-repeat=\"status in orgDirectory.statusList\" ng-if=\"myApplications.statusCount[$index+1]!==0\">\n" +
    "            <p ng-click=orgDirectory.parseUsersByStatus(status)>{{status | translate}} ({{orgDirectory.statusCount[$index+1]}})</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"orgDirectory.organizationsClicked=!orgDirectory.organizationsClicked\" id=organizations-button off-click=\"orgDirectory.organizationsClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#nine10></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>{{'organizations' | translate}}</span>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#organizations-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.organizationsClicked>\n" +
    "          <div ng-repeat=\"organization in orgDirectory.organizationList | orderBy:'name' track by organization.id\">\n" +
    "            <p ng-if=\"organization.id!==orgDirectory.organization.id\" ng-click=\"orgDirectory.getOrgMembers(organization.id, organization.name)\">{{organization.name}}</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-organization__main-container>\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=orgDirectory.loading>\n" +
    "      <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <table class=\"cui-table cui-table--borderless\">\n" +
    "      <thead>\n" +
    "        <tr>\n" +
    "          <th>{{'cui-name' | translate}}</th>\n" +
    "          <th></th>\n" +
    "          <th>{{'userID' | translate}}</th>\n" +
    "          <th>{{'cui-registered' | translate}}</th>\n" +
    "          <th>{{'status' | translate}}</th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "        <tr ng-repeat=\"user in orgDirectory.userList track by user.id\" ui-sref=directory.userDetails({id:user.id})>\n" +
    "          <th><div class=cui-media__image cui-avatar cui-avatar-names=\"[user.name.given, user.name.surname]\" cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5></div></th>\n" +
    "          <th><span>{{user.name.given}} {{user.name.surname}}</span></th>\n" +
    "          <th>{{user.username}}</th>\n" +
    "          <th>{{user.creation | date:base.appConfig.dateFormat}}</th>\n" +
    "          <th>{{user.status | translate}}</th>\n" +
    "        </tr>\n" +
    "      </tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/organization/directory/user-details/directory.userDetails.html',
    "<div class=code-info>**UPDATE THIS REMINDER*** Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/organization/directory target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/organization.scss class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-organization>\n" +
    "  \n" +
    "  <div class=cui-loading__container ng-if=orgDirectory.loading>\n" +
    "    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>\n" +
    "      <a ui-sref=organization.profile class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n" +
    "      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n" +
    "      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a>\n" +
    "    </span>\n" +
    "    <div class=cui-action__actions>\n" +
    "      <div class=cui-action__action-container>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "    <div class=\"cui-media [modifier class]\">\n" +
    "        <div class=cui-media__image-container>\n" +
    "            <svg xmlns=http://www.w3.org/2000/svg class=cui-media__image>\n" +
    "                <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "        <div class=cui-profile>\n" +
    "            \n" +
    "            <span class=cui-profile__user-name>{{'cui-name' | translate}}: {{userProfile.user.name.given}} {{userProfile.user.name.surname}}</span>\n" +
    "            \n" +
    "            <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n" +
    "            <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n" +
    "\n" +
    "            <span>\n" +
    "                <button class=cui-button>Suspend</button>\n" +
    "                <button class=cui-button>Password Reset</button>\n" +
    "                <button class=cui-button>New Grants</button>\n" +
    "		    </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <div class=cui-action__actions>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"userDetails.profileRolesSwitch=true\" id=profile-button off-click=\"\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#profile></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>Profile</span>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"userDetails.profileRolesSwitch=false\" id=roles-button>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#help></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>Roles</span>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"\" id=sort-button off-click=\"\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>Sort</span>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=\"\">\n" +
    "          <p ng-click=\"\">{{'cui-alphabetically' | translate}}</p>\n" +
    "          <p ng-click=\"\">{{'cui-by-date-added' | translate}}</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-action__action-container ng-click=\"\" id=categories-button off-click=\"\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n" +
    "        </svg>\n" +
    "        <span class=cui-action__action-label>Categories</span>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=\"\">\n" +
    "          <p ng-click=\"\">TODO!</p>\n" +
    "          <div ng-repeat=\"\">\n" +
    "            <p ng-click=\"\">TODO!</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-organization__main-container>\n" +
    "    \n" +
    "		<div class=cui-users__info-block ng-if=userDetails.profileRolesSwitch>\n" +
    "    	\n" +
    "     	<div ng-include=\"'assets/app/organization/directory/user-details/sections/userDetails.profile.html'\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-users__info-block ng-if=!userDetails.profileRolesSwitch>\n" +
    "    	\n" +
    "     	<div ng-include=\"'assets/app/organization/directory/user-details/sections/userDetails.roles.html'\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/organization/directory/user-details/sections/userDetails.apps.html',
    "<p>Apps Section</p>"
  );


  $templateCache.put('assets/app/organization/directory/user-details/sections/userDetails.history.html',
    "<p>History Section</p>"
  );


  $templateCache.put('assets/app/organization/directory/user-details/sections/userDetails.profile.html',
    "<ng-form name=profile>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>Profile Section TODO</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=\"\">{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=!toggled>\n" +
    "\n" +
    "        \n" +
    "        <h3 class=cui-media__title>{{'cui-name' | translate}}: {{userProfile.user.name.given}} {{userProfile.user.name.surname}}</h3>\n" +
    "        \n" +
    "        <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n" +
    "        <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n" +
    "\n" +
    "\n" +
    "        \n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <div class=cui-users__profile>\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/basic-info.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/password.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/challenge-questions.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/timezone-language.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/address.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/phone-fax.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/organization/directory/user-details/sections/userDetails.roles.html',
    "<ng-form name=profile>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>Roles Section TODO</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=\"\">{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/organization/hierarchy/organization.hierarchy.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/organization/hierarchy target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/organization.scss class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-organization>\n" +
    "  \n" +
    "  <div class=cui-loading__container ng-if=orgHierarchy.loading>\n" +
    "    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>\n" +
    "      <a ui-sref=organization.profile class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n" +
    "      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n" +
    "      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n" +
    "      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n" +
    "    </span>\n" +
    "    <div class=cui-action__actions>\n" +
    "      <div class=cui-action__action-container id=invitation-button ng-click=\"orgHierarchy.invitationClicked=!orgHierarchy.invitationClicked\" off-click=\"orgHierarchy.invitationClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n" +
    "        </svg>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgHierarchy.invitationClicked>\n" +
    "          <p>{{'user' | translate}}</p>\n" +
    "          <p>{{'cui-org' | translate}}</p>\n" +
    "          <p>{{'top-level-orgs' | translate}}</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>{{orgHierarchy.organization.name}}</span>\n" +
    "    <div class=cui-action__actions>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-organization__main-container>\n" +
    "    <p>API Blocker: Get Organization Hierarchy</p>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/organization/organization.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/organization/profile/organization.profile.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/organization/profile target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/organization.scss class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-organization>\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>\n" +
    "      <a ui-sref=organization.profile({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n" +
    "      <a ui-sref=organization.hierarchy({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n" +
    "      <a ui-sref=organization.directory({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n" +
    "      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n" +
    "    </span>\n" +
    "    <div class=cui-action__actions>\n" +
    "      <div class=cui-action__action-container id=invitation-button ng-click=\"orgProfile.invitationClicked =! orgProfile.invitationClicked\" off-click=\"orgProfile.invitationClicked=false\">\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n" +
    "        </svg>\n" +
    "        \n" +
    "        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgProfile.invitationClicked>\n" +
    "          <p>{{'user' | translate}}</p>\n" +
    "          <p>{{'cui-org' | translate}}</p>\n" +
    "          <p>{{'top-level-orgs' | translate}}</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-organization__main-container>\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=orgProfile.loading>\n" +
    "        <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div ng-if=!orgProfile.loading>\n" +
    "      <h3 class=cui-organization__page-title>{{orgProfile.organization.name}}</h3>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-field-val cui-field-val--stack cui-organization__info-block\">\n" +
    "      <h4 class=cui-field-val__field ng-if=orgProfile.securityAdmins>{{'cui-admins' | translate}}</h4>\n" +
    "      <div class=cui-organization__admin-block-wrapper ng-if=orgProfile.securityAdmins>\n" +
    "        <div class=cui-organization__admin-block ng-repeat=\"admin in orgProfile.securityAdmins\">\n" +
    "          \n" +
    "          <span class=cui-field-val__field>{{'cui-name' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val>{{admin.name.given}} {{admin.name.surname}}</span><br>\n" +
    "          \n" +
    "          <span class=cui-field-val__field>{{'id' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val>{{admin.username}}</span><br>\n" +
    "          \n" +
    "          <span class=cui-field-val__field>{{'title' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val>{{admin.title}}</span><br>\n" +
    "          \n" +
    "          <span class=cui-field-val__field ng-if=admin.phones>{{'cui-phone' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val ng-if=admin.phones>{{admin.phones[0].number}}</span><br>\n" +
    "          \n" +
    "          <span class=cui-field-val__field>{{'cui-email' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val>{{admin.email}}</span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=\"cui-field-val cui-field-val--stack cui-organization__info-block\">\n" +
    "      <h4 class=cui-field-val__field>{{'cui-address' | translate}}: </h4>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].streets[0]}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].city}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].state}}, {{orgProfile.organization.addresses[0].postal}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.phones[0].number}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-organization__info-block>\n" +
    "        <h4 class=cui-field-val__field>{{'cui-info' | translate}}: </h4>\n" +
    "        <div>\n" +
    "          <span>{{'url' | translate}}: </span>\n" +
    "          <span class=cui-field-val__val><a ng-href={{orgProfile.organization.url}}>{{orgProfile.organization.url}}</a></span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div></div>"
  );


  $templateCache.put('assets/app/organization/roles/organization.roles.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/organization/roles target=blank>here</a>.</div>\n" +
    "\n" +
    "<div class=cui-organization>\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title>\n" +
    "      <a ui-sref=organization.profile({id:orgDirectory.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n" +
    "      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n" +
    "      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n" +
    "      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-organization__main-container>\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=orgRoles.loading>\n" +
    "      <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <p>Organization Roles Page</p>\n" +
    "\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.login.html',
    "<form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.username\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newDivision.passwordPolicies\">\n" +
    "				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.passwordRe\" match=\"newDivision.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newDivision.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions1\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newDivision.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions2\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.organization.html',
    "<form name=\"organizationSelect\" novalidate>\n" +
    "  <p>{{'cui-all-organizations' | translate}}</p>\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"newDivision.orgSearch.name\">\n" +
    "\n" +
    "  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in newDivision.organizationList\">\n" +
    "    <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "      {{organization.name}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "    \n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <p>{{organization.id}}</p>\n" +
    "      <p>{{organization.url}}</p>\n" +
    "      <p>{{organization.phones[0].number}}</p>\n" +
    "\n" +
    "      <div class=\"cui-wizard__controls\">\n" +
    "        <button class=\"cui-wizard__next\"  ng-click=\"next(); $parent.newDivision.organizationSelect.organization = organization\">{{'cui-select-org' | translate}}</button>\n" +
    "      </div>\n" +
    "    </cui-expandable-body>\n" +
    "  </cui-expandable>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.review.html',
    "<!-- User Information -->\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "  	{{'cui-user-information' | translate}}\n" +
    "    <span class=\"chevron\">></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "  	<!-- First Name -->\n" +
    "  	<inline-edit label=\"cui-first-name\" model=\"newDivision.user.name.given\"></inline-edit>\n" +
    "		<!-- Last Name -->\n" +
    "		<inline-edit label=\"cui-last-name\" model=\"newDivision.user.name.surname\"></inline-edit>\n" +
    "		<!-- Email -->\n" +
    "		<inline-edit label=\"cui-email\" model=\"newDivision.user.email\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit type=\"auto-complete\" model=\"newDivision.user.addresses[0].country\" display=\"newDivision.user.addresses[0].country.title || newDivision.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newDivision.user.addresses[0].country\" model=\"newDivision.user.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newDivision.user.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newDivision.user.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newDivision.user.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newDivision.user.addresses[0].state\"></inline-edit>\n" +
    "	  <!-- Postal -->\n" +
    "	  <inline-edit label=\"cui-postal\" model=\"newDivision.user.addresses[0].postal\"></inline-edit>\n" +
    "	  <!-- Phone Number -->\n" +
    "	  <inline-edit label=\"cui-telephone\" model=\"newDivision.user.phones[0].number\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Organization Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "      {{'cui-organization-information' | translate}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <!-- Company/Division -->\n" +
    "      <inline-edit type=\"dropdown\" display=\"newDivision.organizationSelect.organization.name\" label=\"cui-org\" options=\"newDivision.organizationList\" options-expression=\"organization as organization.name for organization in options\" model=\"newDivision.organizationSelect.organization\"></inline-edit>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Sign In Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=\"chevron\">></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "    <!-- User ID -->\n" +
    "    <inline-edit label=\"cui-user-id\" model=\"newDivision.userLogin.username\"></inline-edit>\n" +
    "    <!-- Password -->\n" +
    "    <inline-edit label=\"cui-password\" model=\"newDivision.userLogin.password\"></inline-edit>\n" +
    "    <!-- Re-Enter Password -->\n" +
    "    <inline-edit label=\"cui-password-re\" model=\"newDivision.userLogin.passwordRe\"></inline-edit>\n" +
    "    <!-- Challenge Question 1 -->\n" +
    "    test\n" +
    "    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question1.question | cuiI18n\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions1\" options-expression=\"question as (question.question | cuiI18n) for question in options\" model=\"newDivision.userLogin.question1\"></inline-edit>\n" +
    "    <!-- Challenge Answer 1 -->\n" +
    "    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer1\"></inline-edit>\n" +
    "    <!-- Challenge Question 2 -->\n" +
    "    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newDivision.userLogin.question2\"></inline-edit>\n" +
    "    <!-- Challenge Answer 2 -->\n" +
    "    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer2\"></inline-edit>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.userProfile.html',
    "<form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newDivision.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newDivision.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"newDivision.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newDivision.emailRe name=emailRe class=cui-input ng-required=true match=\"newDivision.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=newDivision.user.addresses[0].country local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newDivision.user.addresses[0].country></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "   <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "    <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"{'cui-wizard__next--error':!user.$valid}\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</form>"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration.html',
    "<div class=code-info>Markup for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/angular-templates/registration/newDivision/division.registration target=blank>here</a> and the javascript <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/js/app/registration/newDivision class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.userProfile.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.organization.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.login.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.review.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.login.html',
    "<form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.username\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newTlo.passwordPolicies\">\n" +
    "				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.passwordRe\" match=\"newTlo.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newTlo.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions1\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newTlo.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions2\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.organization.html',
    "<form name=\"organization\" novalidate>\n" +
    "\n" +
    "  <!-- First Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Company/Division -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-name\">{{'cui-organization-name' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.name.$error\" ng-if=\"organization.name.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"name\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.name\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Phone -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-phone\">{{'cui-telephone' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.phone.$error\" ng-if=\"organization.phone.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"phone\" class=\"cui-input\" ng-model=\"newTLO.organization.phones[0].number\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Second Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Address 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-address1\">{{'cui-address' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.address1.$error\" ng-if=\"organization.address1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"address1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].streets[0]\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Address 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-address2\">{{'cui-address' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.address2.$error\" ng-if=\"organization.address2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"address2\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].streets[1]\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Third Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- City -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-city\">{{'cui-city' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.city.$error\" ng-if=\"organization.city.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"city\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].city\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- State/Province -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-state\">{{'cui-state' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.state.$error\" ng-if=\"organization.state.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"state\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].state\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Fourth Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Postal Code -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "    <label for=\"organization-postal\">{{'cui-postal' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.postal.$error\" ng-if=\"organization.postal.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"postal\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses.postal\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Country -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-country\">{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.country.$error\" ng-if=\"organization.country.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=\"country\" pause=\"100\" selected-object=\"newTLO.organization.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\" input-class=\"cui-input\" match-class=\"highlight\" auto-match=\"true\" field-required=\"newTLO.organization.addresses[0].country\">\n" +
    "        <input type=\"text\" name=\"country\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].country\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(organization)\" ng-class=\"(organization.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.review.html',
    "<!-- User Information -->\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-user-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- First Name -->\n" +
    "		<inline-edit label=\"cui-first-name\" model=\"newTLO.user.name.given\"></inline-edit>\n" +
    "		<!-- Last Name -->\n" +
    "		<inline-edit label=\"cui-last-name\" model=\"newTLO.user.name.surname\"></inline-edit>\n" +
    "		<!-- Email -->\n" +
    "		<inline-edit label=\"cui-email\" model=\"newTLO.user.email\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit type=\"auto-complete\" model=\"newTLO.user.addresses[0].country\" display=\"newTLO.user.addresses[0].country.title || newTLO.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newTLO.user.addresses[0].country\" model=\"newTLO.user.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newTLO.user.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newTLO.user.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newTLO.user.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newTLO.user.addresses[0].state\"></inline-edit>\n" +
    "		<!-- Postal -->\n" +
    "		<inline-edit label=\"cui-postal\" model=\"newTLO.user.addresses[0].postal\"></inline-edit>\n" +
    "		<!-- Phone Number -->\n" +
    "		<inline-edit label=\"cui-telephone\" model=\"newTLO.user.phones[0].number\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Organization Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-organization-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- Company/Division -->\n" +
    "		<inline-edit label=\"cui-organization-name\" model=\"newTLO.organization.name\"></inline-edit>\n" +
    "		<!-- Telephone -->\n" +
    "		<inline-edit label=\"cui-telephone\" model=\"newTLO.organization.phones[0].number\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newTLO.organization.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newTLO.organization.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newTLO.organization.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newTLO.organization.addresses[0].state\"></inline-edit>\n" +
    "		<!-- Postal -->\n" +
    "		<inline-edit label=\"cui-postal\" model=\"newTLO.organization.addresses[0].postal\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit label=\"cui-country\" model=\"newTLO.organization.addresses[0].country.title\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Sign In Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-sign-in-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- User ID -->\n" +
    "		<inline-edit label=\"cui-user-id\" model=\"newTLO.userLogin.username\"></inline-edit>\n" +
    "		<!-- Password -->\n" +
    "		<inline-edit label=\"cui-password\" model=\"newTLO.userLogin.password\"></inline-edit>\n" +
    "		<!-- Re-Enter Password -->\n" +
    "		<inline-edit label=\"cui-password-re\" model=\"newTLO.userLogin.passwordRe\"></inline-edit>\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question1.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions1\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question1\"></inline-edit>\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer1\"></inline-edit>\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question2\"></inline-edit>\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer2\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.userProfile.html',
    "<form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newTLO.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newTLO.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"newTLO.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newTLO.emailRe name=emailRe class=cui-input ng-required=true match=\"newTLO.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=newTLO.user.addresses[0].country local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newTLO.user.addresses[0].country></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "  <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration.html',
    "<div class=code-info>Markup for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/angular-templates/registration/newTopLevelOrg/topLevelOrg.registration target=blank>here</a> and the javascript <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/js/app/registration/newTopLevelOrg class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.userProfile.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.organization.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.login.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.review.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/registration.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/registration/userInvited/complete-registration-popover.html',
    "<div class=cui-popover-container--relative ng-if=usersRegister.showCovisintInfo off-click=\"usersRegister.showCovisintInfo = false\" off-click-if=usersRegister.showCovisintInfo>\n" +
    "  <div class=cui-styeguide__popover-container>\n" +
    "    <div class=\"cui-popover cui-popover--top\">\n" +
    "      <p>{{usersRegister.targetOrganization.name}}<br>\n" +
    "      {{usersRegister.targetOrganization.phones[0].number}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].streets[0]}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].city}}, {{usersRegister.targetOrganization.addresses[0].state}} \n" +
    "      {{usersRegister.targetOrganization.addresses[0].postal}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].country}}</p>\n" +
    "\n" +
    "      <p>{{'cui-inv-user-popover-info' | translate}}</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.applications.html',
    "<!-- No Organization Applications -->\n" +
    "<div ng-if=\"!usersRegister.applications.list\">\n" +
    "  {{'cui-org-no-applications' | translate}}\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(4)\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Organization Applications -->\n" +
    "<div ng-if=\"usersRegister.applications.list && (!usersRegister.applications.step || usersRegister.applications.step===1)\" ng-init=\"usersRegister.applications.step=1\">\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"usersRegister.applications.search\" ng-change=\"usersRegister.applications.searchApplications()\"/>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-repeat=\"application in usersRegister.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n" +
    "    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"usersRegister.applications.selected[$index]\" ng-true-value=\"'{{application.packageId}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"usersRegister.applications.updateNumberOfSelected(usersRegister.applications.selected[$index])\" style=\"margin-right:10px\"/>\n" +
    "    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n" +
    "    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-click=\"usersRegister.applications.process()===0? next() : usersRegister.applications.step=2\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Checkout Applications -->\n" +
    "<div ng-if=\"usersRegister.applications.step===2\">\n" +
    "  <span ng-click=\"usersRegister.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "  <ng-form name=\"selectApps\" class=\"application-review\">\n" +
    "    <div class=\"application-review__name application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-name' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-link application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-agreement application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"application in usersRegister.applications.processedSelected\" class=\"application-review__list\">\n" +
    "      <div class=\"application-review__name\">\n" +
    "        <span>{{application.name}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-link\">\n" +
    "        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-agreement\">\n" +
    "        <div class=\"cui-switch\">\n" +
    "          <input class=\"cui-switch__input\" ng-model=\"usersRegister.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n" +
    "          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n" +
    "            <div class=\"cui-switch__container\">\n" +
    "              <span class=\"cui-switch__checked-message\">Accept</span>\n" +
    "              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n" +
    "            </div>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </ng-form>\n" +
    "\n" +
    "  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && usersRegister.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n" +
    "  <div class=\"cui-wizard__controls\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-click=\"usersRegister.applications.step=usersRegister.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"usersRegister.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(4)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.login.html',
    "<ng-form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "  <!-- First Row -->\n" +
    "  <!-- User ID -->\n" +
    "  <label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "  <div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n" +
    "    <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "  </div>\n" +
    "  <input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.username\">\n" +
    "\n" +
    "  <!-- Second row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Password -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <div class=\"cui-input__password-holder\">\n" +
    "        <label>{{'cui-password' | translate}}</label>\n" +
    "        <div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "          <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "        </div>\n" +
    "        <input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.password\" ng-class=\"{'cui-input--error': usersRegister.password.$touched && usersRegister.password.$invalid}\" password-validation ng-model-options=\"{allowInvalid:true}\" ng-change=\"usersRegister.userLogin.hiddenPassword=base.generateHiddenPassword(usersRegister.userLogin.password)\">\n" +
    "        <div password-popover ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "          <div ng-messages-include=\"assets/app/common-templates/password-validation.html\"></div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Re-enter Password -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-password-re' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "        <div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.passwordRe\" match=\"usersRegister.userLogin.password\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Third row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Challenge Question 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <select ng-model=\"usersRegister.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions1\">\n" +
    "      </select>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Challenge Answer 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer1\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Fourth row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Challenge Question 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <select ng-model=\"usersRegister.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions2\">\n" +
    "      </select>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Challenge Answer 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer2\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(4)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.review.html',
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-user-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.given}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.surname}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-country' | translate}}: <span class=review-item__value>{{usersRegister.userCountry.title || usersRegister.userCountry}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[0] && usersRegister.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[0]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[1] && usersRegister.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[1]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].city && usersRegister.user.addresses[0].city!==''\">{{'cui-city' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].city}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].state && usersRegister.user.addresses[0].state!==''\">{{'cui-state' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].state}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].postal && usersRegister.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].postal}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.phones[0].number && usersRegister.user.phones[0].number!==''\">{{'cui-telephone' | translate}}: <span class=review-item__value>{{usersRegister.user.phones[0].number}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(2)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.username}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-password' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.hiddenPassword}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question1.question[0].text}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer1}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question2.question[0].text}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer2}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-application-selection' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.applications.processedSelected.length===0 || !usersRegister.applications.processedSelected.length\">\n" +
    "      <span class=cui-link ng-click=goToStep(3)>{{'no-applications-selected' | translate}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-repeat=\"application in usersRegister.applications.processedSelected\">{{application.name}}</div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=cui-wizard__controls>\n" +
    "  <button class=cui-wizard__next ng-click=\"userInvitedRegForm.$valid && usersRegister.submit()\" ng-class=\"(!userInvitedRegForm.$valid)? 'cui-wizard__next--error' : usersRegister.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n" +
    "    <div class=cui-loading--medium-ctr ng-if=usersRegister.submitting></div>\n" +
    "    <span ng-if=\"!usersRegister.submitting && usersRegister.success!=false\">{{'cui-submit' | translate}}</span>\n" +
    "    <span ng-if=\"usersRegister.success===false\">Error! Try again?</span>\n" +
    "  </button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.userProfile.html',
    "<ng-form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <p>{{\"cui-all-fields-required\" | translate}}. {{\"cui-complete-registration\" | translate}}\n" +
    "    <a href class=\"cui-link--medium-light cui-link--no-decoration\" ng-click=usersRegister.applications.toggleCovisintInfo()>{{usersRegister.targetOrganization.name}}\n" +
    "      <div ng-include=\"'assets/app/registration/userInvited/complete-registration-popover.html'\"></div>\n" +
    "    </a>\n" +
    "  </p>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersRegister.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersRegister.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=usersRegister.userCountry local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=usersRegister.userCountry></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "  <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "  <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(4)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/registration/userInvited target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 clickable-indicators minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "      <ng-form name=userInvitedRegForm novalidate>\n" +
    "\n" +
    "        \n" +
    "        <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.userProfile.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.login.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step step-title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.applications.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.review.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "      </ng-form>\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.applications.html',
    "<!-- If there's no applications in that organization -->\n" +
    "<div ng-if=\"!usersWalkup.applications.list\">\n" +
    "  Seems like your organization doesn't have any applications. You can always try again after logging in.\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(5)\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- If there's applications -->\n" +
    "<div ng-if=\"usersWalkup.applications.list && (!usersWalkup.applications.step || usersWalkup.applications.step===1)\" ng-init=\"usersWalkup.applications.step=1\">\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"usersWalkup.applications.search\" ng-change=\"usersWalkup.applications.searchApplications()\"/>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersWalkup.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-repeat=\"application in usersWalkup.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n" +
    "    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"usersWalkup.applications.selected[$index]\" ng-true-value=\"'{{application.id}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"usersWalkup.applications.updateNumberOfSelected(usersWalkup.applications.selected[$index])\" style=\"margin-right:10px\"/>\n" +
    "    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n" +
    "    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "  	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-click=\"usersWalkup.applications.process()===0? next() : usersWalkup.applications.step=2\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Checkout Applications -->\n" +
    "<div ng-if=\"usersWalkup.applications.list && usersWalkup.applications.step===2\">\n" +
    "  <span ng-click=\"usersWalkup.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersWalkup.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "  <ng-form name=\"selectApps\" class=\"application-review\">\n" +
    "    <div class=\"application-review__name application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-name' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-link application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-agreement application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"application in usersWalkup.applications.processedSelected\" class=\"application-review__list\">\n" +
    "      <div class=\"application-review__name\">\n" +
    "        <span>{{application.name}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-link\">\n" +
    "        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-agreement\">\n" +
    "        <div class=\"cui-switch\">\n" +
    "          <input class=\"cui-switch__input\" ng-model=\"usersWalkup.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n" +
    "          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n" +
    "            <div class=\"cui-switch__container\">\n" +
    "              <span class=\"cui-switch__checked-message\">Accept</span>\n" +
    "              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n" +
    "            </div>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </ng-form>\n" +
    "\n" +
    "  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && usersWalkup.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n" +
    "  <div class=\"cui-wizard__controls\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-click=\"usersWalkup.applications.step=usersWalkup.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"usersWalkup.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(5)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.login.html',
    "<ng-form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.username\" ng-class=\"{'cui-input--error' : userLogin.userID.$touched &&  userLogin.userID.$touched}\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input id=\"test-input\" type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation ng-model-options=\"{allowInvalid:true}\" ng-change=\"usersWalkup.userLogin.hiddenPassword=base.generateHiddenPassword(usersWalkup.userLogin.password)\">\n" +
    "				<!-- Password Rules Popover -->\n" +
    "				<div password-popover ng-messages=\"userLogin.password.$error\" ng-messages-multiple class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.passwordRe\" match=\"usersWalkup.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<cui-dropdown ng-model=\"usersWalkup.userLogin.question1\" class=\"cui-input\" return-value=\"question\" display-value=\"(question.question | cuiI18n)\" options=\"usersWalkup.userLogin.challengeQuestions1\">\n" +
    "			</cui-dropdown>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<!-- <select ng-model=\"usersWalkup.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as (question.question | cuiI18n) for question in usersWalkup.userLogin.challengeQuestions2\"> -->\n" +
    "			</select>\n" +
    "			<cui-dropdown ng-model=\"usersWalkup.userLogin.question2\" display-value=\"(question.question | cuiI18n)\" options=\"usersWalkup.userLogin.challengeQuestions2\" name=\"challenge2\" return-value=\"option.name\" class=\"cui-select\"></cui-dropdown>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(5)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.organization.html',
    "<ng-form name=\"organizationSelect\" novalidate>\n" +
    "  <p>{{'cui-all-organizations' | translate}}</p>\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"usersWalkup.orgSearch.name\">\n" +
    "\n" +
    "  <!-- Organization List Loading -->\n" +
    "  <div class=\"cui-loading__container--organization-list\" ng-if=\"usersWalkup.orgLoading\">\n" +
    "    <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in usersWalkup.organizationList | orderBy:'name' track by organization.id\" ng-if=\"!usersWalkup.orgLoading\">\n" +
    "    <cui-expandable-title class=\"cui-expandable__title cui-expandable__title--alt-layout\" ng-click=\"toggleExpand()\">\n" +
    "      {{organization.name}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <p>{{organization.id}}</p>\n" +
    "      <p>{{organization.url}}</p>\n" +
    "      <p>{{organization.phones[0].number}}</p>\n" +
    "\n" +
    "      <div class=\"cui-wizard__controls\">\n" +
    "        <button class=\"cui-wizard__next\" ng-click=\"usersWalkup.organization=organization;next()\">{{'cui-select-org' | translate}}</button>\n" +
    "      </div>\n" +
    "    </cui-expandable-body>\n" +
    "  </cui-expandable>\n" +
    "\n" +
    "  <!-- Pagination Controls -->\n" +
    "  <div class=\"cui-paginate__container\" ng-if=\"!usersWalkup.orgLoading\">\n" +
    "    <span class=\"cui-paginate__results-label\">{{'cui-num-results-page' | translate}}</span>\n" +
    "    <results-per-page class=\"cui-paginate__select\" ng-model=\"usersWalkup.orgPaginationSize\"></results-per-page>\n" +
    "    <paginate class=\"cui-paginate\" results-per-page=\"usersWalkup.orgPaginationSize\" count=\"usersWalkup.organizationCount\" on-page-change=\"usersWalkup.orgPaginationPageHandler\" ng-model=\"usersWalkup.orgPaginationCurrentPage\"></paginate>\n" +
    "  </div>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\" style=\"margin-right:0\"><< {{'cui-previous' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.review.html',
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-user-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}:<span class=review-item__value>{{usersWalkup.user.name.given}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}:<span class=review-item__value>{{usersWalkup.user.name.surname}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-email' | translate}}:<span class=review-item__value>{{usersWalkup.user.email}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-country' | translate}}:<span class=review-item__value>{{usersWalkup.userCountry.title || usersWalkup.userCountry}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].streets[0] && usersWalkup.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].streets[0]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].streets[1] && usersWalkup.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].streets[1]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].city && usersWalkup.user.addresses[0].city!==''\">{{'cui-city' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].city}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].state && usersWalkup.user.addresses[0].state!==''\">{{'cui-state' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].state}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].postal && usersWalkup.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].postal}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.phones[0].number && usersWalkup.user.phones[0].number!==''\">{{'cui-telephone' | translate}}:<span class=review-item__value>{{usersWalkup.user.phones[0].number}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "      {{'cui-organization-information' | translate}}\n" +
    "      <span class=chevron>></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=cui-expandable__body>\n" +
    "      \n" +
    "      <div class=cui-expandable__review-item>{{'cui-org' | translate}}:<span class=review-item__value>{{usersWalkup.organization.name}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.username}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-password' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.hiddenPassword}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.question1.question | cuiI18n}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.challengeAnswer1}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.question2.question | cuiI18n}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.challengeAnswer2}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(4)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-application-selection' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.applications.processedSelected.length===0 || !usersWalkup.applications.processedSelected.length\">\n" +
    "      <span class=cui-link ng-click=goToStep(4)>{{'no-applications-selected' | translate}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-repeat=\"application in usersWalkup.applications.processedSelected\">{{application.name}}</div>\n" +
    "\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=cui-wizard__controls>\n" +
    "\n" +
    "  <div class=cui-error ng-if=usersWalkup.registrationError><label>{{usersWalkup.errorMessage | translate}}</label></div>\n" +
    "\n" +
    "  <button class=cui-wizard__next ng-click=\"userWalkupRegForm.$valid && usersWalkup.submit()\" ng-class=\"(!userWalkupRegForm.$valid)? 'cui-wizard__next--error' : usersWalkup.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n" +
    "    <div class=cui-loading--medium-ctr ng-if=usersWalkup.submitting></div>\n" +
    "    <span ng-if=\"!usersWalkup.submitting && usersWalkup.success!=false\">{{'cui-submit' | translate}}</span>\n" +
    "    <span ng-if=\"usersWalkup.success===false\" name=review.btnError>Error! Try again?</span>\n" +
    "  </button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.userProfile.html',
    "<ng-form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersWalkup.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersWalkup.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"usersWalkup.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersWalkup.emailRe name=emailRe class=cui-input ng-required=true match=\"usersWalkup.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=usersWalkup.userCountry local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=usersWalkup.userCountry></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].city class=cui-input name=\"city\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].state class=cui-input name=\"state\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label ng-click=\"usersRegister.tos=!usersRegister.tos\" class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$touched && user.TOS.$error.required\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "    <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(5)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/registration/userWalkup target=blank>here</a></div>\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard-proto bar mobile-stack=700 class=cui-wizard step=1 minimum-padding=100 clickable-indicators>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <ng-form name=userWalkupRegForm novalidate>\n" +
    "        <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.userProfile.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.organization.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.login.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step step-title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.applications.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.review.html'\"></div>\n" +
    "        </step>\n" +
    "      </ng-form>\n" +
    "    </cui-wizard-proto>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/user/profile/sections/address.html',
    "<ng-form name=address>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'cui-address' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div ng-if=!toggled>\n" +
    "        <div class=cui-field-val__val>{{userProfile.tempUser.addresses[0].streets[0]}} </div>\n" +
    "        <div class=cui-field-val__val ng-if=userProfile.tempUser.addresses[0].streets[1]>{{userProfile.tempUser.addresses[0].streets[1]}}</div>\n" +
    "        <div class=cui-field-val__val>{{userProfile.tempUser.addresses[0].city}}</div>\n" +
    "        <div class=cui-field-val__val>{{userProfile.tempUser.addresses[0].state}} {{userProfile.tempUser.addresses[0].postal}}</div>\n" +
    "        <div class=cui-field-val__val>{{base.countries.getCountryByCode(userProfile.tempUser.addresses[0].country).name}}</div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'address','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=\"{{'cui-street-address' | translate}}\">{{'cui-street-address' | translate}}</label>\n" +
    "        <input type=text name=\"{{'cui-street-address' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].streets[0]>\n" +
    "        \n" +
    "        <label for=\"{{'cui-address-2' | translate}}\">{{'cui-address-2' | translate}}</label>\n" +
    "        <input type=text name=\"{{'cui-address-2' | translate}}\" ng-model=userProfile.tempUser.addresses[0].streets[1] class=cui-input>\n" +
    "        <div class=cui-form__field-row>\n" +
    "          \n" +
    "          <div class=\"cui-form__field-container cui-form__field-container--half\">\n" +
    "            <label for=\"{{'cui-city' | translate}}\">{{'cui-city' | translate}}</label>\n" +
    "            <input type=text name=\"{{'cui-city' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].city>\n" +
    "          </div>\n" +
    "          \n" +
    "          <div class=\"cui-form__field-container cui-form__field-container--half\">\n" +
    "            <label for=\"{{'cui-zip' | translate}}\">{{'cui-zip' | translate}}</label>\n" +
    "            <input type=text name=\"{{'cui-zip' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].postal>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-wizard__field-container>\n" +
    "          <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "          <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "            <div ng-messages-include=assets/angular-templates/messages.html></div>\n" +
    "          </div>\n" +
    "          <div auto-complete input-name=country pause=100 selected-object=userProfile.userCountry initial-value=base.countries.getCountryByCode(userProfile.tempUser.addresses[0].country) local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true></div>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=\"userProfile.resetTempObject(userProfile.user, userProfile.tempUser); toggleOff()\">{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"userProfile.updatePerson('address',toggleOff);\">\n" +
    "            <span ng-if=\"!userProfile.address || !userProfile.address.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.address.submitting></div>\n" +
    "            <span ng-if=userProfile.address.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/sections/basic-info.html',
    "<ng-form name=basicInfo>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'basic-info' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=!toggled>\n" +
    "        <span class=cui-field-val__field>{{'cui-name' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{userProfile.user.name.given}} {{userProfile.user.name.surname}}</span><br>\n" +
    "        <span class=cui-field-val__field>{{'cui-email' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{userProfile.user.email}} </span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'basicInfo','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=firstName>{{'cui-first-name' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.firstName.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=text name=firstName class=cui-input ng-model=userProfile.tempUser.name.given ng-required=true focus-if=toggled>\n" +
    "        \n" +
    "        <label for=lastName>{{'cui-last-name' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.lastName.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=text name=lastName class=cui-input ng-model=userProfile.tempUser.name.surname ng-required=true>\n" +
    "        \n" +
    "        <label for=email>{{'cui-email' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.email.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=email name=email class=cui-input ng-model=userProfile.tempUser.email ng-required=true>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"basicInfo.$valid && userProfile.updatePerson('basicInfo',toggleOff);\" ng-class=\"{'cui-button--error':!basicInfo.$valid}\">\n" +
    "            <span ng-if=\"!userProfile.basicInfo || !userProfile.basicInfo.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.basicInfo.submitting></div>\n" +
    "            <span ng-if=userProfile.basicInfo.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/sections/challenge-questions.html',
    "<ng-form name=challengeQuestions>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'challenge-questions' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div ng-if=!toggled>\n" +
    "        <div ng-repeat=\"question in userProfile.challengeQuestionsTexts\">\n" +
    "          <span class=cui-field-val__field>{{$index+1}}:</span>\n" +
    "          <span class=cui-field-val__val>{{question}}</span>\n" +
    "          \n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'challengeQuestions','function':toggleOff})\">\n" +
    "        <div ng-repeat=\"question in userProfile.tempUserSecurityQuestions\">\n" +
    "          <b>{{'cui-challenge-question' | translate}} {{$index+1}}</b>\n" +
    "          <select class=\"cui-input cui-input--full cui-select\" ng-model=question.question.id ng-options=\"question.id as (question.question | cuiI18n) for question in userProfile['allChallengeQuestions' + $index]\"></select>\n" +
    "          {{'cui-answer' | translate}}\n" +
    "          <div class=cui-error ng-messages=\"challengeQuestions['answer' + $index].$error\">\n" +
    "            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "          </div>\n" +
    "          <input type=text ng-model=question.answer class=cui-input ng-class=\"{'cui-input--error':!challengeQuestions['answer'+$index].$valid}\" name=answer{{$index}} ng-change=userProfile.checkIfRepeatedSecurityAnswer(userProfile.tempUserSecurityQuestions,challengeQuestions) ng-required=\"true\">\n" +
    "          <br><br>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"userProfile.saveChallengeQuestions('challengeQuestions',toggleOff);\" ng-class=\"{'cui-button--error':!challengeQuestions.$valid}\">\n" +
    "            <span ng-if=\"( !userProfile.challengeQuestions || !userProfile.challengeQuestions.submitting ) && !userProfile.challengeQuestions.error\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.challengeQuestions.submitting></div>\n" +
    "            <span ng-if=userProfile.challengeQuestions.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/sections/header.html',
    "<div class=cui-users__profile-media ng-if=!userProfile.loading>\n" +
    "  <div class=cui-media>\n" +
    "    <div class=cui-media__image-container>\n" +
    "      \n" +
    "      <div class=cui-media__image cui-avatar cui-avatar-names=\"[userProfile.user.name.given, userProfile.user.name.surname]\" cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5></div>\n" +
    "    </div>\n" +
    "    <div class=cui-media__body>\n" +
    "      \n" +
    "      <h3 class=cui-media__title>{{userProfile.user.name.given}} {{userProfile.user.name.surname}}</h3>\n" +
    "      \n" +
    "      <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n" +
    "      <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/user/profile/sections/password.html',
    "<ng-form name=password>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'password-reset' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=userProfile.resetPasswordFields();toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'password','function':toggleOff})\">\n" +
    "\n" +
    "        \n" +
    "        <label for=currentPassword>{{'current-password' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=password.currentPassword.$error ng-if=password.currentPassword.$touched>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=password name=currentPassword class=cui-input ng-model=userProfile.userPasswordAccount.currentPassword ng-required=true focus-if=\"toggled\">\n" +
    "\n" +
    "        \n" +
    "        <div class=cui-input__password-holder>\n" +
    "          <label for=newPassword>{{'cui-enter-new-password' | translate}}: </label>\n" +
    "          <input class=cui-input name=newPassword type=password ng-model=userProfile.userPasswordAccount.password ng-required=true ng-class=\"{'cui-input--error': password.newPassword.$touched && password.newPassword.$invalid}\" password-validation>\n" +
    "          \n" +
    "          <div password-popover ng-messages=password.newPassword.$error ng-messages-multiple ng-if=password.newPassword.$invalid class=cui-error__password>\n" +
    "            <div ng-messages-include=assets/app/common-templates/password-validation.html></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        \n" +
    "        <label for=newPasswordRe>{{'cui-re-enter-new-password' | translate}}: </label>\n" +
    "        <div class=cui-error ng-if=\"password.newPasswordRe.$touched && password.newPasswordRe.$error.match\">\n" +
    "          <div class=cui-error__message>{{'password-mismatch' | translate}}</div>\n" +
    "        </div>\n" +
    "        <input class=\"cui-input cui-field-val__val\" type=password ng-model=userProfile.passwordRe name=newPasswordRe match=\"userProfile.userPasswordAccount.password\">\n" +
    "\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=userProfile.resetPasswordFields();toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"password.$valid && userProfile.updatePassword('password',toggleOff);\" ng-class=\"{'cui-button--error':!password.$valid}\">\n" +
    "            <span ng-if=\"(!userProfile.password || !userProfile.password.submitting) && !userProfile.password.error\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.password.submitting></div>\n" +
    "            <span ng-if=userProfile.password.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/sections/phone-fax.html',
    "<ng-form name=phoneFax>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'cui-phone-fax' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=!toggled ng-repeat=\"phone in userProfile.user.phones\">\n" +
    "        <span class=cui-field-val__field>{{phone.type}}:</span>\n" +
    "        <span class=cui-field-val__val>{{phone.number}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled>\n" +
    "        \n" +
    "        <div ng-repeat=\"phone in userProfile.tempUser.phones\">\n" +
    "          <label>{{phone.type}}</label>\n" +
    "          <div ng-messages=\"phoneFax['phone'+$index].$error\" class=cui-error>\n" +
    "            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "          </div>\n" +
    "          <input class=cui-input type=text ng-model=phone.number name=phone{{$index}} ng-required=\"true\">\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"phoneFax.$valid && userProfile.updatePerson('phoneFax',toggleOff);\" ng-class=\"{'cui-button--error':!phoneFax.$valid}\">\n" +
    "            <span ng-if=\"!userProfile.phoneFax || !userProfile.phoneFax.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.phoneFax.submitting></div>\n" +
    "            <span ng-if=userProfile.phoneFax.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/sections/timezone-language.html',
    "<ng-form name=timezoneLanguage>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'timezone-and-language' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div ng-if=!toggled>\n" +
    "        <span class=cui-field-val__field>{{'cui-timezone' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{userProfile.timezoneById(userProfile.user.timezone)}}</span><br>\n" +
    "        <span class=cui-field-val__field>{{'cui-language' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{base.languages[userProfile.user.language]}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'timezoneLangauge','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=timezone>{{'cui-timezone' | translate}}</label>\n" +
    "        <select class=\"cui-input cui-select\" ng-model=userProfile.tempUser.timezone ng-options=\"timezone.id as timezone.name for timezone in base.timezones\"></select>\n" +
    "        \n" +
    "        <label for=language>{{'cui-language' | translate}}</label>\n" +
    "        <select class=\"cui-input cui-select\" ng-model=userProfile.tempUser.language ng-options=\"languageCode as languageName for (languageCode,languageName) in base.languages\"></select>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"userProfile.updatePerson('timezoneLanguage',toggleOff);\">\n" +
    "            <span ng-if=\"!userProfile.timezoneLanguage || !userProfile.timezoneLanguage.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=userProfile.timezoneLanguage.submitting></div>\n" +
    "            <span ng-if=userProfile.timezoneLanguage.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/profile/user.profile.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/profile/user target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/users.scss class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<ng-form name=edit novalidate>\n" +
    "  <div class=cui-users__edit>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-action>\n" +
    "      <div class=cui-action__title>\n" +
    "        {{'cui-my-profile' | translate}}\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-users__main-container>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-loading__container ng-if=userProfile.loading>\n" +
    "        <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-include=\"'assets/app/user/profile/sections/header.html'\"></div>\n" +
    "\n" +
    "      <div class=cui-users__profile>\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/basic-info.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/password.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/challenge-questions.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/timezone-language.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/address.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/user/profile/sections/phone-fax.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/user/user.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/welcome/welcome.html',
    "<div class=welcome-wrapper>\n" +
    "\n" +
    "  \n" +
    "  <div class=welcome-title>\n" +
    "    <h1>{{ 'welcome-title' | translate }}:</h1>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=cui-card__container>\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#skyscraper></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header>{{ 'cui-new-TLO' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-TLO-description' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.tlo>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#division></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header id=newDivision-header>{{ 'cui-new-division' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-division-description-start' | translate }} <a href=\"\" class=cui-link--medium-light ng-click=\"welcome.divisionPopover=true\">{{ 'cui-security-administrator' | translate }}</a>* {{ 'cui-new-division-description-end' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.division>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-styeguide__popover-container ng-if=welcome.divisionPopover off-click=\"welcome.divisionPopover=false\" tether target=#newDivision-header attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"15px 145px\">\n" +
    "      <div class=\"cui-popover cui-popover--dark cui-popover--top cui-popover__new-division\">\n" +
    "        <p>{{ 'cui-welcome-popover' | translate }}</p>\n" +
    "        <p class=cui-popover_link><a href=\"\" ng-click=\"welcome.divisionPopover=false\">Cool, got it!</a></p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header>{{ 'cui-new-user' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-user-description' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.walkup>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);
