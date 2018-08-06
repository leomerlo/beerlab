// Config local
var config = {"titulo":"Hopedia","autor":"Leo Merlo","server_url":"http:\/\/leomerlo.com.ar\/hopedia","tipos":["Golden","Scotch","Stout","Weiss","Pale Ale","IPA"],"etapas":[{"fecha":1,"nombre":"Cocinado"},{"fecha":7,"nombre":"Fermentacion"},{"fecha":14,"nombre":"Madurado"},{"nombre":"Envasada"}]};

// Creación del módulo
angular.module('Hopedia', ['ngRoute','ngAnimate','mobile-angular-ui','slickCarousel'])

// Configuración de las rutas
.config(function($routeProvider) {
	$routeProvider
			.when('/', {
					controller: 'home',
					templateUrl: 'partials/home.html',
			}).when('/receta/:id', {
					controller: 'detalle_receta',
					templateUrl: 'partials/detalle.html',	
			}).when('/receta/:id/bitacora', {
					controller: 'bitacora_receta',
					templateUrl: 'partials/bitacora.html',			
			}).when('/cargar' , {
					controller: 'cargar_receta',
					templateUrl: 'partials/cargar.html',
			}).otherwise({
					redirectTo: '/'
					});
					
}).filter('namify', function() {

  return function(input) {

  	if(input == ''){
  		return input;
  	}

    input = input || '';

    var out = input.toLowerCase();
    	out = out.replace('.','');
    	out = out.replace(' ','_');

    return out;

  };

}).filter('dias', function() {

  return function(input) {

  	if(input == ''){
  		return input;
  	}

    input = input || '';

    var fecha = new Date(input);
	var hoy = new Date();
	var diff = Math.floor((hoy - fecha) / 1000 / 60 / (60 * 24));

	if(diff <= 1){
		diff = 'Hoy';
	} else {
		diff = diff + ' dias';
	}

    return diff;

  };

})
//creación de controllers
.controller("main", function($scope,$http,$rootScope){

	$scope.recetas = {};
	$scope.recetas.server = [];
	$scope.recetas.lista = [];
	if(JSON.parse(localStorage.getItem('pendientes'))){
		$scope.recetas.pendientes = JSON.parse(localStorage.getItem('pendientes'));
	} else {
		$scope.recetas.pendientes = {};
		$scope.recetas.pendientes.editar = [];
		$scope.recetas.pendientes.lista = [];
		$scope.recetas.pendientes.eliminar = [];
	}
	$scope.etapas = [];
	$scope.tipos = [];
	$scope.url = "http://leomerlo.com/hopedia/server/";
	$scope.init = false;

	$http({
        method : "GET",
        url : $scope.url+"index.php?q=get"
    }).then(function success(resp) {
    	localStorage.setItem('config',JSON.stringify(resp.data.config));
		$scope.etapas = resp.data.config.etapas;
		$scope.tipos = resp.data.config.tipos;
    	$scope.recetas.server = resp.data.recetas || [];
    	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
    	localStorage.setItem('recetas',JSON.stringify($scope.recetas.server));

    	$scope.init = true;

    	for(receta in $scope.recetas.lista){

    		if($scope.recetas.lista[receta] === undefined){
    			$scope.recetas.lista.splice(receta,1);
    			return false;
    		}

			var fecha = new Date($scope.recetas.lista[receta].fecha);

			var hoy = new Date();
			var diff = Math.floor((hoy - fecha) / 1000 / 60 / (60 * 24));

			for(etapa in $scope.etapas){

				var etapa = $scope.etapas[etapa];
				if(diff <= etapa.fecha){
					$scope.recetas.lista[receta].etapa = etapa;
					break;
				}
			}

			if(!$scope.recetas.lista[receta].etapa){
				$scope.recetas.lista[receta].etapa = $scope.etapas[$scope.etapas.length-1];
			}
		}
    }, function error(resp) {
    	config = JSON.parse(localStorage.getItem('config')) || config;
    	$scope.etapas = config.etapas;
		$scope.tipos = config.tipos;
    	$scope.recetas.server = JSON.parse(localStorage.getItem('recetas')) || [];
    	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);

    	$scope.init = true;

    	for(receta in $scope.recetas.lista){

			var fecha = new Date($scope.recetas.lista[receta].fecha);

			var hoy = new Date();
			var diff = Math.floor((hoy - fecha) / 1000 / 60 / (60 * 24));

			for(etapa in $scope.etapas){

				var etapa = $scope.etapas[etapa];
				if(diff <= etapa.fecha){
					$scope.recetas.lista[receta].etapa = etapa;
					break;
				}
			}

			if(!$scope.recetas.lista[receta].etapa){
				$scope.recetas.lista[receta].etapa = $scope.etapas[$scope.etapas.length-1];
			}
		}
    });

    $scope.$back = function() { 
		window.history.back();
	};

})
.controller("home", function($scope,$location){

	$scope.class = "home";

	$scope.$watch('recetas.lista', function() {
        for(receta in $scope.recetas.lista){

        	if(!isNaN($scope.recetas.lista[receta].tipo)){
        		var tipo = config.tipos[$scope.recetas.lista[receta].tipo - 1];
        		$scope.recetas.lista[receta].tipo_text = tipo;
        	} else {
        		$scope.recetas.lista[receta].tipo_text = $scope.recetas.lista[receta].tipo;
        	}

        	var fecha = new Date($scope.recetas.lista[receta].fecha);

        	var hoy = new Date();
        	var diff = Math.floor((hoy - fecha) / 1000 / 60 / (60 * 24));

        	for(etapa in $scope.etapas){

        		var etapa = $scope.etapas[etapa];
        		if(diff <= etapa.fecha){
        			$scope.recetas.lista[receta].etapa = etapa;
        			break;
        		}
        	}

        	if(!$scope.recetas.lista[receta].etapa){
        		$scope.recetas.lista[receta].etapa = $scope.etapas[$scope.etapas.length-1];
        	}
        }
    });

})
.controller('detalle_receta', function($scope,$http,$location,$routeParams){

	var receta_pos;

	if($scope.recetas.lista.length < 1){
		$scope.recetas.lista = localStorage.getItem('recetas');
	}

	$scope.class = "receta";
	for(i in $scope.recetas.lista){
		if($scope.recetas.lista[i].id == $routeParams.id){
			$scope.receta = $scope.recetas.lista[i];
			break;
		}
	}

	$scope.quitar_receta = function(id){

		receta = {};
		receta.id = id;

		var es_local = false;
		for(i in $scope.recetas.pendientes.lista){
			if($scope.recetas.pendientes.lista[i].id == id){
				es_local = i;
				break;
			}
		}
		
		if(!es_local){
			$scope.recetas.pendientes.eliminar.push(receta);

			$http({
		        method : "POST",
		        url : $scope.url+"index.php?q=post",
		        data: $scope.recetas.pendientes
		    }).then(function success(resp) {
		    	$scope.recetas.server = resp.data;
				localStorage.setItem('recetas',JSON.stringify($scope.recetas.server));
				$scope.recetas.lista = $scope.recetas.server;
				$scope.recetas.pendientes.lista = [];
				$scope.recetas.pendientes.editar = [];
				$scope.recetas.pendientes.eliminar = [];
				localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
		    }, function error(resp) {
		    	$scope.recetas.server.splice(receta_pos,1);
		    	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
		    	localStorage.setItem('recetas',JSON.stringify($scope.recetas.server));
		    	localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
		    }).finally(function(){
		    	$location.path('/home');
		    });
		} else {
			$scope.recetas.pendientes.lista.splice(es_local,1);
			$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
	    	localStorage.setItem('recetas',JSON.stringify($scope.recetas.server));
	    	localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
			$location.path('/home');
		}
	}

})
.controller("cargar_receta", function($scope,$filter,$location,$http){

	$scope.class = "nueva_receta";
    $scope.paso_activo = 1;
	$scope.maltas = [{id: "malta1"}];
	$scope.receta = {
		id: new Date().getUTCMilliseconds(),
		nombre: "",
		tipo: "",
		fecha: new Date(),
		maltas: $scope.maltas,
		lupulo_amargor: "",
		lupulo_sabor: "",
		temp_mascerado: "",
		densidad_inicial: "",
		densidad_final: "",
		levadura: "",
		clarificante_h: "",
		clarificante_m: ""
	};

	$scope.agregar_malta = function(){
		var nuevo = $scope.maltas.length+1;
    	$scope.maltas.push({'id':'malta'+nuevo});
	}

	$scope.quitar_malta = function(){
		var ultimo = $scope.maltas.length-1;
    	$scope.maltas.splice(ultimo);
	}

	$scope.agregar_receta = function(){

		$scope.recetas.pendientes.lista.push($scope.receta);

		$http({
	        method : "POST",
	        url : $scope.url+"index.php?q=post",
	        data: JSON.stringify($scope.recetas.pendientes)
	    }).then(function success(resp) {
			localStorage.setItem('recetas',JSON.stringify(resp.data));
			$scope.recetas.server = resp.data;
			$scope.recetas.lista = $scope.recetas.server;
			$scope.recetas.pendientes.lista = [];
			$scope.recetas.pendientes.editar = [];
			$scope.recetas.pendientes.eliminar = [];
			localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	    }, function error(resp) {
	    	localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	    	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
	    }).finally(function(){
	    	$scope.paso_activo = 1;
		    $scope.maltas = [{id: "malta1"}];
		    $scope.receta = {
				id: "",
				nombre: "",
				tipo: "",
				fecha: new Date(),
				maltas: $scope.maltas,
				lupulo_amargor: "",
				lupulo_sabor: "",
				temp_mascerado: "",
				densidad_inicial: "",
				densidad_final: "",
				levadura: "",
				clarificante_h: "",
				clarificante_m: ""
			};

			$location.path('/home');
	    });
	}

	$scope.pasoAtras = function(puede){
		if(puede){
			$scope.paso_activo--;
		}
	}

	$scope.pasoAdelante = function(puede){
		if(puede){
			$scope.paso_activo++;
		}
	}

}).controller("bitacora_receta", function($scope,$http,$routeParams){
	$scope.class = "nueva_nota";
	var receta_pos = 0;
	for(i in $scope.recetas.lista){
		if($scope.recetas.lista[i].id == $routeParams.id){
			receta_pos = i;
			$scope.receta = $scope.recetas.lista[i];
		}
	}
	if(!$scope.receta.pasos){
		$scope.receta.pasos = [];
	}

	$scope.pasosIndex = $scope.receta.pasos.length + 1;
	$scope.bitacora = [
		{id: "nota_"+$scope.pasosIndex}
	];

	$scope.agregar_nota = function(){
		var nuevo = $scope.bitacora.length+1;
    	$scope.bitacora.push({'id':'nota'+nuevo});
	}

	$scope.quitar_nota = function(){
		var ultimo = $scope.bitacora.length-1;
    	$scope.bitacora.splice(ultimo);
	}

	$scope.agregar_bitacora = function(){

		for(i in $scope.bitacora){
			$scope.receta.pasos.push($scope.bitacora[i]);	
		}

		var exists = false;
		for( item in $scope.recetas.pendientes.lista){
			if($scope.recetas.pendientes.lista[item].id == $scope.receta.id){
				exists = item;
			}
		}
		if(exists){
			$scope.recetas.pendientes.lista[item] = $scope.receta;
		}

		var exists = false;
		for( item in $scope.recetas.pendientes.editar){
			if($scope.recetas.pendientes.editar[item].id == $scope.receta.id){
				exists = item;
			}
		}

		if(exists){
			$scope.recetas.pendientes.editar[item] = $scope.receta;
		} else {
			$scope.recetas.pendientes.editar.push($scope.receta);
		}

		$scope.recetas[receta_pos] = $scope.receta;

		$http({
	        method : "POST",
	        url : $scope.url+"index.php?q=post",
	        data: JSON.stringify($scope.recetas.pendientes)
	    }).then(function success(resp) {
			localStorage.setItem('recetas',JSON.stringify(resp.data));
			$scope.recetas.server = resp.data;
			$scope.recetas.lista = $scope.recetas.server;
			$scope.recetas.pendientes.lista = [];
			$scope.recetas.pendientes.editar = [];
			$scope.recetas.pendientes.eliminar = [];
			localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	    }, function error(resp) {
	    	$scope.recetas.lista[receta_pos] = $scope.receta;
	    	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
	    	localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	    }).finally(function(){
	    	$scope.pasosIndex = $scope.receta.pasos.length + 1;
			$scope.bitacora = $scope.bitacora = [
				{id: "nota_"+$scope.pasosIndex}
			];

			$location.path('/home');
	    });
	}

	$scope.quitar_bitacora = function(index){

		if(confirm("¿Querés eliminar la nota?")){

			for(i in $scope.receta.pasos){
				if($scope.receta.pasos[i].id == index){
					$scope.receta.pasos.splice(i,1);
				}
			}

			$scope.recetas.pendientes.editar.push($scope.receta);

	    	$http({
	            method : "POST",
	            url : $scope.url+"index.php?q=post",
	            data: JSON.stringify($scope.recetas.pendientes)
	        }).then(function success(resp) {
	    		localStorage.setItem('recetas',JSON.stringify(resp.data));
	    		$scope.recetas.server = resp.data;
	    		$scope.recetas.lista = $scope.recetas.server;
	    		$scope.recetas.pendientes.lista = [];
	    		$scope.recetas.pendientes.editar = [];
	    		$scope.recetas.pendientes.eliminar = [];
	    		localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	        }, function error(resp) {
	        	$scope.recetas.lista[receta_pos] = $scope.receta;
	        	$scope.recetas.lista = $scope.recetas.server.concat($scope.recetas.pendientes.lista);
	        	localStorage.setItem('pendientes',JSON.stringify($scope.recetas.pendientes));
	        }).finally(function(){
	        	$scope.pasosIndex = $scope.receta.pasos.length + 1;
	    		$scope.bitacora = $scope.bitacora = [
	    			{id: "nota_"+$scope.pasosIndex}
	    		];

	    		$location.path('/home');
	        });

	    }
	}
});