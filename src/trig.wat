(module
	(func $log (import "imports" "log") (param i32))
	(memory $mem (import "imports" "mem") 1 1 shared)
	(func $add (param $lhs f32) (param $rhs f32) (result f32)
		local.get $lhs
		local.get $rhs
		f32.add
	)
	(func $load_i32 (param $index i32) (result i32)
		i32.const 4
		local.get $index
		i32.mul
		i32.load
	)
	(func $store_i32 (param $index i32) (param $value i32)
		i32.const 4
		local.get $index
		i32.mul
		local.get $value
		i32.store
	)
	;; write sine wave to buffer
	;; via minsky's algorithm
	(func (export "write_sin")
		(param $divider i32)
		(param $initial_x i32)
		(result i32)
		(local $x i32)
		(local $y i32)
		(local $i i32)
		(local $hit_negative i32)

		i32.const 0
		local.set $i

		local.get $initial_x
		local.set $x
		i32.const 0
		local.set $y

		loop $l
			local.get $i
			local.get $y
			call $store_i32

			local.get $i
			i32.const 1
			i32.add
			local.set $i
		
			;; calculate x - y / divider
			local.get $x
			local.get $y
			local.get $divider
			i32.div_s
			i32.sub
			;; calculate y + x/divider
			local.get $y
			local.get $x
			local.get $divider
			i32.div_s
			i32.add
			;; store to y
			local.set $y
			;; store to x
			local.set $x


			;; could just exit when y hits negatives.

			local.get $y
			i32.const 0
			i32.lt_s
			local.get $hit_negative
			i32.or
			local.set $hit_negative

			;; if we're back to positive, that's a loop
			local.get $y
			i32.const 0
			i32.gt_s
			local.get $hit_negative
			i32.and
			if
				local.get $i
				return
			end

			;; i32.const 1234
			;; call $log
			;; local.get $x
			;; call $log
			;; local.get $y
			;; call $log

			;; ;; if we haven't reached inital x or the iteration < 1, then branch
			;; local.get $x
			;; local.get $initial_x
			;; i32.ne
			;; local.get $i
			;; i32.const 2
			;; i32.lt_u
			;; i32.or

			;; ;; ensure iteration is less than some number
			;; local.get $i
			;; i32.const 200
			;; i32.lt_u
			;; i32.and
			;; br_if $l
			br $l
		end

		local.get $i
		return
	)
	;; needs write_sin first
	(func $sin (export "sin")
		(param $buffer_length i32)
		(param $initial_x i32)
		(param $pi f32)
		(param $v f32)
		(result f32)
		(local $floored f32)
		(local $debug i32)

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
		
		;; ;; log index
		;; local.tee $debug
		;; local.get $debug
		;; call $log

		;; local.tee $debug
		;; i32.const 1234
		;; call $log
		;; local.get $debug
		;; call $log

		call $load_i32
		f32.convert_i32_s

		local.get $initial_x
		f32.convert_i32_u
		f32.div
	)
	
	(func (export "cos")
		(param $buffer_length i32)
		(param $initial_x i32)
		(param $pi f32)
		(param $v f32)
		(result f32)

		local.get $buffer_length
		local.get $initial_x
		local.get $pi

		;; sin(x+pi/4)
		local.get $pi
		f32.const 4
		f32.div
		local.get $v
		f32.add

		call $sin
	)
)

