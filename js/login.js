
//based loosely on http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application

angular
    .module('login', ['ui.bootstrap'])
    .config(['$httpProvider', function ($httpProvider)
    {
        $httpProvider.responseInterceptors.push([
            '$rootScope', '$q',
            
            function (scope, $q)
            {
                return function (promise)
                {
                    return promise.then(success, error);
                }
                                
                function success(response)
                {
                    return response;
                }
                
                function error(response)
                {
                    if (response.status == 401)
                    {
                        var deferred = $q.defer();
                        
                        scope.failedRequests.push({
                            config: response.config,
                            deferred: deferred    
                        });
                        
                        scope.$broadcast('event:loginRequired');
                        return deferred.promise;
                    }
                    else
                    {
                        return $q.reject(response);
                    }
                }
            }
        ]);
    }])
    .run(['$rootScope', '$dialog', '$http', function ($rootScope, $dialog, $http)
    {
        $rootScope.failedRequests = [];
        $rootScope.loggedIn = false;
        $rootScope.user = '';

        $rootScope.$on('event:loginRequired', function ()
        {
            var d = $dialog.dialog({
                backdrop: true,
                dialogFade: true,
                templateUrl: 'templates/login.html',
                controller: 'LoginController',
                backdropClick: false,
                keyboard: false
            });

            d.open();
        });


        $rootScope.$on('event:loginSuccess', function ()
        {
            for(var i = 0; i < $rootScope.failedRequests.length; i++)
            {
                var request = $rootScope.failedRequests[i];

                $http(request.config)
                    .then(function (response)
                    {
                        request.deferred.resolve(response);
                    });
            }

            $rootScope.failedRequests = [];
        });
    }]);

function LoginController($scope, dialog, $http, $rootScope)
{
    $scope.errorMessage = '';

    $scope.login = function ()
    {
        $http
            .post('/resources/login', {email: $scope.email, password: $scope.password})
            .success(function (data, status, error, config)
            {
                if (data.success === true)
                {
                    $rootScope.$broadcast('event:loginSuccess');
                    dialog.close();
                }
                else
                {
                    $scope.errorMessage = 'Invalid username or password.';
                }
            })
            .error(function (data, status, error, config)
            {
                $scope.errorMessage = 'Error logging in.';
            });
    };
}