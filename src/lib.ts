let initializing = false;

export async function init() {
  if (initializing) return;
  initializing = true;
  const audio_context = new AudioContext();
  await audio_context.audioWorklet.addModule("./build/worklet.js");
  const input = audio_context.createMediaStreamSource(
    await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false },
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
  const target = document.querySelector("#container");
  let bars: null | SVGRectElement[] = null;
  processor_node.port.onmessage = (e) => {
    const data: number[] = e.data;
    // console.log(data);
    if (!bars) {
      bars = data.map((_, i) => {
        const svgns = "http://www.w3.org/2000/svg";
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", (i * (100 / data.length)).toString());
        rect.setAttribute("y", "00");
        rect.setAttribute("height", "00");
        rect.setAttribute("width", (100 / data.length).toString());

        const rotation = ((1 + Math.sqrt(5)) / 2) * 10;
        rect.setAttribute(
          "fill",
          `hsl(${360 * ((rotation * i) % 1)}, 90%, 90%)`,
        );
        target.appendChild(rect);
        return rect;
      });
    }

    const scale_factor = 4;
    for (const [i, value] of data.entries()) {
      bars[i].setAttribute(
        "height",
        Math.max(
          0,
          scale_factor * (isNaN(value) ? 0 : Math.max(0, value)),
        ).toString(),
      );
    }
  };
  console.log("made worklet");

  input.connect(processor_node);
  processor_node.connect(audio_context.destination);
}

export function greet() {
  const p = document.createElement("p");
  p.innerText = "welcome";
  document.querySelector("p")?.appendChild(p);
}
