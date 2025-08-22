import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Send, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MessageThread {
  serviceRequestId: string;
  jobTitle: string;
  companyName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId');

  // Mock message threads - in real app this would come from API
  const mockThreads: MessageThread[] = [
    {
      serviceRequestId: 'req-1',
      jobTitle: 'Kitchen Sink Replacement',
      companyName: 'Al Waha Plumbing',
      lastMessage: 'We will arrive at 10 AM tomorrow',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      status: 'in_progress',
    },
    {
      serviceRequestId: 'req-2', 
      jobTitle: 'AC Maintenance',
      companyName: 'Cool Air Technical',
      lastMessage: 'Service completed successfully',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      status: 'completed',
    },
  ];

  // Mock messages for selected thread
  const mockMessages: (Message & { senderName: string; isOwn: boolean })[] = [
    {
      id: 'msg-1',
      serviceRequestId: selectedThread || 'req-1',
      senderId: 'company-user-1',
      receiverId: user?.id || 'user-1',
      message: 'Hello! We have received your service request for kitchen sink replacement.',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      senderName: 'Al Waha Plumbing',
      isOwn: false,
    },
    {
      id: 'msg-2',
      serviceRequestId: selectedThread || 'req-1',
      senderId: user?.id || 'user-1',
      receiverId: 'company-user-1',
      message: 'Great! When can you come to assess the situation?',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      senderName: user?.firstName || 'You',
      isOwn: true,
    },
    {
      id: 'msg-3',
      serviceRequestId: selectedThread || 'req-1',
      senderId: 'company-user-1',
      receiverId: user?.id || 'user-1',
      message: 'We can visit tomorrow morning between 9-11 AM. Would that work for you?',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderName: 'Al Waha Plumbing',
      isOwn: false,
    },
    {
      id: 'msg-4',
      serviceRequestId: selectedThread || 'req-1',
      senderId: 'company-user-1',
      receiverId: user?.id || 'user-1',
      message: 'We will arrive at 10 AM tomorrow. Please ensure someone is available to provide access.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderName: 'Al Waha Plumbing',
      isOwn: false,
    },
  ];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; receiverId: string; serviceRequestId: string }) => {
      return await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    if (selectedThread) {
      setSelectedThread(null);
    } else {
      navigate('/');
    }
  };



  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    // In real implementation, get the actual receiver ID from the thread
    const receiverId = 'company-user-1';
    
    sendMessageMutation.mutate({
      message: newMessage.trim(),
      receiverId,
      serviceRequestId: selectedThread,
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-accent text-white',
      completed: 'bg-success text-white',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-sm mx-auto bg-surface min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-medium">
              {selectedThread 
                ? mockThreads.find(t => t.serviceRequestId === selectedThread)?.companyName || 'Messages'
                : 'Messages'
              }
            </h1>
          </div>
          {!selectedThread && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-blue-600 text-white"
              onClick={() => toast({ title: "Search Messages", description: "Message search coming soon!" })}
              data-testid="button-search-messages"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16 h-screen overflow-hidden flex flex-col">
        {!selectedThread ? (
          /* Message Threads List */
          <div className="p-4 flex-1 overflow-y-auto">
            {mockThreads.length > 0 ? (
              <div className="space-y-3">
                {mockThreads.map((thread) => (
                  <Card 
                    key={thread.serviceRequestId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleThreadSelect(thread.serviceRequestId)}
                    data-testid={`card-thread-${thread.serviceRequestId}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800" data-testid={`text-job-title-${thread.serviceRequestId}`}>
                            {thread.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600" data-testid={`text-company-${thread.serviceRequestId}`}>
                            {thread.companyName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(thread.status)}>
                            {thread.status.replace('_', ' ')}
                          </Badge>
                          {thread.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {thread.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700 flex-1 truncate" data-testid={`text-last-message-${thread.serviceRequestId}`}>
                          {thread.lastMessage}
                        </p>
                        <span className="text-xs text-gray-500 ml-2" data-testid={`text-last-time-${thread.serviceRequestId}`}>
                          {thread.lastMessageTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Messages with service providers will appear here
                  </p>
                  <Button onClick={() => navigate('/service-request')} data-testid="button-create-request">
                    Create Service Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Message Thread View */
          <>
            {/* Thread Header */}
            <div className="p-4 bg-surface border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" data-testid="text-thread-job-title">
                    {mockThreads.find(t => t.serviceRequestId === selectedThread)?.jobTitle}
                  </h3>
                  <Badge className={getStatusColor(
                    mockThreads.find(t => t.serviceRequestId === selectedThread)?.status || 'pending'
                  )}>
                    {mockThreads.find(t => t.serviceRequestId === selectedThread)?.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/jobs/${selectedThread}`)}
                  data-testid="button-view-job-details"
                >
                  View Job
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.id}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isOwn 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                      {message.message}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`} data-testid={`text-message-time-${message.id}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-surface border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                  data-testid="input-new-message"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
