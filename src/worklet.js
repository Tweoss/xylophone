class ForwardProcessor extends AudioWorkletProcessor {

  constructor({ processorOptions }) {
    super();
    let memory =  new WebAssembly.Memory({ initial: 100, maximum: 100, shared: true });
    this.memory = new Float32Array(memory.buffer);

    WebAssembly.instantiate(processorOptions.module,
      { imports: { i: console.log, mem: memory } },
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
    }


    const copy = (src, dst) => {
      for (const [i, v] of src.entries()) {
        dst[i] = v;
      }
    }
    let sum = 0;
    for (const [i, v] of input[0].entries()) {
      output[0][i] = this.instance.exports.add(v, input[1][i]);
      sum += output[0][i];
    }
    this.memory[0] = output[0][0];
    this.memory[1] = output[0][1];
    if (this.counter < 30) {
      console.log(this.memory, output[0])
      this.instance.exports.e();
    }
    this.counter += 1;
    return true;
  }
}

registerProcessor("forwarding-processor", ForwardProcessor);

