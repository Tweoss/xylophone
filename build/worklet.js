async function generate_sine(array) {
  let memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
  const obj = await WebAssembly.instantiate(array, {
    imports: { log: console.log, mem: memory },
  });
  const delta_divider = 20.0;
  const buffer_length = obj.instance.exports.write_sin(
    delta_divider,
  );
  console.log(new Float32Array(memory.buffer).slice(0, buffer_length))

  return {
    sin: (v) => obj.instance.exports.sin(
      buffer_length,
      Math.PI,
      v
    ), cos: (v) => obj.instance.exports.cos(
      buffer_length,
      Math.PI,
      v
    )
  };
}

async function init_processor(processor, processorOptions) {
  const { sin, cos } = await generate_sine(processorOptions.trig_module);

  let memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
  processor.memory = new Float32Array(memory.buffer);

  WebAssembly.instantiate(processorOptions.module,
    { imports: { i: console.log, mem: memory, sin, cos } },
  ).then(
    obj => {
      processor.instance = obj.instance;
    }
  );
}

class ForwardProcessor extends AudioWorkletProcessor {

  constructor({ processorOptions }) {
    super();
    // TODO: make size flexible (not just 128)
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process#:~:text=Note%3A%20Currently,a%20particular%20size.
    // We want ~50ms of audio. Assuming sample rate of 44100 (TODO: flexible)
    // 44100*.05/128 = 17.2265625 => we want around 17 audio blocks
    // 0..(128*17)

    // Spawn off init.
    init_processor(this, processorOptions);
    this.counter = 0;
    this.sample_rate = processorOptions.sample_rate;
  }

  process(inputList, outputList, _parameters) {
    if (!this.instance) {
      console.log("no worklet")
      return;
    }

    const input = inputList[0];
    if (this.counter == 0) {
      console.log("hit once")
    }

    if (input.length < 1) { console.log(input.length); return };

    const DATA_BLOCK_LEN = 128;
    const DATA_BLOCK_CHUNKS = 17;
    // const DATA_BLOCK_CHUNKS = 17;
    // const DATA_BLOCK_CHUNKS = 100;
    if (DATA_BLOCK_LEN != input[0].length)
      throw Error("mismatched length");
    for (const [i, v] of input[0].entries()) {
      this.memory[(this.counter % DATA_BLOCK_CHUNKS) * DATA_BLOCK_LEN + i] = v;
    }
    if (this.counter % DATA_BLOCK_CHUNKS == 0) {
      const freqs =
        // C major scale
        [
          // 3, 4, 5,6, 7, 8, 9, 10, 11, 12,13,  14, 15

          // This C is really sharp and D starts flat.
          // Tuned to match most strongly (subdivisions of 1/20)
          3.05, 4.95, 7, 8, 10.05, 12, 14.05, 15.05
          // 15 + (1 - 4) * 0.05,
          // 15 + (2 - 4) * 0.05,
          // 15 + (3 - 4) * 0.05,
          // 15 + (4 - 4) * 0.05,
          // 15 + (5 - 4) * 0.05,
          // 15 + (6 - 4) * 0.05,
          // 15 + (7 - 4) * 0.05,
          // 15 + (8 - 4) * 0.05,
        ].map(o => 441 * Math.pow(2, 1 + o / 12));
      const scores = freqs.flatMap(v => Math.hypot(
        this.instance.exports.dot_product_sin(this.sample_rate, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
        this.instance.exports.dot_product_cos(this.sample_rate, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
        // this.instance.exports.dot_product_sin(48000, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
        // this.instance.exports.dot_product_cos(48000, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
      ));
      this.port.postMessage(scores);
    }

    this.counter += 1;
    return true;
  }
}

registerProcessor("forwarding-processor", ForwardProcessor);

