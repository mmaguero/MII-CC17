//Agregación

//A partir de la colección pedidos utilizaremos consultas más complejas por medio de los operadores de agregación (pipeline). Por facilidad se indica la consulta en formato SQL estándar. Las tareas a realizar en este caso obtener:

/***
1. No. total de clientes
SELECT COUNT(*) "NUMERO DE CLIENTES"
FROM pedidos;
2. No. total de clientes de Jaén
SELECT COUNT(*) "NUMERO DE CLIENTES"
FROM pedidos
WHERE Localidad = "Jaen";
3. Facturación total clientes por localidad
SELECT Localidad, SUM (Facturacion) "TOTAL"
FROM pedidos
GROUP BY Localidad;
4. Facturación media de clientes por localidad para las localidades distintas a "Jaen" con facturación media mayor de 5000. Ordenación por Localidad descendente. Eliminar el _id y poner el nombre en mayúsculas.
SELECT Localidad, AVG (Facturacion) "FACTURACION MEDIA"
FROM pedidos
WHERE Localidad <> "Jaen"
GROUP BY Localidad
HAVING AVG (Facturacion) > 5000
ORDER BY Localidad DESC;
5. Calcula la cantidad total facturada por cada cliente (uso de “unwind”)
SELECT id_cliente "IDENTIFICADOR", nombre "NOMBRE COMPLETO",
SUM (Precio_unidad * Pedidos) "TOTAL CLIENTE"
FROM pedidos
GROUP BY id_cliente, nombre
ORDER BY 2 DESC;
***/

// 1
print ( "1. " );
var object = db.pedidos.count();
print ( "NUMERO DE CLIENTES: " + object);
print ( " or " );
var object = db.pedidos.aggregate([
    {$count: "NUMERO DE CLIENTES"}
]);
object.forEach(printjson);


// 2
print ( "2. " );
var object = db.pedidos.find(
    {"Localidad": "Jaen"}
).count();
print ( "NUMERO DE CLIENTES: " + object);
print ( " or " );
var object = db.pedidos.aggregate([
    {$match: {Localidad: "Jaen"}},
    {$count: "NUMERO DE CLIENTES"}
]);
object.forEach(printjson);

// 3
print ( "3. " );
var object = db.pedidos.aggregate(
    [
        {
            $group:
            {
                "_id": "$Localidad",
                "TOTAL": {$sum: "$Facturacion"}
            }
        }
    ]
);
object.forEach(printjson);

// 4
print ( "4. " );
var object = db.pedidos.aggregate(
    [
        {
            $group:
            {
                "_id": "$Localidad",
                "FACTURACION MEDIA": {$avg: "$Facturacion"}
            }
        },
        {
            $match:
            {
                "_id": {$ne: "Jaen"},
                "FACTURACION MEDIA": {$gt: 5000}
            }
        },
        {
            $sort: { "_id": -1 }
        },
        {
            $project:
            {
                "_id": 0,
                "Localidad": {$toUpper: "$_id"},
                "FACTURACION MEDIA": 1
            }
        }
    ]
);
object.forEach(printjson);

// 5
print ( "5. " );
var object = db.pedidos.aggregate(
    [
        { $unwind: "$Pedidos" },
        { $unwind: "$Pedidos.Productos" },
        {
            $group:
            {
                "_id": {id_cliente: "$id_cliente", nombre: "$Nombre"},
                "TOTAL CLIENTE":
                {
                    $sum:
                    {
                        $multiply: [ "$Pedidos.Productos.Precio_unidad", "$Pedidos.Productos.Cantidad" ]
                    }
                }
            }
        },
        {
            $project:
            {
                "_id": 0,
                "IDENTIFICADOR": "$_id.id_cliente",
                "NOMBRE COMPLETO": "$_id.nombre",
                "TOTAL CLIENTE": 1
            }
        },
        {
            $sort: { "NOMBRE COMPLETO": -1 }
        }
    ]
);
object.forEach(printjson);
