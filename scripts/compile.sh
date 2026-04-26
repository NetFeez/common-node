#!/bin/bash

if npx dep install > .compile.log 2>&1; then
  echo -e "\x1B[32mDependencies installed successfully.\x1B[0m"
else
  echo -e "\x1B[31mFailed to install dependencies.\x1B[0m"
  tail .compile.log
  exit 1
fi
if npx tsc -pretty > .compile.log 2>&1 && npx dep fix-paths >> .compile.log 2>&1; then
  echo -e "\x1B[32mServer compilation successful.\x1B[0m"
else
  echo -e "\x1B[31mServer compilation failed.\x1B[0m"
  tail .compile.log
  exit 1
fi
if npx tsc -pretty -p tsconfig.client.json > .compile.log 2>&1; then
  echo -e "\x1B[32mClient compilation successful.\x1B[0m"
else
  echo -e "\x1B[31mClient compilation failed.\x1B[0m"
  tail .compile.log
  exit 1
fi