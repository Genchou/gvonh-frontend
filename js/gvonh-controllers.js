var gvonhControllers = angular.module('gvonhControllers', []);

gvonhControllers.controller('startController', function($scope, $location) {
	$scope.username;
	$scope.token;

	$scope.loadUrl = 'http://gvonh.be/#load/';

	$scope.updateUrl = function() {
		if ($scope.username != undefined && $scope.token != undefined) {
			jQuery("#loadUrl").removeClass("hidden");
			$scope.loadUrl = 'http://gvonh.be/#load/' + $scope.username + '/' + $scope.token;
		} else if ($scope.username == undefined && $scope.token != undefined) {
			jQuery("#loadUrl").addClass("hidden");
			$scope.loadUrl = 'http://gvonh.be/#load/.../' + $scope.token;
		} else if ($scope.username != undefined && $scope.token == undefined) {
			jQuery("#loadUrl").addClass("hidden");
			$scope.loadUrl = 'http://gvonh.be/#load/' + $scope.username + '/...';
		} else {
			jQuery("#loadUrl").addClass("hidden");
			$scope.loadUrl = 'http://gvonh.be/#load/.../...';
		}
	};

	$scope.loadData = function() {
		$location.path('load/' + $scope.username + '/' + $scope.token);
	};
});

gvonhControllers.controller('salaryController', function($scope, $http, $routeParams) {
	$scope.salaries = [];

	$scope.user = $routeParams.user;
	$scope.token = $routeParams.token;

	var chart;
	var chartDataX = ['x'];
	var chartDataUntaxed = ['untaxed'];
	var chartDataTaxed = ['taxed'];

	chart = c3.generate({
		bindto: '#salaries-chart',
		data: {
			x: 'x',
			xFormat: '%d-%m-%Y',
			columns: [
				chartDataX,
				chartDataUntaxed,
				chartDataTaxed
			]
		},
		axis: {
			x: {
				type: 'timeseries',
				localtime: true,
				tick: {
					format: '%d-%m-%Y',
					rotate: 0
				}
			}
		},
		zoom: {
			enabled: false
		}
	});

	var loadChartData = function() {
		chart.load({
			columns: [
				chartDataX,
				chartDataUntaxed,
				chartDataTaxed
			]
		});
	};

	$scope.addSalary = function() {
		var saveResult = $scope.saveSalary();
	};

	$scope.saveSalary = function() {
		var untaxed = $scope.salaryUntaxed;
		var taxed = $scope.salaryTaxed;
		var dateStr = $scope.salaryDate;
		dateStr = dateStr.split("-");
		var date = dateStr[2] + "-" + dateStr[1] + "-" + dateStr[0];

		var url = 'http://salary.gvonh.be/salary/write?user=' + $scope.user + '&token=' + $scope.token;
		url += '&untaxed=' + untaxed + '&taxed=' + taxed + '&date=' + date;
		$http.get(url)
			.success(function(data, status, headers, config) {
				if (data.status == "success") {
					// $scope.salaries.push({ id:$scope.salaries.length, untaxed:$scope.salaryUntaxed, taxed:$scope.salaryTaxed, });
					// chartDataX[chartDataX.length] = $scope.salaryDate;
					// chartDataUntaxed[chartDataUntaxed.length] = $scope.salaryUntaxed * 1;
					// chartDataTaxed[chartDataTaxed.length] = $scope.salaryTaxed * 1;
					// loadChartData();
					jQuery("form")[0].reset();
					$scope.loadData();
				} else {
					return false;
				}
			})
			.error(function(data, status, headers, config) {
				return false;
			});
	};

	$scope.remaining = function() {
		var count = 0;
		angular.forEach($scope.salaries, function(salary) {
			count += salary.payed ? 0 : 1;
		});
		return count;
	};

	$scope.archive = function() {
		var oldSalaries = $scope.salaries;
		$scope.salaries = [];
		angular.forEach(oldSalaries, function(salary) {
			if (!salary.payed)
				$scope.salaries.push(salary);
		});
	};

	$scope.clear = function() {
		$scope.salaries = [];
		chartDataX = ["x"];
		chartDataUntaxed = ["untaxed"];
		chartDataTaxed = ["taxed"];
		chart.unload();
	};

	$scope.deleteAll = function() {
		var url = 'http://salary.gvonh.be/salary/delete?user=' + $scope.user + '&token=' + $scope.token;
		$http.get(url)
			.success(function (data, status, headers, config) {
				$scope.clear();
			});
	};

	$scope.total = function() {
		var total = { untaxed:0, taxed:0 };
		angular.forEach($scope.salaries, function(salary) {
			total.untaxed += salary.untaxed * 1;
			total.taxed += salary.taxed * 1;
		});
		return total;
	};

	$scope.loadData = function() {
		$http.get("http://salary.gvonh.be/salary/?user=" + $scope.user + "&token=" + $scope.token)
			.success(function(data, status, headers, config) {
				$scope.clear();
				var salaries = data.result;
				for (var i in salaries) {
					var salary = salaries[i];
					chartDataUntaxed[chartDataUntaxed.length] = salary.untaxed * 1;
					chartDataTaxed[chartDataTaxed.length] = salary.taxed * 1;
					var dateStr = salary.salary_date.substring(0, 10);
					var date = new Date(dateStr);
					chartDataX[chartDataX.length] = date;
					$scope.salaries.push({ id:$scope.salaries.length, untaxed:salary.untaxed, taxed:salary.taxed, date:salary.salary_date.substring(0, 10) });
				}
				setTimeout(function() { loadChartData() }, 1000);
			});
	};

	var init = function() {
		$scope.loadData();
	};
	init();
});