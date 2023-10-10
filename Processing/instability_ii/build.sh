#!/bin/sh

# You need Processing (Java) in your $PATH
VARIANT=linux-amd64
JAVA_OPTS="-Xms2048m -Xmx2048m"

_JAVA_OPTIONS=${JAVA_OPTS} processing-java --sketch=`pwd` --output=`pwd`/build --force --variant=${VARIANT} --run

