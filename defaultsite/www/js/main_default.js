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
		if (!$scope.sections.git_form) $scope.sections.git_form = true;	
		else $scope.sections.git_form = false;	
		
	}
	
	$scope.listService = function() {
		if (!$scope.sections.service_list) $scope.sections.service_list = true;	
		else $scope.sections.service_list = false;	
		
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

app.controller('gitFormController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 
});	

app.controller('microserviceReportController', function($rootScope, $scope, $location, $http, $cookies, $timeout, $sce){ 

$('.qalet_loading_progress_bar').modal();
	$http({
	  method: 'GET',
	  url: '/_git/list'
	}).then(function successCallback(response) {
		var data = response.data;
		for (var i = 0; i < data.length; i++) {
			data[i]['repository'] = data[i]['repository'].replace(/\/\/([^\:]+):([^\@]+)/i, '//(username/password)');
		}
		
		$scope.microservice_list = data;
		$('.qalet_loading_progress_bar').modal('hide');			
	  }, function errorCallback(response) {
			$('.qalet_loading_progress_bar').modal('hide');
			$scope.popup('on', {
				title:'Error!',
				body: $sce.trustAsHtml(response)
			});						
		});	

});	

