angular.module('common')
.directive('disableAnimate', ($animate) => ({

	/*
		Use this directive to disable the animation window that is introduced by ng-animate.
		Add the 'disable-animate' attribute to an element you need to disable ng-animate on.

		Example: 	<p disable-animate> Element you need to disable ng-animate on. </p>
	*/

	restrict: 'A',
	link: (attrs, elem) => {
		$animate.enabled(elem, false)
	}
}))
