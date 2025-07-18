'use client'

import MessageCard from "@/components/MessageCard"
import { useToast } from "@/components/ui/use-toast"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useSession } from "next-auth/react"
import { useCallback, useState } from "react"
import { Message, useForm } from "react-hook-form"

const page=()=> {
  const [messages, setMessages]=useState<Message[]>([])
  const [isLoading, setIsLoading]=useState(false)
  const [isSwitchLoading, setIsSwitchLoading]=useState(false)

  const {toast}=useToast()

  const handleDeleteMessage=(messageId: string)=> {
    setMessages(messages.useFilter((message)=>message._id!==messageId))
  }

  const {data: session}=useSession()

  const form=useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register, watch, setValue}=form;

  const acceptMessages=watch('acceptMessages')

  const fetchAcceptMessage=useCallback(async ()=> {
    setIsSwitchLoading(true)
    try{
      const response=await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessage)
    }
    catch(error) {
      const axiosError=error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to set message settings",
        variant: "destructive"
      })
    }
    finally{
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages=useCallback(async (refresh: boolean=false)=> {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response=await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast ({
          title: "Error",
          description: "Showing latest messages",
        })
      }
    }
    catch(error) {
      const axiosError=error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to set message settings",
        variant: "destructive"
      })
    }
    finally{
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(()=> {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange=async()=> {
    try{
      const response=await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: response.data.message,
        variant: 'default'
      })
    }
    catch(error) {
      const axiosError=error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to set message settings",
        variant: "destructive"
      })
    }
  }

  const {username}=session?.user as User
  const baseUrl=`${window.location.protocol}//${window.location.host}`
  const profileUrl=`${baseUrl}/u/${username}`

  const copyToClipboard=() {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: "URL copied",
      description: "Profile URL has been copied to clipboard"
    })
  }

  if (!session || !session.user) {
    return <div>Please login</div>
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white
    rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique link</h2>{''}
        <div className="flex items-center">
          <input
             type="text"
             value={profileUrl}
             disabled
             className="input input-bordered w-full p-2 mr-2"
             />
             <Button onClick={copyToClipboard}>Copy</Button>
        </div> 
      </div>

      <div className="mb-4">
        <switch 
        {...register('acceptMessages')}
        checked={acceptMessages}
        onCheckedChange={handleSwitchChange}
        disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <separator/>

      <Button 
      className="mt-4"
      variant="outline"
      onClick={(e)=> {
        e.preventDefault();
        fetchMessages(true);
      }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2
      gap-6">
        {messages.length > 0 ? (
          messages.map((message, index)=> (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />  
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default page