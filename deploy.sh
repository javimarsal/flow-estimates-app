#!/bin/bash

if [ -z "$1" ];
then
    echo "No has proporcionado el mensaje del commit"
    exit
else
    cd frontend
    ng build
    cd ..
    git add .
    git commit -m "$1"
    git push origin master
fi