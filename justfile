build:
    wat2wasm src/process.wat -o build/process.wasm --enable-threads --enable-multi-memory
    tsc
    cp src/worklet.js build/worklet.js
watch:
    watchexec 'just build' -d 0 -v -w src
serve:
    penguin serve . -p 8080 --no-auto-watch -w index.html -w build --debounce 500
