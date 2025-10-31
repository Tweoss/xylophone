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
        trig_module: await (await fetch("./build/trig.wasm")).arrayBuffer(),
        sample_rate: audio_context.sampleRate,
      },
    },
  );
  const target = document.querySelector("#container");
  const log_element = document.querySelector(
    "#text-out",
  ) as HTMLParagraphElement;
  const decoder = create_decoder();
  let bars: null | SVGRectElement[] = null;
  let last_data: number[] | null = null;
  // TODO: make better "debouncing" system
  let ignore_next = false;
  processor_node.port.onmessage = (e) => {
    const data: number[] = e.data;
    if (!ignore_next) {
      if (last_data) {
        const delta = data.map((v, i) => v - last_data[i]);
        const [max, max_i] = delta.reduce(
          ([a, ai], e, i) => (a > e ? [a, ai] : [e, i]),
          [0, -1],
        );
        const DOT_PRODUCT_THRESHOLD = 15;
        if (max > DOT_PRODUCT_THRESHOLD) {
          decoder.push(max_i);
          log_element.innerText = decoder.get_state();
          console.log("large deltas: ", delta, max_i);
          ignore_next = true;
        }
      }
    } else {
      ignore_next = false;
    }
    last_data = data;
    // console.log(data);
    // TODO: better scaling factor?
    const max = 100;
    // const max = data.reduce((a, e) => (a > e ? a : e), 1);
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

    const scale_factor = 20;
    for (const [i, value] of data.map((d) => (d / max) * 10).entries()) {
      const v = Math.max(
        0,
        scale_factor * (isNaN(value) ? 0 : Math.max(0, value)),
      );
      bars[i].setAttribute("y", (-v + 70).toString());
      bars[i].setAttribute("height", v.toString());
    }
  };

  input.connect(processor_node);
  processor_node.connect(audio_context.destination);
}

function create_decoder() {
  let pending = [];
  let decoded = "";
  let parse = () => {
    if (pending.length == 2) {
      const [x, y] = pending;
      const flattened = x * 8 + y;
      const capital_letter_range = [65, 90] as const;
      const space_number_range = [32, 57] as const;
      const range_len = (v: readonly [number, number]) => v[1] - v[0] + 1;
      if (flattened < range_len(capital_letter_range))
        decoded += String.fromCodePoint(flattened + capital_letter_range[0]);
      else if (
        flattened - range_len(capital_letter_range) <
        range_len(space_number_range)
      )
        decoded += String.fromCodePoint(
          flattened - range_len(capital_letter_range) + space_number_range[0],
        );
      else if (flattened == 7 * 8 + 7) {
        decoded = decoded.slice(0, -1);
      }
      pending = [];
    }
  };
  return {
    push: (note: number) => {
      pending.push(note);
      parse();
    },
    get_state: () => {
      return `pending: [${pending.toString()}], decoded: ${decoded}`;
    },
  };
}
