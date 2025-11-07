import { init } from "./lib.js";

document.querySelector("#init").addEventListener("click", () => {
  const target = document.querySelector(
    "#audio-file-input",
  ) as HTMLInputElement;
  const files = target.files;
  if (files && files[0] && !document.querySelector("audio")) {
    const p = document.createElement("p");
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(files[0]);
    audio.controls = true;
    p.appendChild(audio);

    target.after(p);
    init(audio);
  } else {
    init();
  }
});

// init();
