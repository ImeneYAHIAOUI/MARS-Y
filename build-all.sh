#!/bin/bash

function compile_dir()  # $1 is the dir to get it
{
    cd $1
    ./build.sh
    cd ..
}

echo "** Compiling all"

compile_dir "marsy-weather"
compile_dir "marsy-mission"
compile_dir "marsy-rocket"

echo "** Done all"

