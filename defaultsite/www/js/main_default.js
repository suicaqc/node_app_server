var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout){ 
	$scope.updateGit = function() {
		$scope.popup('on', {
			title:'API Error',
			body: 'response.data'
		});		
		
	}
	
	$scope.listServices = function() {
		
		
	}
	
	$scope.report = function() {
		
		
	}

	$scope.popup = function(code, message) {
		$scope.popup_message = message;
		if (code == 'on') {
			$('.qalet_popup').modal();
		} else {
			$('.qalet_popup').modal('hide');
		}
	}	
	
});	

