var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout){ 

	
	$scope.isSignin = function(v) {
		return (($rootScope._super.session) && ($rootScope._super.session.uid))?true:false;
	}; 	
	
	$scope.signout = function() {
		$rootScope.progress_modal('signout', 'on', 'Sign out ...')
		$http({
		  method: 'POST',
		  url: '/api/auth.js',
		  data: {opt:'signout'}
		}).then(function successCallback(response) {
			
			delete $rootScope._super.session;
			$rootScope.progress_modal('signout', 'off')
		  }, function errorCallback(response) {
				$rootScope.progress_modal('signout', 'off');	
				
				$timeout(
					function() {
							
						$rootScope.popup('on', {
							title:'API Error',
							body: response.data
						});
					}, 4000
				);
					
			});
	};
});	

