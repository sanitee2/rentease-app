'use client';

import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Home, CreditCard, AlertCircle, Mail, X, User, Receipt } from 'lucide-react';
import { format } from "date-fns";
import Image from "next/image";

interface LeaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: any;
}

const LeaseDetailsModal = ({ isOpen, onClose, lease }: LeaseDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden bg-white dark:bg-gray-950 [&>button]:hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Lease Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full p-0 h-12 rounded-none border-b bg-transparent">
            <TabsTrigger 
              value="details" 
              className="w-full h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="w-full h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Payments
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <TabsContent value="details" className="m-0">
                <div className="space-y-6">
                  {/* Tenant Info */}
                  <div className="flex items-center gap-4">
                    <Image
                      className="h-12 w-12 rounded-full object-cover"
                      src={lease.tenant.image || '/images/placeholder.jpg'}
                      alt={`${lease.tenant.firstName} ${lease.tenant.lastName}`}
                      width={48}
                      height={48}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{lease.tenant.email}</p>
                    </div>
                  </div>

                  {/* Status and Property */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/40 border-none">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            lease.status === 'ACTIVE' ? 'default' :
                            lease.status === 'PENDING' ? 'secondary' :
                            lease.status === 'REJECTED' ? 'destructive' :
                            lease.status === 'CANCELLED' ? 'outline' :
                            'outline'
                          }>
                            {lease.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40 border-none">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Home className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{lease.listing?.title}</p>
                          {lease.room && (
                            <p className="text-sm text-muted-foreground">
                              Room: {lease.room.title}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lease Period */}
                  <Card className="bg-muted/40 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Lease Period</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="text-sm font-medium">
                            {lease.startDate ? format(new Date(lease.startDate), 'PPP') : 'N/A'}
                          </p>
                        </div>
                        {lease.endDate && (
                          <div>
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="text-sm font-medium">
                              {format(new Date(lease.endDate), 'PPP')}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Monthly Due Date</p>
                        <p className="text-sm font-medium">Every {lease.monthlyDueDate}th</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Details */}
                  <Card className="bg-muted/40 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Financial Details</h4>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Rent</p>
                          <p className="text-sm font-medium">₱{lease.rentAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                          <p className={`text-sm font-medium ${lease.outstandingBalance > 0 ? 'text-destructive' : ''}`}>
                            ₱{lease.outstandingBalance?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="m-0">
                <div className="space-y-4">
                  {lease.Payment?.length > 0 ? (
                    lease.Payment.map((payment: any) => (
                      <Card key={payment.id} className="bg-muted/40 border-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.createdAt ? format(new Date(payment.createdAt), 'PPP') : 'N/A'}
                              </p>
                            </div>
                            <Badge variant={
                              payment.status === 'COMPLETED' ? 'default' :
                              payment.status === 'PENDING' ? 'secondary' :
                              'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                          {payment.periodStart && payment.periodEnd && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Period: {format(new Date(payment.periodStart), 'MMM d')} - {format(new Date(payment.periodEnd), 'MMM d, yyyy')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No payment records found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseDetailsModal; 