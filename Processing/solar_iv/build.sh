#!/bin/sh

# You need Processing (Java) in your $PATH
VARIANT=linux-amd64
processing-java --sketch=`pwd` --output=`pwd`/build --force --variant=${VARIANT} --run

