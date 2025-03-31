let initializing = false;

export async function init() {
  if (initializing) return;
  initializing = true;
  const audio_context = new AudioContext();
  await audio_context.audioWorklet.addModule("./build/worklet.js");
  const input = audio_context.createMediaStreamSource(
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    }),
  );
  console.log(input);
  console.log(audio_context.destination);

  const processor_node = new AudioWorkletNode(
    audio_context,
    "forwarding-processor",
    {
      processorOptions: {
        module: await (await fetch("./build/process.wasm")).arrayBuffer(),
      },
    },
  );
  console.log("made worklet");

  input.connect(processor_node);
  processor_node.connect(audio_context.destination);
}

export function greet() {
  console.log("hello console");
  const p = document.createElement("p");
  p.innerText = "welcome";
  document.querySelector("p")?.appendChild(p);
}
