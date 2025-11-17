import { init } from "./lib.js";
document.querySelector("#init").addEventListener("click", function () {
    var target = document.querySelector("#audio-file-input");
    var files = target.files;
    if (files && files[0] && !document.querySelector("audio")) {
        var p = document.createElement("p");
        var audio = document.createElement("audio");
        audio.src = URL.createObjectURL(files[0]);
        audio.controls = true;
        p.appendChild(audio);
        target.after(p);
        init(audio);
    }
    else {
        init();
    }
});
// init();
//# sourceMappingURL=index.js.map