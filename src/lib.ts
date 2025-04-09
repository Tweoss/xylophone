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
  const target = document.querySelector("#container");
  let bars: null | SVGRectElement[] = null;
  processor_node.port.onmessage = (e) => {
    const data: number[] = e.data;
    // console.log(data);
    if (!bars) {
      bars = data.map((_, i) => {
        const svgns = "http://www.w3.org/2000/svg";
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", (i * (100 / 20)).toString());
        rect.setAttribute("y", "00");
        rect.setAttribute("height", "00");
        rect.setAttribute("width", (100 / 20).toString());

        const rotation = ((1 + Math.sqrt(5)) / 2) * 10;
        rect.setAttribute(
          "fill",
          `hsl(${360 * ((rotation * (i - (i % 2))) % 1)}, 90%, 90%)`,
        );
        target.appendChild(rect);
        return rect;
      });
    }

    let max_value = data.reduce((a, e) => (e > a ? e : a), 0);
    max_value = isNaN(max_value) ? 1 : max_value;

    const max_height = 40;
    for (const [i, value] of data.entries()) {
      bars[i].setAttribute(
        "height",
        Math.max(
          0,
          (max_height * (isNaN(value) ? 0 : value)) / max_value,
        ).toString(),
      );
    }
  };
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
