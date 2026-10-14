import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { MessageSquare, Send, Mail, MailOpen, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { Message } from '../data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, addMessage, markMessageAsRead, users, requests } = useData();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    relatedRequestId: ''
  });

  const isEngineer = user?.role === 'engineer';
  const isManager = user?.role === 'manager';

  if (!isEngineer && !isManager) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Messages</h1>
          <p className="text-stone-700 mt-1">Communication center</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Only Engineers and Project Managers can send messages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get recipients (engineers for managers, managers for engineers)
  const recipients = users.filter(u => 
    isEngineer ? u.role === 'manager' : u.role === 'engineer'
  );

  // Filter messages for current user
  const receivedMessages = messages.filter(m => m.recipientId === user?.id);
  const sentMessages = messages.filter(m => m.senderId === user?.id);
  const unreadCount = receivedMessages.filter(m => !m.read).length;

  const handleCompose = () => {
    setFormData({
      recipientId: '',
      subject: '',
      content: '',
      relatedRequestId: ''
    });
    setIsComposeOpen(true);
  };

  const handleSendMessage = () => {
    if (!user || !formData.recipientId || !formData.subject || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipient = recipients.find(r => r.id === formData.recipientId);
    if (!recipient) {
      toast.error('Invalid recipient selected');
      return;
    }

    addMessage({
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      recipientId: recipient.id,
      recipientName: recipient.fullName,
      recipientRole: recipient.role,
      subject: formData.subject,
      content: formData.content,
      timestamp: new Date().toISOString(),
      read: false,
      relatedRequestId: formData.relatedRequestId || undefined
    });

    toast.success(`Message sent to ${recipient.fullName}`);
    setIsComposeOpen(false);
    setFormData({ recipientId: '', subject: '', content: '', relatedRequestId: '' });
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
    
    // Mark as read if it's received and unread
    if (message.recipientId === user?.id && !message.read) {
      markMessageAsRead(message.id);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Messages</h1>
          <p className="text-stone-700 mt-1">Communicate with team members</p>
        </div>
        <Button
          onClick={handleCompose}
          className="bg-yellow-500 hover:bg-yellow-600 text-stone-950 self-start sm:self-auto"
        >
          <Send className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unreadCount}</div>
            <p className="text-xs text-stone-700 mt-1">Waiting for your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <MailOpen className="h-4 w-4 text-stone-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{receivedMessages.length}</div>
            <p className="text-xs text-stone-700 mt-1">Messages received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentMessages.length}</div>
            <p className="text-xs text-stone-700 mt-1">Messages sent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>View and manage your conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received">
            <TabsList className="mb-4">
              <TabsTrigger value="received">
                Received ({receivedMessages.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              <div className="space-y-2">
                {receivedMessages.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No received messages yet.</AlertDescription>
                  </Alert>
                ) : (
                  receivedMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleViewMessage(message)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-stone-50 ${
                        !message.read ? 'bg-red-50 border-stone-900/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.read ? (
                              <Mail className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <MailOpen className="h-4 w-4 text-stone-500" />
                            )}
                            <span className={`font-medium ${!message.read ? 'text-stone-950' : 'text-stone-800'}`}>
                              {message.senderName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.senderRole.toUpperCase()}
                            </Badge>
                            {message.relatedRequestId && (
                              <Badge className="bg-blue-900 text-white text-xs">
                                {message.relatedRequestId}
                              </Badge>
                            )}
                          </div>
                          <h4 className={`text-sm mb-1 ${!message.read ? 'font-semibold' : 'font-normal'}`}>
                            {message.subject}
                          </h4>
                          <p className="text-sm text-stone-700 line-clamp-1">{message.content}</p>
                        </div>
                        <div className="text-xs text-stone-600 flex items-center gap-1 ml-4">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent">
              <div className="space-y-2">
                {sentMessages.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No sent messages yet.</AlertDescription>
                  </Alert>
                ) : (
                  sentMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleViewMessage(message)}
                      className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-stone-50 bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Send className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-stone-800">To: {message.recipientName}</span>
                            <Badge variant="outline" className="text-xs">
                              {message.recipientRole.toUpperCase()}
                            </Badge>
                            {message.relatedRequestId && (
                              <Badge className="bg-blue-900 text-white text-xs">
                                {message.relatedRequestId}
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-normal mb-1">{message.subject}</h4>
                          <p className="text-sm text-stone-700 line-clamp-1">{message.content}</p>
                        </div>
                        <div className="text-xs text-stone-600 flex items-center gap-1 ml-4">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a message to {isEngineer ? 'Project Managers' : 'Engineers'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select
                value={formData.recipientId}
                onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.fullName} ({recipient.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Related Request (Optional)</Label>
              <Select
                value={formData.relatedRequestId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, relatedRequestId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {requests.map((request) => (
                    <SelectItem key={request.id} value={request.id}>
                      {request.id} - {request.materialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-blue-900 hover:bg-blue-950"
              disabled={!formData.recipientId || !formData.subject || !formData.content}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage?.senderId === user?.id ? (
                <>
                  <Send className="h-5 w-5 text-green-600" />
                  Sent Message
                </>
              ) : (
                <>
                  {selectedMessage?.read ? (
                    <MailOpen className="h-5 w-5 text-stone-700" />
                  ) : (
                    <Mail className="h-5 w-5 text-yellow-500" />
                  )}
                  Received Message
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage?.senderId === user?.id
                ? `To: ${selectedMessage?.recipientName}`
                : `From: ${selectedMessage?.senderName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedMessage?.senderId === user?.id
                  ? selectedMessage?.recipientRole.toUpperCase()
                  : selectedMessage?.senderRole.toUpperCase()}
              </Badge>
              {selectedMessage?.relatedRequestId && (
                <Badge className="bg-blue-900 text-white">
                  Related: {selectedMessage.relatedRequestId}
                </Badge>
              )}
              <span className="text-sm text-stone-600 ml-auto">
                {selectedMessage && new Date(selectedMessage.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">{selectedMessage?.subject}</h3>
              <p className="text-stone-800 whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}