#!/bin/bash

#OwnCloud
#Network for the application and the database, works since Docker 1.9.0 
#docker network create owncloud-tier
#latter, add in docker run '--net=owncloud-tier'

#Create directories for persistence
mkdir mariadb-persistence 
mkdir owncloud-data && mkdir owncloud-config
#DB
docker run -d --name mm.mariadb -e ALLOW_EMPTY_PASSWORD=yes \
 --volume ~/mariadb-persistence:/bitnami/mariadb bitnami/mariadb
#App
docker run -d -it --name mm.owncloud -p 14004:80 \
 --volume ~/owncloud-data:/var/www/html/data \
 --volume ~/owncloud-config:/var/www/html/config \
 -e OWNCLOUD_HOST=hadoop.ugr.es --link mm.mariadb:owncloud-db \
 owncloud
#Go to yourip:14004 -> yourAdmin@yourPass, root@empty, db=youPutName, host=mm.mariadb
