(module
	(func $i (import "imports" "i") (param f32))
	(memory $mem (import "imports" "mem") 100 100 shared)
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
)

