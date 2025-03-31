build:
    wat2wasm src/process.wat -o build/process.wasm
    tsc
watch:
    watchexec 'just build' -d 0 -v -w src
serve:
    penguin serve . -p 8080 --no-auto-watch -w index.html -w build --debounce 400
