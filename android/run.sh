#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n edu.rpi.unbeerlievable/host.exp.exponent.MainActivity
