(module
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
)

