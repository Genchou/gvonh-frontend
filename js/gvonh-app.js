var gvonhApp = angular.module('gvonhApp', [
	'ngRoute',
	'gvonhControllers',
	'angular-loading-bar'
]);

gvonhApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/load/:user/:token', {
				templateUrl: 'load.html',
				controller: 'salaryController',
			}).
			otherwise({
				templateUrl: 'start.html',
				controller: 'startController',
			});
	}]);