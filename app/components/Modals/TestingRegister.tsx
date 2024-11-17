import React from 'react'
import { FieldValues, useForm } from 'react-hook-form'

const TestingRegister = () => {
  const Register = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })
  return (
    <div>TestingRegister</div>
  )
}

export default TestingRegister