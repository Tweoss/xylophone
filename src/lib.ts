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
    const NOISE_THRESHOLD = 10;
    const DOT_PRODUCT_THRESHOLD = 15;
    const data: number[] = e.data;
    if (!ignore_next && last_data && data.toSorted()[0] < NOISE_THRESHOLD) {
      const delta = data.map((v, i) => [i, v - last_data[i]]);
      const sorted = delta.toSorted((a, b) => b[1] - a[1]);
      const [a, b] = sorted.slice(0, 2);
      if (Math.min(a[1], b[1]) > DOT_PRODUCT_THRESHOLD) {
        decoder.push(a[0], b[0]);
        console.log("big delta", a, b);
        log_element.innerText = decoder.get_state();
        ignore_next = true;
      }
    } else {
      ignore_next = false;
    }
    last_data = data;
    if (!bars) {
      bars = data.map((_, i) => {
        const svgns = "http://www.w3.org/2000/svg";
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", (i * (100 / data.length)).toString());
        rect.setAttribute("y", "00");
        rect.setAttribute("height", "00");
        rect.setAttribute("width", (100 / data.length).toString());

        // const rotation = ((1 + Math.sqrt(5)) / 2) * 10;
        const rotation = Math.pow(i / 7, 1.2);
        // const rotation = 1 / 7;
        rect.setAttribute("fill", `hsl(${360 * (rotation % 1)}, 90%, 90%)`);
        target.appendChild(rect);
        return rect;
      });
    }

    // TODO: better scaling factor?
    const scale_factor = 10;
    for (const [i, value] of data.entries()) {
      const v =
        scale_factor *
        Math.max(0, Math.log(isNaN(value) ? 1 : Math.max(1, value)));
      bars[i].setAttribute("y", (-v + 70).toString());
      bars[i].setAttribute("height", v.toString());
    }
  };

  input.connect(processor_node);
  processor_node.connect(audio_context.destination);
}

function create_decoder() {
  type State = "Normal" | "Escape" | "Shift";

  const get_index = (note_pair: [number, number]) => {
    note_pair.sort();

    const [n1, n2] = note_pair;
    const index = (8 * 7) / 2 - ((8 - n1) * (7 - n1)) / 2 + (n2 - n1 - 1);
    return index;
  };

  const normal_map = (index: number) => {
    if (index < 26) {
      const lowercase_letter_start = 97;
      return {
        action: "Letter" as const,
        value: String.fromCodePoint(lowercase_letter_start + index),
        state: "Normal" as State,
      };
    }
    if (index == 26)
      return {
        action: "Repeat" as const,
        state: "Normal" as State,
      };
    if (index == 27)
      return { action: "None" as const, state: "Escape" as State };
  };

  const escape_map = (index: number) => {
    if (index == 0)
      return {
        action: "Delete" as const,
        state: "Normal" as State,
      };
    if (index == 1)
      return {
        action: "Return" as const,
        state: "Normal" as State,
      };
    if (index == 2) return { action: "None" as const, state: "Shift" as State };
    return null;
  };

  type Result = ReturnType<typeof normal_map> | ReturnType<typeof escape_map>;

  let state = "Normal" as State;
  let decoded = "";
  let last_result: Result | null = null;

  function handle_action(result: Result) {
    const action = result.action;
    console.log("got action", result);
    switch (action) {
      case "Letter":
        decoded += result.value;
        last_result = result;
        return;
      case "Delete":
        decoded = decoded.slice(0, -1);
        last_result = result;
        return;
      case "Repeat":
        if (last_result && last_result.action != "Repeat") {
          console.log("repeating action", last_result);
          // TODO: could be inconsistent
          handle_action(last_result);
        }
        return;
      case "Return":
        decoded += "\n";
        last_result = result;
        return;
      case "None":
        last_result = result;
        return;
      default:
        const exhaustiveCheck: never = result;
        throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }

  return {
    push: (note_a: number, note_b: number) => {
      const index = get_index([note_a, note_b]);
      console.log("index ", index);
      if (state == "Normal") {
        const result = normal_map(index);
        console.log(result);
        handle_action(result);
        state = result.state;
      } else if (state == "Escape") {
        const result = escape_map(index);
        console.log(result);
        if (result) {
          handle_action(result);
          state = result.state;
        }
      } else if (state == "Shift") {
        const result = normal_map(index);
        console.log(result);
        if (result.action == "Letter") {
          result.value = result.value.toUpperCase();
          handle_action(result);
        }
        state = result.state;
      }
    },
    get_state: () => {
      return `decoded: ${decoded}`;
    },
  };
}
