// Consulta de Documentos

// Crear la colección pedidos en cada BD asociada a vuestro usuario, sobre la que se realizarán diversas operaciones CRUD. Para crear la colección abre y ejecuta el script insertar_pedidos.js (accesible en /tmp/mongo). Las tareas a realizar son las siguientes:

/***
1. Visualiza la colección pedidos y familiarízate con ella. Observa los distintos tipos de datos y sus estructuras dispares.
2. Visualiza sólo el primer documento de la colección. Utiliza los métodos .limit() y .findOne()
3. Visualiza el cliente con id_cliente = 2222
4. Visualiza los clientes que hayan pedido algún producto de más de 94 euros
5. Visualiza los clientes de Jaén o Salamanca (excluye los datos de los pedidos). Utiliza los operador $or e $in
6. Visualiza los clientes no tienen campo pedidos
7. Visualiza los clientes que hayan nacido en 1963
8. Visualiza los clientes que hayan pedido algún producto fabricado por Canon y algún producto cuyo precio sea inferior a 15 euros
9. Datos personales (id_cliente, Nombre, Direccion, Localidad y Fnacimiento) de los clientes cuyo nombre empieza por la cadena "c" (No distinguir entre mayusculas y minúsculas)
10. Visualiza los datos personales de los clientes (excluyendo _id). Limita los documentos a 4
11. Ídem anterior pero ordenando los documentos por Localidad (ascendente) e id_cliente (descendente)
***/

// creamos colección a partir de script (previamente importado o creado)
db.pedidos.drop(); // borra para inicializar DB
load('insertar_pedidos.js');

// 1
print ( "1. " );
var object = db.pedidos.find().pretty();
object.forEach(printjson);

// 2
print ( "2. " );
var object = db.pedidos.findOne(); 
if (object) {
   var myObject = object.id_cliente+"|"+object.Nombre;
   print (myObject);
}
print ( " and " );
var object = db.pedidos.find().limit(1).pretty();
object.forEach(printjson);

// 3
print ( "3. " );
var object = db.pedidos.find({"id_cliente": 2222}).pretty();
object.forEach(printjson);
 
// 4
print ( "4. " );
var object = db.pedidos.find({"Pedidos.Productos.Precio_unidad": {$gt: 94}}).pretty();
object.forEach(printjson);

// 5
print ( "5. " );
var object = db.pedidos.find(
    {$or:[{"Localidad": "Salamanca"}, {"Localidad": "Jaen"}]}, 
    {"Pedidos": 0}
).pretty();
object.forEach(printjson);
print ( " or " );
var object = db.pedidos.find(
    {"Localidad": {$in: ["Salamanca", "Jaen"]}}, 
    {"Pedidos": 0}
).pretty();
object.forEach(printjson);

// 6
print ( "6. " );
var object = db.pedidos.find({"Pedidos": {$exists: false}}).pretty();
object.forEach(printjson);

// 7
print ( "7. " );
var object = db.pedidos.find({"Fnacimiento": {$gte: new Date("1963-01-01"), $lt: new Date("1964-01-01")}}).pretty();
object.forEach(printjson);

// 8
print ( "8. " );
var object = db.pedidos.find(
    {"Pedidos.Productos.Fabricante": "Canon", 
    "Pedidos.Productos.Precio_unidad": {$lt: 15}}
).pretty();
object.forEach(printjson);

// 9
print ( "9. " );
var object = db.pedidos.find(
    {"Nombre": /^c/i}, 
    {"id_cliente": 1, "Nombre": 1, "Direccion": 1, "Localidad": 1, "Fnacimiento": 1,}
).pretty();
object.forEach(printjson);

// 10
print ( "10. " );
var object = db.pedidos.find(
    {}, 
    {"_id": 0, "Pedidos": 0, "Facturacion": 0}
).limit(4).pretty();
object.forEach(printjson);

// 11
print ( "11. " );
var object = db.pedidos.find(
    {}, 
    {"_id": 0, "Pedidos": 0, "Facturacion": 0}
).sort({"Localidad": 1, "id_cliente": -1}).limit(4).pretty();
object.forEach(printjson);
