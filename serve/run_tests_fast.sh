#!/bin/bash
list_descendants () {
  local children=$(ps -o pid= --ppid "$1")

  for pid in $children
  do
    list_descendants "$pid"
  done

  echo "$children"
}

shutdown() {
  kill $(list_descendants $$) &> /dev/null
}

./serve/run_node.sh &> /dev/null  &
yarn run truffle migrate
yarn run truffle test ./test/owned.js ./test/sber_token.js ./test/wealth_management_test.js
shutdown &> /dev/null
trap 'shutdown' SIGINT SIGTERM EXIT
