(module
	(func $log (import "imports" "log") (param i32))
	(memory $mem (import "imports" "mem") 1 1 shared)
	(func $load_f32 (param $index i32) (result f32)
		i32.const 4
		local.get $index
		i32.mul
		f32.load
	)
	(func $store_f32 (param $index i32) (param $value f32)
		i32.const 4
		local.get $index
		i32.mul
		local.get $value
		f32.store
	)
	;; write sine wave to buffer
	;; via minsky's algorithm
	(func (export "write_sin")
		(param $divider f32)
		(result i32)
		(local $x f32)
		(local $y f32)
		(local $i i32)
		(local $hit_negative i32)

		i32.const 0
		local.set $i

		f32.const 1
		local.set $x
		f32.const 0
		local.set $y

		loop $l
			local.get $i
			local.get $y
			call $store_f32

			local.get $i
			i32.const 1
			i32.add
			local.set $i
		
			;; calculate x - y / divider
			local.get $x
			local.get $y
			local.get $divider
			f32.div
			f32.sub
			;; calculate y + x/divider
			local.get $y
			local.get $x
			local.get $divider
			f32.div
			f32.add
			;; store to y
			local.set $y
			;; store to x
			local.set $x


			;; could just exit when y hits negatives.

			local.get $y
			f32.const 0
			f32.lt
			local.get $hit_negative
			i32.or
			local.set $hit_negative

			;; if we're back to positive, that's a loop
			local.get $y
			f32.const 0
			f32.gt
			local.get $hit_negative
			i32.and
			if
				local.get $i
				return
			end

			br $l
		end

		local.get $i
		return
	)
	;; needs write_sin first
	(func $sin (export "sin")
		(param $buffer_length i32)
		(param $pi f32)
		(param $v f32)
		(result f32)
		(local $floored f32)

		;; scale down by 2pi
		local.get $v
		f32.const 2
		local.get $pi
		f32.mul
		f32.div
		;; obtain just the fractional part
		local.tee $floored
		local.get $floored
		f32.floor
		f32.sub
		;; multiply by buffer length to get index
		local.get $buffer_length
		f32.convert_i32_u
		f32.mul

		;; TODO: linear interp?
		f32.floor
		i32.trunc_f32_u
		
		call $load_f32
	)
	
	(func (export "cos")
		(param $buffer_length i32)
		(param $pi f32)
		(param $v f32)
		(result f32)

		local.get $buffer_length
		local.get $pi

		;; sin(x+pi/2)
		local.get $pi
		f32.const 2
		f32.div
		local.get $v
		f32.add

		call $sin
	)
)

