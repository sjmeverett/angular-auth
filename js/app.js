
angular
    .module('app', ['login'])
    .config(function ($routeProvider)
    {
         $routeProvider
         	.when('/', {controller: MainController, templateUrl: 'templates/main.html'})
      		.otherwise({redirectTo: '/'});
    });


function MainController($scope, $http)
{
	$scope.users = [];

    $http
        .get('/resources/users')
        .success(function (data, status, error, config)
        {
            $scope.users = data;
        });
}

