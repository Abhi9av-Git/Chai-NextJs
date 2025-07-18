'use client'
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {useToast} from '@/components/ui/use-toast'
import { Form, useForm } from 'react-hook-form'
import * as z from 'zod'
import { signUpSchema } from '@/schemas/signUpSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import verifySchema from '@/schemas/verifySchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@react-email/components'

const VerifyAccount = () => {
  const router = useRouter()
  const params = useParams<{ username: string }>()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit= async (data: z.infer<typeof verifySchema>)=>
    {
    try {
      const respone=await axios.post(`/api/verify-code`, {
        username: params.username,
        code: data.code
      })

      toast("Success: " + respone.data.message)

      router.replace('sign-in')
    }
    catch (error) {
      console.error("Error in signup of user", error)
      const axiosError=error as AxiosError<ApiResponse>;
      toast('Signup failed: ' + (axiosError.response?.data.message ?? 'Unknown error'))
    }
  }
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md'>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">
            Enter the verification code sent to your email
          </p>
        </div>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="code" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </form>
    </Form>
      </div>
    </div>
  )
}

export default VerifyAccount