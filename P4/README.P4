#Cálculo de MIN, MAX y AVG con Big Data

#Descargamos el código Java a nuestra carpeta:
mkdir stat
cp /tmp/Min* ./stat/
#Comprobamos que la ruta de los datos de entrada:
hdfs dfs -ls /tmp/BDCC/datasets/ECBDL14/

#Cálculos
#Creamos el directorio de clases en local
cd stat
mkdir java_classes
#Copiamos por scp desde local
exit
MYPATH='/media/marvin/8868F00968EFF43A/Academico/MII/CC2/Practices/MII-CC17/P4/src/stat'
scp $MYPATH/* mcc4423998@hadoop.ugr.es:~/stat/
#Volver a ingresar
ssh mcc4423998@hadoop.ugr.es
#Compilamos y ejecutamos
cd stat
javac -cp /usr/lib/hadoop/*:/usr/lib/hadoop-mapreduce/* -d java_classes *.java
/usr/java/jdk1.7.0_51/bin/jar -cvf Stat.jar -C java_classes / .
#Borramos directorios hdfs (si existen)
hdfs dfs -rm ./Min/output/* && hdfs dfs -rmdir ./Min/output/
hdfs dfs -rm ./Max/output/* && hdfs dfs -rmdir ./Max/output/
hdfs dfs -rm ./MaxMin/output/* && hdfs dfs -rmdir ./MaxMin/output/
hdfs dfs -rm ./Avg/output/* && hdfs dfs -rmdir ./Avg/output/
hdfs dfs -rm ./Bal/output/* && hdfs dfs -rmdir ./Bal/output/
hdfs dfs -rm ./Corr/output/* && hdfs dfs -rmdir ./Corr/output/
hdfs dfs -rm ./Stats/output/* && hdfs dfs -rmdir ./Stats/output/
#Tasks params: file_in dir_out operation[Min,Max,MaxMin,Avg,Bal] colum[0-10 or -1 for all] 
#Min col 5
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Min/output/ Min 5
hdfs dfs -cat Min/output/*
#Max col 5
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Max/output/ Max 5
hdfs dfs -cat Max/output/*
#MaxMin col 5
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./MaxMin/output/ MaxMin 5
hdfs dfs -cat MaxMin/output/*
#MaxMin all col
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./MaxMin/output/ MaxMin -1
hdfs dfs -cat MaxMin/output/*
#Avg col 5
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Avg/output/ Avg 5
hdfs dfs -cat Avg/output/*
#Avg all col
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Avg/output/ Avg -1
hdfs dfs -cat Avg/output/*
#Bal col 10
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Bal/output/ Bal 10
hdfs dfs -cat Bal/output/*
#Corr all col
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Corr/output/ Corr -1
hdfs dfs -cat Corr/output/*

#Adicionales
#Stats col 4
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Stats/output/ Stats 4
hdfs dfs -cat Stats/output/*
#Stats all col
hdfs dfs -rm ./Stats/output/* && hdfs dfs -rmdir ./Stats/output/
hadoop jar Stat.jar oldapi.Stat /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./Stats/output/ Stats -1
hdfs dfs -cat Stats/output/*
##Comprobamos que la ruta de los datos de comparacion
hdfs dfs -ls /user/isaac/datasets/higgs*
#Stats all col
hadoop jar Stat.jar oldapi.Stat /user/isaac/datasets/higgsImb10-5-fold/higgsImb10.data ./Stats/compare/ Stats -1
hdfs dfs -cat Stats/compare/*

#Descargar al Reducer parte de la tarea
#Creamos el directorio de clases en local
mkdir statCleanup
cd statCleanup
mkdir java_classes
#Copiamos por scp desde local
exit
MYPATH='/media/marvin/8868F00968EFF43A/Academico/MII/CC2/Practices/MII-CC17/P4/src/statCleanup'
scp $MYPATH/* mcc4423998@hadoop.ugr.es:~/statCleanup/
#Volver a ingresar
ssh mcc4423998@hadoop.ugr.es
#Compilamos y ejecutamos
cd statCleanup
javac -cp /usr/lib/hadoop/*:/usr/lib/hadoop-mapreduce/* -d java_classes *.java
/usr/java/jdk1.7.0_51/bin/jar -cvf StatCleanup.jar -C java_classes / .
#Stats all columns
hdfs dfs -rm ./StatCleanup/output/* && hdfs dfs -rmdir ./StatCleanup/output/
hadoop jar StatCleanup.jar oldapi.StatCleanup /tmp/BDCC/datasets/ECBDL14/ECBDL14_10tst.data ./StatCleanup/output/
hdfs dfs -cat StatCleanup/output/*

