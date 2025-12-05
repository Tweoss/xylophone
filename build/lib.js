var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var initializing = false;
var OSCILLOSCOPE_HEIGHT = 100;
var OSCILLOSCOPE_WIDTH = 200;
export function init(source_audio) {
    return __awaiter(this, void 0, void 0, function () {
        var audio_context, input, _a, _b, analyser, oscilloscope_canvas, scope_ctx, processor_node, _c, _d, target, log_element, decoder, bars, last_data, ignore_next;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (initializing)
                        return [2 /*return*/];
                    initializing = true;
                    audio_context = new AudioContext();
                    return [4 /*yield*/, audio_context.audioWorklet.addModule("./build/worklet.js")];
                case 1:
                    _g.sent();
                    if (!source_audio) return [3 /*break*/, 2];
                    input = audio_context.createMediaElementSource(source_audio);
                    input.connect(audio_context.destination);
                    return [3 /*break*/, 4];
                case 2:
                    _b = (_a = audio_context).createMediaStreamSource;
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            audio: { echoCancellation: false },
                        })];
                case 3:
                    input = _b.apply(_a, [_g.sent()]);
                    _g.label = 4;
                case 4:
                    console.log(input);
                    console.log(audio_context.destination);
                    analyser = audio_context.createAnalyser();
                    input.connect(analyser);
                    oscilloscope_canvas = document.querySelector("#oscilloscope");
                    oscilloscope_canvas.style.width = "".concat(OSCILLOSCOPE_WIDTH, "px");
                    oscilloscope_canvas.style.height = "".concat(OSCILLOSCOPE_HEIGHT, "px");
                    scope_ctx = oscilloscope_canvas.getContext("2d");
                    draw_oscilloscope(analyser, scope_ctx);
                    _c = AudioWorkletNode.bind;
                    _d = [void 0, audio_context,
                        "forwarding-processor"];
                    _e = {};
                    _f = {};
                    return [4 /*yield*/, fetch("./build/process.wasm")];
                case 5: return [4 /*yield*/, (_g.sent()).arrayBuffer()];
                case 6:
                    _f.module = _g.sent();
                    return [4 /*yield*/, fetch("./build/trig.wasm")];
                case 7: return [4 /*yield*/, (_g.sent()).arrayBuffer()];
                case 8:
                    processor_node = new (_c.apply(AudioWorkletNode, _d.concat([(_e.processorOptions = (_f.trig_module = _g.sent(),
                            _f.sample_rate = audio_context.sampleRate,
                            _f),
                            _e)])))();
                    target = document.querySelector("#container");
                    log_element = document.querySelector("#text-out");
                    decoder = create_decoder();
                    bars = null;
                    last_data = null;
                    ignore_next = false;
                    processor_node.port.onmessage = function (e) {
                        var e_1, _a;
                        var NOISE_RATIO_THRESHOLD = 0.2;
                        var DOT_PRODUCT_INCREASE_THRESHOLD = 10;
                        var data = e.data;
                        if (!ignore_next && last_data) {
                            var delta = data.map(function (v, i) { return [i, v - last_data[i]]; });
                            var sorted = delta.toSorted(function (a, b) { return b[1] - a[1]; });
                            var _b = __read(sorted.slice(0, 3), 3), a = _b[0], b = _b[1], c = _b[2];
                            // If the third largest element increase is much smaller than the second largest, then we have a strong signal.
                            // const sorted = data.toSorted();
                            var ratio = c[1] / b[1];
                            if (ratio < NOISE_RATIO_THRESHOLD &&
                                Math.min(a[1], b[1]) > DOT_PRODUCT_INCREASE_THRESHOLD) {
                                decoder.push(a[0], b[0]);
                                console.log("big delta", a, b, "ratio", ratio);
                                log_element.innerText = decoder.get_state();
                                ignore_next = true;
                            }
                        }
                        else {
                            ignore_next = false;
                        }
                        last_data = data;
                        if (!bars) {
                            bars = data.map(function (_, i) {
                                var svgns = "http://www.w3.org/2000/svg";
                                var rect = document.createElementNS(svgns, "rect");
                                rect.setAttribute("x", (i * (100 / data.length)).toString());
                                rect.setAttribute("y", "00");
                                rect.setAttribute("height", "00");
                                rect.setAttribute("width", (100 / data.length).toString());
                                // const rotation = ((1 + Math.sqrt(5)) / 2) * 10;
                                var rotation = Math.pow(i / 7, 1.2);
                                // const rotation = 1 / 7;
                                rect.setAttribute("fill", "hsl(".concat(360 * (rotation % 1), ", 90%, 90%)"));
                                target.appendChild(rect);
                                return rect;
                            });
                        }
                        // TODO: better scaling factor?
                        var scale_factor = 10;
                        try {
                            for (var _c = __values(data.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var _e = __read(_d.value, 2), i = _e[0], value = _e[1];
                                var v = scale_factor *
                                    Math.max(0, Math.log(isNaN(value) ? 1 : Math.max(1, value)));
                                bars[i].setAttribute("y", (-v + 70).toString());
                                bars[i].setAttribute("height", v.toString());
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    };
                    input.connect(processor_node);
                    processor_node.connect(audio_context.destination);
                    return [2 /*return*/];
            }
        });
    });
}
var dataArray = null;
function draw_oscilloscope(analyser, ctx) {
    if (dataArray == null) {
        dataArray = new Float32Array(analyser.frequencyBinCount);
    }
    var buffer_length = dataArray.length;
    analyser.getFloatTimeDomainData(dataArray);
    ctx.fillStyle = "rgb(256 256 256)";
    ctx.fillRect(0, 0, OSCILLOSCOPE_WIDTH, OSCILLOSCOPE_HEIGHT);
    // Begin the path
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0 0 0)";
    ctx.beginPath();
    // Draw each point in the waveform
    var sliceWidth = OSCILLOSCOPE_WIDTH / buffer_length;
    var x = 0;
    for (var i = 0; i < buffer_length; i++) {
        var y = dataArray[i] * 100 + OSCILLOSCOPE_HEIGHT / 2;
        if (i === 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    // Finish the line
    ctx.lineTo(OSCILLOSCOPE_WIDTH, OSCILLOSCOPE_HEIGHT / 2);
    ctx.stroke();
    // ctx.clearRect(0, 0, 2 * OSCILLOSCOPE_WIDTH, 2 * OSCILLOSCOPE_HEIGHT);
    requestAnimationFrame(function () { return draw_oscilloscope(analyser, ctx); });
}
function create_decoder() {
    var get_index = function (note_pair) {
        note_pair.sort();
        var _a = __read(note_pair, 2), n1 = _a[0], n2 = _a[1];
        var index = (8 * 7) / 2 - ((8 - n1) * (7 - n1)) / 2 + (n2 - n1 - 1);
        return index;
    };
    var normal_map = function (index) {
        if (index < 26) {
            var lowercase_letter_start = 97;
            return {
                action: "Letter",
                value: String.fromCodePoint(lowercase_letter_start + index),
                state: "Normal",
            };
        }
        if (index == 26)
            return {
                action: "Repeat",
                state: "Normal",
            };
        if (index == 27)
            return { action: "None", state: "Escape" };
    };
    var escape_map = function (index) {
        if (index == 0)
            return {
                action: "Delete",
                state: "Normal",
            };
        if (index == 1)
            return {
                action: "Return",
                state: "Normal",
            };
        if (index == 2)
            return { action: "None", state: "Shift" };
        return { action: "None", state: "Normal" };
    };
    var state = "Normal";
    var decoded = "";
    var last_result = null;
    function handle_action(result) {
        var action = result.action;
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
                var exhaustiveCheck = result;
                throw new Error("Unhandled case: ".concat(exhaustiveCheck));
        }
    }
    return {
        push: function (note_a, note_b) {
            var index = get_index([note_a, note_b]);
            console.log("index ", index);
            if (state == "Normal") {
                var result = normal_map(index);
                console.log(result);
                handle_action(result);
                state = result.state;
            }
            else if (state == "Escape") {
                var result = escape_map(index);
                console.log(result);
                if (result) {
                    handle_action(result);
                    state = result.state;
                }
            }
            else if (state == "Shift") {
                var result = normal_map(index);
                console.log(result);
                if (result.action == "Letter") {
                    result.value = result.value.toUpperCase();
                    handle_action(result);
                }
                state = result.state;
            }
        },
        get_state: function () {
            return "state: ".concat(state, ", decoded: ").concat(decoded);
        },
    };
}
//# sourceMappingURL=lib.js.map