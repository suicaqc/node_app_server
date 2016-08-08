var app = angular.module('qaletApp', [
	'ngCookies',
	'ngRoute'
]);
app.controller('mainController', function($rootScope, $scope, $location, $http, $cookies, $timeout){ 
	$rootScope.$on('$routeChangeStart', function(){ 
		if (!$rootScope._super) $rootScope._super={};
		$rootScope._super.option = $location.$$path;
	});
	
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

app.controller('authController', function($rootScope, $scope, $location, $http, $cookies,  $timeout){ 

	$scope.signin = function() {
		$rootScope.progress_modal('signin', 'on', 'Login ...');
		$http({
		  method: 'POST',
		  url: '/api/auth.js',
		  data: {opt:'signin', form_data:$scope.form_auth}
		}).then(function successCallback(response) {
			$rootScope._super.session = response.data;
			$timeout(
				function() {
					$rootScope.progress_modal('signin','off');
				},
				1
			);
			
		  }, function errorCallback(response) {
			   $rootScope.progress_modal('signin', 'off');
		  });				
	}
	$scope.signup = function() {
		$rootScope.progress_modal('signup', 'on', 'Sign up ...');
		$rootScope.progress_modal('signup2', 'on', 'Sign up 2...', 1000);
		$rootScope.progress_modal('signup3', 'on', 'Sign up 3...', 2000, 1000);
		$rootScope.progress_modal('signup4', 'on', 'Sign up 4...', 3000, 7000);
		$rootScope.progress_modal('signup5', 'on', 'Sign up 5...', 4000);
		$timeout(function() {
			$rootScope.progress_modal('signup', 'off');
		},3000);
	}	
});


app.controller('topMenuController', function($rootScope, $scope, $location, $cookies){ 
	$scope.isActive = function(v) {
		return ($location.$$path == v)?'active':'';
	} 
});

app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'uiview/home.html', reloadOnSearch: false});
  $routeProvider.when('/about',			{templateUrl: 'uiview/about.html', reloadOnSearch: false}); 
  $routeProvider.when('/contact',		{templateUrl: 'uiview/contact.html', reloadOnSearch: false}); 
  $routeProvider.when('/docs',			{templateUrl: 'uiview/docs.html', reloadOnSearch: false});   
});


app.controller('modalController', function($rootScope, $scope, $location, $http, $cookies){ 	
	$scope.Q = {}; 
	$scope.$watch(
		function() {
			var cnt=0;
			var dt = new Date(), tm = dt.getTime();
			
			for (var k in $scope.Q) {
				if (tm > $scope.Q[k].end) {
					console.log(tm+'---'+$scope.Q[k].end+'==>deleted');
					delete $scope.Q[k];
				}
			}			
			for (var k in $scope.Q) {
				if (tm < $scope.Q[k].end && tm >= $scope.Q[k].start) {
					cnt++;
				}
			}
			return cnt;
		},
		function(curv, prev) {	
			if (curv) {
				console.log('curv===>');
				console.log(curv);
				$scope.progress_message = '';
				for (var k in $scope.Q) {
					$scope.progress_message += $scope.Q[k].message;
				}				
				$('.qalet_loading_progress_bar').modal();
			} else {
				$('.qalet_loading_progress_bar').modal('hide');
			}
		}
	);	
	$scope.popup = function(code, message) {
		$scope.popup_message = message;
		if (code == 'on') {
			$('.qalet_popup').modal();
		} else {
			$('.qalet_popup').modal('hide');
		}
	}	
	
	
	$rootScope.progress_modal = function(id, code, message, holdtime, maxtime) {
		var t = (!holdtime)?0:holdtime, m = (!maxtime)?6000:maxtime; 
		var dt = new Date(), tm = dt.getTime()
		
		if (code == 'on') $scope.Q[id] = {type:'progress_modal',code:code, message:message, start:tm + t , end: tm + m};
		else delete $scope.Q[id];
		console.log($scope.Q[id]);
	}
	
	$rootScope.popup = function(code, message) {
		$scope.popup(code, message);
	}	

});	

