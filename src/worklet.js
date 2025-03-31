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
      console.log(input, output)
      for (let i = 0; i < 1000; i++) {
        this.memory[i] = Math.sin(i * 0.1 * 2 * Math.PI);
      }
      console.log(this.memory)
      console.log("dot sin", this.instance.exports.dot_product_sin(44100, 4410, 0, 1000, Math.PI))
      console.log("dot sin", this.instance.exports.dot_product_sin(44100, 2300, 0, 1000, Math.PI))
      console.log("dot sin", this.instance.exports.dot_product_sin(44100, 4400, 0, 1000, Math.PI))
      console.log("dot sin", this.instance.exports.dot_product_sin(44100, 4300, 0, 1000, Math.PI))
      console.log("dot sin", this.instance.exports.dot_product_sin(44100, 4420, 0, 1000, Math.PI))
      console.log("dot cos", this.instance.exports.dot_product_cos(44100, 4410, 0, 1000, Math.PI))
      console.log("dot cos", this.instance.exports.dot_product_cos(44100, 2300, 0, 1000, Math.PI))
      console.log("dot cos", this.instance.exports.dot_product_cos(44100, 4400, 0, 1000, Math.PI))
      console.log("dot cos", this.instance.exports.dot_product_cos(44100, 4300, 0, 1000, Math.PI))
      console.log("dot cos", this.instance.exports.dot_product_cos(44100, 4420, 0, 1000, Math.PI))
    }


    let sum = 0;
    for (const [i, v] of input[0].entries()) {
      this.memory[i] = v;
      output[0][i] = this.instance.exports.add(v, input[1][i]);
      // sum += output[0][i];
    }
    if (this.counter < 1) {
      // TODO: check f32
      this.instance.exports.f(this.counter/ 10);
    }
    this.counter += 1;
    return true;
  }
}

registerProcessor("forwarding-processor", ForwardProcessor);

