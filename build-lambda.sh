#!/bin/bash
cd src
npm install
mkdir -p ../terraform/dist
zip -r ../terraform/dist/lambda_functions.zip ./*

