#!/bin/bash

#Network for containers, since Docker 1.9.0
#docker network create app-tier --driver bridge
#latter, add in docker run '--network app-tier'

#Docker 1.7.1
#Container B
#Create directory for persistence
mkdir mysql-persistence-master
mkdir mysql-persistence-slave
#master
docker run -d --name mm.mysql-server \
  -v ~/mysql-persistence-master:/bitnami/mysql \
  -e MYSQL_ROOT_PASSWORD=master.pass.123 \
  -e MYSQL_REPLICATION_MODE=master \
  -e MYSQL_REPLICATION_USER=replmuser \
  -e MYSQL_REPLICATION_PASSWORD=replm.pass.123 \
  -e MYSQL_USER=webu -e MYSQL_PASSWORD=webu.123 \
  -e MYSQL_DATABASE=base1 \
  bitnami/mysql:latest
#write schema: tablets, inserts, etc...
#vim schema.sql
#exec schema
docker exec -i mm.mysql-server mysql -u webu -pwebu.123 -S /opt/bitnami/mysql/tmp/mysql.sock base1 <./schema.sql
#slave
docker run -d --name mm.mysql-slave --link mm.mysql-server:master \
  -v ~/mysql-persistence-slave:/bitnami/mysql \
  -e MYSQL_ROOT_PASSWORD=slave.pass.123 \
  -e MYSQL_REPLICATION_MODE=slave \
  -e MYSQL_REPLICATION_USER=replsuser \
  -e MYSQL_REPLICATION_PASSWORD=repls.pass.123 \
  -e MYSQL_MASTER_HOST=master \
  -e MYSQL_MASTER_ROOT_PASSWORD=replm.pass.123 \
  -e MYSQL_USER=webu -e MYSQL_PASSWORD=webu.123 \
  -e MYSQL_DATABASE=base1 \
  bitnami/mysql:latest

#Container A
#Clone github code
git clone https://github.com/mmaguero/Dancer-Plugin-SimpleCRUD appWeb
#Create directory for persistence
mkdir apache-persistence
#Write you Dockerfile and build
#vim Dockerfile
docker build -t mmaguero/dancer-plugin-simplecrud .
#Web server, connect to mysql-server container
docker run -d --name mm.apache -p 14000:80 -p 14001:443 \
  -v ~/appWeb/example:/home/bitnami -v ~/apache-persistences:/bitnami/apache \
  -h "hadoop.ugr.es" --link mm.mysql-server:mysqldb \
  mmaguero/dancer-plugin-simplecrud
#ssh to container web
docker exec -i -t mm.apache vim /opt/bitnami/apache/conf/httpd.conf
#/Listen #80 to 443
#/localhost:80 #your.serve.host
#/<Virtualhost> #add proxy_reverse
<<COMMENT
NameVirtualHost *:80
<VirtualHost *:80>

  ServerName hadoop.ugr.es

  #SSLEngine on
  #SSLCertificateFile /bitnami/apache/conf/bitnami/certs/server.crt
  #SSLCertificateKeyFile /bitnami/apache/conf/bitnami/certs/server.key

  <Proxy *>
    Order deny,allow
    Allow from all
  </Proxy>

  RewriteEngine on

  ProxyPass        / http://hadoop.ugr.es:14000/
  ProxyPassReverse / http://hadoop.ugr.es:14000/

</VirtualHost>
<IfModule mod_proxy.c>
        ProxyRequests Off
        <Proxy *>
               AddDefaultCharset off
                Order deny,allow
                Allow from all
        </Proxy>
        ProxyVia On
</IfModule>
COMMENT
#restart container
docker restart mm.apache
#ssh to container web, edit db credentials and more
docker exec -i -t mm.apache vim /home/bitnami/mysql/config.yml
#run app
docker exec -i -t mm.apache perl /home/bitnami/mysql/simplecrud-example.pl --port 14003 --daemon
#Replicate web server
docker run -d --name mm.apacherepl \
  -h "hadoop.ugr.es" -p 14002:80 \
  -v ~/appWeb/example:/home/bitnami -v ~/apache-persistences:/bitnami/apache \
  --link mm.mysql-server:mysqldb --link mm.apache:apache-master \
   mmaguero/dancer-plugin-simplecrud
#run app
docker exec -i -t mm.apacherepl perl /home/bitnami/mysql/simplecrud-example.pl --port 14003 --daemon
#load balancer
docker run -d --name mm.nginxld -p 14003:14003 nginx
#add servers and set proxy
docker exec -i -t mm.nginxld /bin/bash
echo "upstream servers {
server hadoop.ugr.es:14000;
server hadoop.ugr.es:14002;
}
server {
listen 14003;
location / {
proxy_pass http://servers;
}
}" > /etc/nginx/conf.d/default.conf
#restart container
docker restart mm.nginxld
#Go to http://localhost:14003/