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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
export function init() {
    return __awaiter(this, void 0, void 0, function () {
        var audio_context, input, _a, _b, processor_node, _c, _d, target, log_element, decoder, bars, last_data, ignore_next;
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
                    _b = (_a = audio_context).createMediaStreamSource;
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            audio: { echoCancellation: false },
                        })];
                case 2:
                    input = _b.apply(_a, [_g.sent()]);
                    console.log(input);
                    console.log(audio_context.destination);
                    _c = AudioWorkletNode.bind;
                    _d = [void 0, audio_context,
                        "forwarding-processor"];
                    _e = {};
                    _f = {};
                    return [4 /*yield*/, fetch("./build/process.wasm")];
                case 3: return [4 /*yield*/, (_g.sent()).arrayBuffer()];
                case 4:
                    processor_node = new (_c.apply(AudioWorkletNode, _d.concat([(_e.processorOptions = (_f.module = _g.sent(),
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
                        var data = e.data;
                        if (!ignore_next) {
                            if (last_data) {
                                var delta = data.map(function (v, i) { return v - last_data[i]; });
                                var _b = __read(delta.reduce(function (_a, e, i) {
                                    var _b = __read(_a, 2), a = _b[0], ai = _b[1];
                                    return (a > e ? [a, ai] : [e, i]);
                                }, [0, -1]), 2), max_1 = _b[0], max_i = _b[1];
                                var DOT_PRODUCT_THRESHOLD = 15;
                                if (max_1 > DOT_PRODUCT_THRESHOLD) {
                                    decoder.push(max_i);
                                    log_element.innerText = decoder.get_state();
                                    console.log("large deltas: ", delta, max_i);
                                    ignore_next = true;
                                }
                            }
                        }
                        else {
                            ignore_next = false;
                        }
                        last_data = data;
                        // console.log(data);
                        // TODO: better scaling factor?
                        var max = 20;
                        // const max = data.reduce((a, e) => (a > e ? a : e), 1);
                        if (!bars) {
                            bars = data.map(function (_, i) {
                                var svgns = "http://www.w3.org/2000/svg";
                                var rect = document.createElementNS(svgns, "rect");
                                rect.setAttribute("x", (i * (100 / data.length)).toString());
                                rect.setAttribute("y", "00");
                                rect.setAttribute("height", "00");
                                rect.setAttribute("width", (100 / data.length).toString());
                                var rotation = ((1 + Math.sqrt(5)) / 2) * 10;
                                rect.setAttribute("fill", "hsl(".concat(360 * ((rotation * i) % 1), ", 90%, 90%)"));
                                target.appendChild(rect);
                                return rect;
                            });
                        }
                        var scale_factor = 4;
                        try {
                            for (var _c = __values(data.map(function (d) { return (d / max) * 10; }).entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var _e = __read(_d.value, 2), i = _e[0], value = _e[1];
                                bars[i].setAttribute("height", Math.max(0, scale_factor * (isNaN(value) ? 0 : Math.max(0, value))).toString());
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
                    // console.log("made worklet");
                    input.connect(processor_node);
                    processor_node.connect(audio_context.destination);
                    return [2 /*return*/];
            }
        });
    });
}
function create_decoder() {
    var pending = [];
    var decoded = "";
    var parse = function () {
        if (pending.length == 2) {
            var _a = __read(pending, 2), x = _a[0], y = _a[1];
            var flattened = x * 8 + y;
            var capital_letter_range = [65, 90];
            var space_number_range = [32, 57];
            var range_len = function (v) { return v[1] - v[0] + 1; };
            if (flattened < range_len(capital_letter_range))
                decoded += String.fromCodePoint(flattened + capital_letter_range[0]);
            else if (flattened - range_len(capital_letter_range) <
                range_len(space_number_range))
                decoded += String.fromCodePoint(flattened - range_len(capital_letter_range) + space_number_range[0]);
            else if (flattened == 7 * 8 + 7) {
                decoded = decoded.slice(0, -1);
            }
            pending = [];
        }
    };
    return {
        push: function (note) {
            pending.push(note);
            parse();
        },
        get_state: function () {
            return "pending: [".concat(pending.toString(), "], decoded: ").concat(decoded);
        },
    };
}
//# sourceMappingURL=lib.js.map