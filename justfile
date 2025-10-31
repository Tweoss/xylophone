default:
    just build

list:
    just --list

build:
    #!/usr/bin/env bash
    mkdir build
    wasm-tools parse src/process.wat -o build/process.wasm
    wasm-tools parse src/trig.wat -o build/trig.wasm
    tsc
    cp src/worklet.js build/worklet.js
watch:
    watchexec -d 10ms -v -w src 'just build'
serve:
    penguin serve . -p 9090 --no-auto-watch -w index.html -w build --debounce 500
