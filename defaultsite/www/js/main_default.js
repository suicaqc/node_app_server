var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 
	$scope.updateGit = function() {
		$scope.progress_message = 'Apply git ...';
		$('.qalet_loading_progress_bar').modal();
		$timeout(function() {
			$('.qalet_loading_progress_bar').modal('hide');
		},3000);	
		
	}
	
	$scope.listServices = function() {
		$scope.popup('on', {
			title:'Services',
			body: 'Under construction<br/><img src="/images/Under-Construction.gif">'
		});			
		
	}
	
	$scope.report = function() {
		$scope.popup('on', {
			title:'Report',
			body: 'Under construction<br/><img src="/images/Under-Construction.gif">'
		});			
		
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

