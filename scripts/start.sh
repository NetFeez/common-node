#!/bin/bash

if npm run compile > /dev/null; then
  echo -e "\x1B[32mCompilation successful. Starting server...\x1B[0m"
  node build/server.js
else
  echo -e "\x1B[31mCompilation failed. Server not started.\x1B[0m"
  tail .compile.log
  exit 1
fi