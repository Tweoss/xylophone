default:
    just build

list:
    just --list

build:
    wat2wasm src/process.wat -o build/process.wasm --enable-threads --enable-multi-memory
    tsc
    cp src/worklet.js build/worklet.js
watch:
    watchexec -d 10ms -v -w src 'just build'
serve:
    penguin serve . -p 8080 --no-auto-watch -w index.html -w build --debounce 500
