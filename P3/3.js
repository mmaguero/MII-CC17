//MapReduce

/***
Vamos a utilizar la base de datos libre GeoWorldMap de GeoBytes. Es una base de datos de países, con sus estados/regiones y ciudades importantes. Sobre esta Base de datos vamos a obtener el par de ciudades que se encuentran más cercanas en cada país, excluyendo a los EE.UU.
Vamos a importar en nuestra BD de MongoDB un archivo con 37245 ciudades del mundo que está en formato csv (/tmp/mongo/Cities.csv)
mongoimport -u <user> -p <clave> --db <bd> --collection cities --type csv --headerline --file /var/tmp/Cities.csv
Las tareas a realizar en este caso son las siguientes:
***/

/***
1. Encontrar las ciudades más cercanas sobre la colección recién creada mediante un enfoque MapReduce conforme a los pasos que se ilustran en el tutorial práctico.
2. ¿Cómo podríamos obtener la ciudades más distantes en cada país?
3. ¿Qué ocurre si en un país hay dos parejas de ciudades que están a la misma distancia mínima?¿Cómo harías para que aparecieran todas?
4. ¿Cómo podríamos obtener adicionalmente la cantidad de parejas de ciudades evaluadas para cada país consultado?.
5. ¿Cómo podríamos la distancia media entre las ciudades de cada país?.
6. ¿Mejoraría el rendimiento si creamos un índice? ¿Sobre que campo? Comprobadlo.
***/

/***
1.
***/

var MapCode = function() {
	emit(
		this.CountryID,
		{ "data":
		[
			{
				"city": this.City,
				"lat":  this.Latitude,
				"lon":  this.Longitude
			}
		]
	});
}

var ReduceCode = function(key, values) {
	var reduced = { "data": [] };

	for (var i in values) {
		var inter = values[i];
		for (var j in inter.data) {
			reduced.data.push(inter.data[j]);
		}
	}

	return reduced;
}

var Finalize = function(key, reduced) {
	if (reduced.data.length == 1) {
		return { "message" : "This Country contains only 1 City" };
	}

	var min_dist = 999999999999;
	var city1 = { "city": "" };
	var city2 = { "city": "" };

	var c1; var c2; var d;
	for (var i in reduced.data) {
		for (var j in reduced.data) {
			if (i >=j ) continue;
			c1 = reduced.data[i];
			c2 = reduced.data[j];
			d = (c1.lat-c2.lat)*(c1.lat-c2.lat)+(c1.lon-c2.lon)*(c1.lon-c2.lon);
			if (d < min_dist && d > 0) {
				min_dist = d;
				city1 = c1;
				city2 = c2;
			}
		}
	}

	return {
		"city1": city1.city,
		"city2": city2.city,
		"dist": Math.sqrt(min_dist)
	};
}

db.runCommand({
	mapReduce: "cities",
	map: MapCode,
	reduce: ReduceCode,
	finalize: Finalize,
	query: { CountryID: { $ne: 254 } },
	out: { merge: "closest_cities" }
});

print ( "1. " );
var object = db.closest_cities.find({"value.city1": {$ne: ""},"value.city2": {$ne: ""}}).sort({"value.dist": 1}).pretty();
object.forEach(printjson);

/***
2.
***/

//reutilizamos las funciones MapCode y ReduceCode

var Finalize = function(key, reduced) {
	if (reduced.data.length == 1) {
		return { "message" : "This Country contains only 1 City" };
	}

	var max_dist = 0;
	var city1 = { "city": "" };
	var city2 = { "city": "" };

	var c1;
	var c2;
	var d;
	for (var i in reduced.data) {
		for (var j in reduced.data) {
			if (i>=j) continue;
			c1 = reduced.data[i];
			c2 = reduced.data[j];
			d = (c1.lat - c2.lat) * (c1.lat - c2.lat) + (c1.lon - c2.lon) * (c1.lon - c2.lon);
			if (d > max_dist && d > 0) {
				max_dist = d;
				city1 = c1;
				city2 = c2;
			}
		}
	}

	return {
		"city1": city1.city,
		"city2": city2.city,
		"dist": Math.sqrt(max_dist)
	};
}

db.runCommand({
	mapReduce: "cities",
	map: MapCode,
	reduce: ReduceCode,
	finalize: Finalize,
	query: { CountryID: { $ne: 254 } },
	out: { merge: "distant_cities" }
});

print ( "2. " );
var object = db.distant_cities.find({"value.city1": {$ne: ""},"value.city2": {$ne: ""}}).sort({"value.dist": -1}).pretty();
object.forEach(printjson);

/***
3
***/

//reutilizamos MapCode / ReduceCode

var Finalize = function(key, reduced) {
	if (reduced.data.length == 1) {
		return { "message" : "This Country contains only 1 City" };
	}

	var min_dist = 999999999999;
	var cities = [];
	var c1;
	var c2;
	var d;
	for (var i in reduced.data) {
		for (var j in reduced.data) {
			if (i>=j) continue;
			c1 = reduced.data[i];
			c2 = reduced.data[j];
			d = (c1.lat-c2.lat)*(c1.lat-c2.lat)+(c1.lon-c2.lon)*(c1.lon-c2.lon);

			if (d < min_dist && d > 0) {
				min_dist = d;
				cities.push({ "city1": c1.city, "city2": c2.city });
			}
		}
	}

	return {
		"cities": cities,
		"dist": Math.sqrt(min_dist)
	};
}

db.runCommand({
	mapReduce: "cities",
	map: MapCode,
	reduce: ReduceCode,
	finalize: Finalize,
	query: { CountryID: { $ne: 254 } },
	out: { merge: "idem_closest_cities" }
});

print ( "3. " );
var object = db.idem_closest_cities.find({"value.dist": {$lt: 999999.9999995}}).sort({"value.dist": 1}).pretty();
object.forEach(printjson);

/***
4.
***/

//reutilizamos MapCode / ReduceCode

var Finalize = function(key, reduced) {
	if (reduced.data.length == 1) {
		return { "message" : "This Country contains only 1 City" };
	}
	var min_dist = 999999999999;
	var cities = [];
	var c1;
	var c2;
	var d;
	var count_cities = 0;
	for (var i in reduced.data) {
		for (var j in reduced.data) {
			if (i >= j)  continue;
			c1 = reduced.data[i];
			c2 = reduced.data[j];
			d = (c1.lat - c2.lat) * (c1.lat - c2.lat) + (c1.lon - c2.lon) * (c1.lon - c2.lon);
			if (d > 0) {
				count_cities++;
				if (d < min_dist) {
					min_dist = d;
					cities.push({ "city1": c1.city, "city2": c2.city });
				}
			}
		}
	}
	return {
		"cities": cities,
		"evaluated": count_cities,
		"dist": Math.sqrt(min_dist)
	};
}

db.runCommand({
	mapReduce: "cities",
	map: MapCode,
	reduce: ReduceCode,
	finalize: Finalize,
	query: { CountryID: { $ne: 254 } },
	out: { merge: "count_closest_cities" }
});

print ( "4. " );
var object = db.count_closest_cities.find({"value.dist": {$lt: 999999.9999995}}).sort({"value.dist": 1}).pretty();
object.forEach(printjson);

/***
5.
***/

//reutilizamos MapCode / ReduceCode

var Finalize = function(key, reduced) {
	if (reduced.data.length == 1) {
		return { "message" : "This Country contains only 1 City" };
	}
	var min_dist = 999999999999;
	var cities = [];
	var c1;
	var c2;
	var d;
	var count_cities = 0;
	var tot_distance = 0;
	for (var i in reduced.data) {
		for (var j in reduced.data) {
			if (i >= j)  continue;
			c1 = reduced.data[i];
			c2 = reduced.data[j];
			d = (c1.lat - c2.lat) * (c1.lat - c2.lat) + (c1.lon - c2.lon) * (c1.lon - c2.lon);
			if (d > 0) {
				count_cities++;
				tot_distance += d;
				if (d < min_dist) {
					min_dist = d;
					cities.push({ "city1": c1.city, "city2": c2.city });
				}
			}
		}
	}
	return {
		"cities": cities,
		"avgDistance": tot_distance / count_cities,
		"dist": Math.sqrt(min_dist)
	};
}

db.runCommand({
	mapReduce: "cities",
	map: MapCode,
	reduce: ReduceCode,
	finalize: Finalize,
	query: { CountryID: { $ne: 254 } },
	out: { merge: "avg_closest_cities" }
});

print ( "5. " );
var object = db.avg_closest_cities.find({"value.dist": {$lt: 999999.9999995}}).sort({"value.dist": 1}).pretty();
object.forEach(printjson);

/***
6.
***/

// tomamos el último query, aplicamos índices

print ( "6. " );
var d;

for(var i = 0; i<10; i++){

  print ( "***** Iteration " + i + "*****" );

	db.cities.ensureIndex({"CountryID": 1}, {unique: true});
	var d = new Date().getTime();
	db.runCommand({
		mapReduce: "cities",
		map: MapCode,
		reduce: ReduceCode,
		finalize: Finalize,
		query: { CountryID: { $ne: 254 } },
		out: { merge: "avg_closest_cities" }
	});
	print ( "CountryID - Seconds. " + ((new Date().getTime() - d)/1000) );

	db.cities.ensureIndex({"CountryID": 1, "City": 1}, {unique: true});
	d = new Date().getTime();
	db.runCommand({
		mapReduce: "cities",
		map: MapCode,
		reduce: ReduceCode,
		finalize: Finalize,
		query: { CountryID: { $ne: 254 } },
		out: { merge: "avg_closest_cities" }
	});
	print ( "CountryID+City - Seconds. " + ((new Date().getTime() - d)/1000) );

	db.cities.ensureIndex({"City": 1, "Latitude": 1, "Longitude": 1}, {unique: true});
	d = new Date().getTime();
	db.runCommand({
		mapReduce: "cities",
		map: MapCode,
		reduce: ReduceCode,
		finalize: Finalize,
		query: { CountryID: { $ne: 254 } },
		out: { merge: "avg_closest_cities" }
	});
	print ( "City+Latitude+Longitude - Seconds. " + ((new Date().getTime() - d)/1000) );

	db.cities.ensureIndex({"CountryID": 1, "City": 1, "Latitude": 1, "Longitude": 1}, {unique: true});
	d = new Date().getTime();
	db.runCommand({
		mapReduce: "cities",
		map: MapCode,
		reduce: ReduceCode,
		finalize: Finalize,
		query: { CountryID: { $ne: 254 } },
		out: { merge: "avg_closest_cities" }
	});
	print ( "CountryID+City+Latitude+Longitude - Seconds. " + ((new Date().getTime() - d)/1000) );

	d = new Date().getTime();
	db.runCommand({
		mapReduce: "cities",
		map: MapCode,
		reduce: ReduceCode,
		finalize: Finalize,
		query: { CountryID: { $ne: 254 } },
		out: { merge: "avg_closest_cities" }
	});
	print ( "NONE - Seconds. " + ((new Date().getTime() - d)/1000) );
}
