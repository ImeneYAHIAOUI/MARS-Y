#!/bin/bash

function compile_dir()  # $1 is the dir to get it
{
    cd "$1"
    ./build.sh
    cd ..
}

echo "** Compiling all"

compile_dir "marsy-launchpad"
compile_dir "marsy-weather"
compile_dir "marsy-mission"
compile_dir "marsy-telemetry"
compile_dir "marsy-mock"
compile_dir "marsy-payload"
compile_dir "marsy-boostercontrol"
compile_dir "marsy-guidance"
compile_dir "marsy-payload-hardware"
compile_dir "marsy-webcaster"
compile_dir "client-service"
compile_dir "broadcast-service"
compile_dir "pilot-service"
compile_dir "load-tests"

echo "** Done all"