'use client'

import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { handleEmailTest, handleSMSTest } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface TestButtonProps {
  action: () => Promise<{ success: boolean; error?: string }>
  label: string
  description: string
  icon?: React.ReactNode
}

function TestButton({ action, label, description, icon }: TestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const result = await action()
      
      if (result.success) {
        toast.success(`${label} completed successfully`)
      } else {
        toast.error(result.error || `${label} failed`)
      }
    } catch (error) {
      toast.error(`Failed to execute ${label.toLowerCase()}`)
      console.error(`${label} error:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full sm:w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleClick}
          className="w-full"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? "Testing..." : `Run ${label}`}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function TestingPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Test various system functionalities like email and SMS notifications
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TestButton 
            action={handleEmailTest}
            label="Email Service"
            description="Send a test email to verify email notification functionality"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <TestButton 
            action={handleSMSTest}
            label="SMS Service"
            description="Send a test SMS to verify messaging functionality"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
