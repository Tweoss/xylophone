(module
	(func $i (import "imports" "i") (param f32))
	(func $sin (import "imports" "sin") (param f32) (result f32))
	(func $cos (import "imports" "cos") (param f32) (result f32))
	(memory $mem (import "imports" "mem") 2 2 shared)
	(func $add (param $lhs f32) (param $rhs f32) (result f32)
		local.get $lhs
		local.get $rhs
		f32.add
	)
	(export "add" (func $add))
	(func $mul (param $lhs f32) (param $rhs f32) (result f32)
		local.get $lhs
		local.get $rhs
		f32.mul
	)
	(export "mul" (func $mul))
	(func (export "e")
		i32.const 0
		f32.load $mem
		i32.const 4
		f32.load $mem
		f32.add
		call $i
	)
	(func (export "f") (param $x f32)
		local.get $x
		call $sin
		call $i
	)
	(func (export "dot_product_sin") (param $sample_rate f32) (param $freq f32) (param $start i32) (param $end i32) (param $pi f32) (result f32)
		;; freq 440 at sample rate 44100
		;; => period of wave is 1/440 seconds, freq of 44100 samples/second
		;; => period is 44100/440 samples
		;; => sin(440/44100 * 2 pi * x)
		(local $sum f32)
		(local $i i32)
		local.get $start
		local.set $i
		(loop $iter
			;; freq / sample
			local.get $freq
			local.get $sample_rate
			f32.div

			;; freq / sample * 2 pi
			f32.const 2
			local.get $pi
			f32.mul
			f32.mul

			;; freq / sample * 2 pi * i
			local.get $i
			f32.convert_i32_s
			f32.mul
			
			call $sin

			;; sin(freq / sample * 2 pi * i) * samples[i]
			local.get $i
			call $load_f32
			f32.mul

			;; abs(sin(freq / sample * 2 pi * i) * samples[i])
			f32.abs

			;; sum += abs(sin(freq / sample * 2 pi * i) * samples[i])
			local.get $sum
			f32.add
			local.set $sum

			;; i += 1
			local.get $i
			i32.const 1
			i32.add
			local.set $i

			;; if i < end, continue
			local.get $i
		 	local.get $end
		 	i32.lt_u
		 	br_if $iter
		)
		local.get $sum
	)
	(func (export "dot_product_cos") (param $sample_rate f32) (param $freq f32) (param $start i32) (param $end i32) (param $pi f32) (result f32)
		(local $sum f32)
		(local $i i32)
		local.get $start
		local.set $i
		(loop $iter
			local.get $freq
			local.get $sample_rate
			f32.div
			f32.const 2
			local.get $pi
			f32.mul
			f32.mul
			local.get $i
			f32.convert_i32_s
			f32.mul
			call $cos
			local.get $i
			call $load_f32
			f32.mul
			f32.abs
			local.get $sum
			f32.add
			local.set $sum
			local.get $i
			i32.const 1
			i32.add
			local.set $i
			local.get $i
		 	local.get $end
		 	i32.lt_u
		 	br_if $iter
		)
		local.get $sum
	)
	(func $load_f32 (param $index i32) (result f32)
		i32.const 4
		local.get $index
		i32.mul
		f32.load
	)
)

