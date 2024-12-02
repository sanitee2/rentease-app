'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TenantData } from '@/app/types';
import { CalendarDays, Home, CreditCard, AlertCircle, Mail, Phone, CircleIcon, Calendar, DoorOpen, ScrollText, Receipt, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TenantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantData;
}

export default function TenantDetailsModal({
  isOpen,
  onClose,
  tenant
}: TenantDetailsModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const currentLease = tenant.leaseContracts[0];
  const fullName = `${tenant.firstName} ${tenant.middleName || ''} ${tenant.lastName} ${tenant.suffix || ''}`.trim();

  const handleEndLease = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/leases/${currentLease.id}/end`);
      toast.success('Lease ended successfully');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error ending lease:', error);
      toast.error('Failed to end lease');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLease = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/leases/${currentLease.id}/cancel`);
      toast.success('Lease cancelled successfully');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error cancelling lease:', error);
      toast.error('Failed to cancel lease');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] p-0 overflow-hidden bg-white dark:bg-gray-950 [&>button]:hidden"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tenant Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full p-0 h-12 rounded-none border-b bg-transparent">
            <TabsTrigger 
              value="profile" 
              className="w-full h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="current-lease"
              className="w-full h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Current Lease
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="w-full h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Lease History
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <TabsContent value="profile" className="m-0">
                <div className="p-6 bg-white dark:bg-gray-950">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-20 w-20 rounded-full ring-2 ring-offset-2 ring-primary/10">
                      <AvatarImage 
                        src={tenant.image || ''} 
                        alt={fullName} 
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg font-medium bg-primary/5">
                        {tenant.firstName[0]}{tenant.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-semibold tracking-tight mb-1">{fullName}</h3>
                      
                      <div className="space-y-1 mb-4">
                        {tenant.email && (
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{tenant.email}</span>
                          </div>
                        )}
                        {tenant.phoneNumber && (
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{tenant.phoneNumber}</span>
                          </div>
                        )}
                      </div>

                      {(tenant.tenant?.currentRoom || currentLease?.listing) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {currentLease?.listing && (
                            <div className="flex items-center">
                              <Badge variant="outline" className="rounded-full">
                                <Home className="h-3 w-3 mr-1" />
                                Listing: {currentLease.listing.title}
                              </Badge>
                            </div>
                          )}
                          {tenant.tenant?.currentRoom && (
                            <div className="flex items-center">
                              <Badge variant="outline" className="rounded-full">
                                <DoorOpen className="h-3 w-3 mr-1" />
                                Room: {tenant.tenant.currentRoom.title}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Move-in Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(currentLease?.startDate || new Date()), 'PPP')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Monthly Rent</p>
                            <p className="text-sm text-muted-foreground">
                              ₱{currentLease?.rentAmount.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40 border-none">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <AlertCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Outstanding Balance</p>
                          <p className={cn(
                            "text-sm",
                            currentLease?.outstandingBalance && currentLease.outstandingBalance > 0 
                              ? "text-destructive font-medium" 
                              : "text-muted-foreground"
                          )}>
                            ₱{currentLease?.outstandingBalance?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {currentLease && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            currentLease.status === 'ACTIVE' ? "bg-green-100" : 
                            currentLease.status === 'PENDING' ? "bg-yellow-100" : "bg-gray-100"
                          )}>
                            <CircleIcon className={cn(
                              "h-4 w-4",
                              currentLease.status === 'ACTIVE' ? "text-green-600" :
                              currentLease.status === 'PENDING' ? "text-yellow-600" : "text-gray-600"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Lease Status</p>
                            <p className="text-sm text-muted-foreground">{currentLease.status}</p>
                          </div>
                        </div>
                        <Badge variant={
                          currentLease.status === 'ACTIVE' ? 'default' :
                          currentLease.status === 'PENDING' ? 'secondary' : 'outline'
                        }>
                          {currentLease.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="current-lease" className="m-0">
                {currentLease && currentLease.listing && (
                  <div className="space-y-6 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-medium">{currentLease.listing.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Lease Agreement Details</p>
                      </div>
                      <Badge variant={
                        currentLease.status === 'ACTIVE' ? 'default' :
                        currentLease.status === 'PENDING' ? 'secondary' :
                        'outline'
                      }>
                        {currentLease.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-none shadow-none bg-muted/40">
                        <CardContent className="flex items-center gap-4 p-4">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(currentLease.startDate), 'PPP')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-none bg-muted/40">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Home className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Room</p>
                            <p className="text-sm text-muted-foreground">
                              {currentLease.room?.title || 'Not assigned'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-none bg-muted/40">
                        <CardContent className="flex items-center gap-4 p-4">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Monthly Rent</p>
                            <p className="text-sm text-muted-foreground">
                              ₱{currentLease.rentAmount.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-none bg-muted/40">
                        <CardContent className="flex items-center gap-4 p-4">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Due Date</p>
                            <p className="text-sm text-muted-foreground">
                              Every {currentLease.monthlyDueDate} of the month
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-none shadow-none bg-muted/40">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ScrollText className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">Lease Terms</h4>
                        </div>
                        <div 
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: currentLease.leaseTerms }}
                        />
                      </CardContent>
                    </Card>

                    {(currentLease.outstandingBalance ?? 0) > 0 && (
                      <Card className="border-none shadow-none bg-destructive/10">
                        <CardContent className="flex items-center gap-4 p-4">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium text-destructive">Outstanding Balance</p>
                            <p className="text-sm text-destructive/90">
                              ₱{currentLease.outstandingBalance?.toLocaleString() ?? '0'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentLease && currentLease.Payment && currentLease.Payment.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">Recent Payments</h4>
                        </div>
                        <div className="space-y-2">
                          {[...currentLease.Payment]
                            .sort((a, b) => {
                              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                              return dateB - dateA;
                            })
                            .map(payment => (
                              <Card key={payment.id} className="border-none shadow-none bg-muted/40">
                                <CardContent className="flex justify-between items-start p-4">
                                  <div className="space-y-1">
                                    <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="text-sm text-muted-foreground">
                                        {payment.createdAt 
                                          ? format(new Date(payment.createdAt), 'PPP')
                                          : 'Date not available'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        via {payment.paymentMethod.replace('_', ' ').toLowerCase()}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant={
                                    payment.status === 'COMPLETED' ? 'default' :
                                    payment.status === 'PENDING' ? 'secondary' :
                                    payment.status === 'FAILED' ? 'destructive' :
                                    'outline'
                                  } className={cn(
                                    payment.status === 'COMPLETED' && "bg-green-100 text-green-800 hover:bg-green-100",
                                    payment.status === 'PENDING' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                                    payment.status === 'FAILED' && "bg-red-100 text-red-800 hover:bg-red-100"
                                  )}>
                                    {payment.status}
                                  </Badge>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="m-0 mt-4">
                <div className="space-y-3">
                  {tenant.leaseContracts.map((lease) => (
                    lease.listing && (
                      <Card key={lease.id} className="border-none shadow-none bg-muted/40">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{lease.listing.title}</h4>
                            <Badge variant={
                              lease.status === 'ACTIVE' ? 'default' :
                              lease.status === 'PENDING' ? 'secondary' :
                              'outline'
                            }>
                              {lease.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p>Start: {format(new Date(lease.startDate), 'PP')}</p>
                            <p>Rent: ₱{lease.rentAmount.toLocaleString()}</p>
                            {lease.room && (
                              <p>Room: {lease.room.title}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Start Date: {format(new Date(currentLease?.startDate || new Date()), 'PPP')}</span>
          </div>
          
          {currentLease?.status === 'ACTIVE' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isLoading}
                >
                  End Lease
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Lease Contract</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the lease contract for {tenant.firstName} {tenant.lastName}. 
                    This action cannot be undone. The tenant will no longer have access to the room.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEndLease}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Ending...' : 'End Lease'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : currentLease?.status === 'PENDING' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isLoading}
                >
                  Cancel Lease
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Lease Contract</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the pending lease contract for {tenant.firstName} {tenant.lastName}. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelLease}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel Lease'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
