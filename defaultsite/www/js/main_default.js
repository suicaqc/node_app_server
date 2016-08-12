var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 
	
$scope.sections={};
	
	$scope.updateGit = function() {
		$scope.progress_message = 'Apply git ...';
		$('.qalet_loading_progress_bar').modal();
		$http({
		  method: 'GET',
		  url: '/_git/'
		}).then(function successCallback(response) {
			$('.qalet_loading_progress_bar').modal('hide');
			$scope.popup('on', {
				title:'Success done git update',
				body: $sce.trustAsHtml(response.data)
			});				
		  }, function errorCallback(response) {
				$('.qalet_loading_progress_bar').modal('hide');
				$scope.popup('on', {
					title:'Error!',
					body: $sce.trustAsHtml(response)
				});						
			});	
		
	}
	
	$scope.parkingService = function() {
		if (!$scope.sections.gitForm) $scope.sections.gitForm = true;	
		else $scope.sections.gitForm = false;	
		
	}
	
	$scope.listService = function() {
		if (!$scope.sections.gitForm) $scope.sections.gitForm = true;	
		else $scope.sections.gitForm = false;	
		
	}	
	
	$scope.report = function() {
		$scope.popup('on', {
			title:'Report',
			body: $sce.trustAsHtml('Under construction<br/><img src="/images/Under-Construction.gif">&hellip;')
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

