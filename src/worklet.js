class ForwardProcessor extends AudioWorkletProcessor {

  constructor({ processorOptions }) {
    super();
    console.log(processorOptions)
    WebAssembly.instantiate(processorOptions.module).then(
      obj =>
        this.instance = obj.instance
    );
    this.once = false;
  }

  process(inputList, outputList, _parameters) {
    if (!this.instance) {
      console.log("no worklet")
      return;
    }

    console.log("processing");
    const input = inputList[0];
    let output = outputList[0];
    if (!this.once) {
      this.once = true;
      console.log(input, output)
    }

    
    const copy = (src, dst) => {
      for (const [i, v] of src.entries()) {
        dst[i] = v;
      }
    }
    for (const [i, v] of input[0].entries()) {
      output[0][i] = this.instance.exports.mul(v, input[1][i]);
    }
    // copy(input[0], output[0]);
    // copy(input[1], output[1]);
    // output[0] = input[0];
    // output[1] = input[1];
    // for (const output of outputList) {
    //   for (const [i, v] of input) {
    //     output[i] = v;
    //   }
    // }
    return true;
  }
}

registerProcessor("forwarding-processor", ForwardProcessor);

