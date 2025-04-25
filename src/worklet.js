class ForwardProcessor extends AudioWorkletProcessor {

  constructor({ processorOptions }) {
    super();
    let memory = new WebAssembly.Memory({ initial: 2, maximum: 2, shared: true });
    this.memory = new Float32Array(memory.buffer);
    // TODO: make size flexible (not just 128)
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process#:~:text=Note%3A%20Currently,a%20particular%20size.
    // We want ~50ms of audio. Assuming sample rate of 44100 (TODO: flexible)
    // 44100*.05/128 = 17.2265625 => we want around 17 audio blocks
    // 0..(128*17)

    WebAssembly.instantiate(processorOptions.module,
      { imports: { i: console.log, mem: memory, sin: Math.sin, cos: Math.cos } },
    ).then(
      obj => {
        this.instance = obj.instance;
      }
    );
    this.counter = 0;
  }

  process(inputList, outputList, _parameters) {
    if (!this.instance) {
      console.log("no worklet")
      return;
    }

    const input = inputList[0];
    let output = outputList[0];
    if (this.counter == 0) {
      console.log("hit once")
    }

    if (input.length < 1) { console.log(input.length); return };

    const DATA_BLOCK_LEN = 128;
    const DATA_BLOCK_CHUNKS = 17;
    // const DATA_BLOCK_CHUNKS = 100;
    if (DATA_BLOCK_LEN != input[0].length)
      throw Error("mismatched length");
    for (const [i, v] of input[0].entries()) {
      output[0][i] = this.instance.exports.add(v, input[0][i]);
      this.memory[(this.counter % DATA_BLOCK_CHUNKS) * DATA_BLOCK_LEN + i] = v;
    }
    if (this.counter % DATA_BLOCK_CHUNKS == 0) {
      const freqs =
        // C major scale
        [
          3, 5, 7, 8, 10, 12, 14, 15
        ].map(o => 440 * Math.pow(2, 1 + o / 12));
      const scores = freqs.flatMap(v => Math.hypot(
        this.instance.exports.dot_product_sin(44100, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
        this.instance.exports.dot_product_cos(44100, v, 0, DATA_BLOCK_CHUNKS * DATA_BLOCK_LEN, Math.PI),
      ));
      const best_index = scores
        .reduce((pv, cv, i) => {
          if (pv.value < cv) {
            return { value: cv, index: i };
          }
          return pv;
        }, { value: 0, index: -1 });
      const f = (best_index.index % 2 == 0) ? "sin" : "cos";
      const freq = (best_index.index == -1) ? 0 : freqs[best_index.index >> 1];
      this.port.postMessage(scores);
    }

    this.counter += 1;
    return true;
  }
}

registerProcessor("forwarding-processor", ForwardProcessor);

