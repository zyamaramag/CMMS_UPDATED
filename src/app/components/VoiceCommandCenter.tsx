import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Mic, MicOff, Send, Square } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';

interface RecognitionResultEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface RecognitionErrorEvent extends Event {
  error?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

interface NavigationCommand {
  label: string;
  example: string;
  path: string;
  roles: UserRole[];
  patterns: RegExp[];
}

const ALL_ROLES: UserRole[] = ['admin', 'staff', 'engineer', 'manager'];

const NAVIGATION_COMMANDS: NavigationCommand[] = [
  {
    label: 'Dashboard',
    example: 'Go to dashboard',
    path: '/dashboard',
    roles: ALL_ROLES,
    patterns: [/\b(?:dashboard|home page|home screen)\b/],
  },
  {
    label: 'Inventory',
    example: 'Open inventory',
    path: '/inventory',
    roles: ALL_ROLES,
    patterns: [/\b(?:inventory|materials list|stock list)\b/],
  },
  {
    label: 'Material Requests',
    example: 'Open material requests',
    path: '/requests',
    roles: ['admin', 'manager'],
    patterns: [/\b(?:material requests?|requisitions?)\b/],
  },
  {
    label: 'Approvals',
    example: 'Open approvals',
    path: '/approvals',
    roles: ['admin'],
    patterns: [/\b(?:material approvals?|request approvals?)\b/],
  },
  {
    label: 'User Approvals',
    example: 'Open user approvals',
    path: '/user-approvals',
    roles: ['admin'],
    patterns: [/\b(?:user approvals?|registration approvals?)\b/],
  },
  {
    label: 'Messages',
    example: 'Open messages',
    path: '/messages',
    roles: ['engineer', 'manager'],
    patterns: [/\b(?:messages?|inbox)\b/],
  },
  {
    label: 'IN/OUT Tracking',
    example: 'Open stock movements',
    path: '/inout',
    roles: ['admin', 'staff', 'manager'],
    patterns: [/\b(?:in\s*(?:and|\/)\s*out|stock movements?|material movements?|transactions?)\b/],
  },
  {
    label: 'User Management',
    example: 'Open user management',
    path: '/users',
    roles: ['admin'],
    patterns: [/\b(?:user management|manage users|users page)\b/],
  },
  {
    label: 'Activity Logs',
    example: 'Open activity logs',
    path: '/logs',
    roles: ['admin', 'staff'],
    patterns: [/\b(?:activity logs?|audit logs?|system logs?)\b/],
  },
  {
    label: 'Security Center',
    example: 'Open security center',
    path: '/security',
    roles: ['admin'],
    patterns: [/\b(?:security|security center)\b/],
  },
  {
    label: 'Settings',
    example: 'Open settings',
    path: '/settings',
    roles: ALL_ROLES,
    patterns: [/\b(?:settings|preferences|account settings)\b/],
  },
];

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export default function VoiceCommandCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, requests, users, addMessage, addRequest } = useData();
  const { announce } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState('');
  const [feedback, setFeedback] = useState('Enter a command or start voice recognition.');
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const commandRunnerRef = useRef<(value: string) => void>(() => {});
  const speechSupported = useMemo(() => getSpeechRecognition() !== null, []);
  const availableNavigationCommands = useMemo(
    () => NAVIGATION_COMMANDS.filter(item => user && item.roles.includes(user.role)),
    [user]
  );
  const workflowExamples = useMemo(() => {
    const examples = [
      'Find cement',
      'Show low stock',
      'Check available stock of steel bars',
      'Go back',
    ];
    if (user?.role === 'manager') {
      examples.push(
        'Request 50 bags of cement for Project A',
        'Create a request draft for 50 bags of cement for Project A',
        'Show my pending requests',
        'Edit request REQ001',
        'Cancel request REQ001'
      );
      examples.push(
        'Send message to Field Engineer saying Please confirm the site requirements',
        'Compose message to Field Engineer saying Please confirm the site requirements'
      );
    }
    if (user?.role === 'engineer') {
      examples.push(
        'Send message to Project Manager about REQ001 saying Please review this request',
        'Compose message to Project Manager about REQ001 saying Please review this request'
      );
    }
    if (user?.role === 'admin') {
      examples.push(
        'Show pending approvals',
        'Approve request REQ001',
        'Reject request REQ001',
        'Find user John Doe',
        'Edit user John Doe',
        'Add a new user',
        'Show blocked security events',
        'Open system settings'
      );
    }
    if (user?.role === 'staff' || user?.role === 'admin' || user?.role === 'manager') {
      examples.push('Show materials issued to Project A');
    }
    if (user?.role === 'staff' || user?.role === 'admin') {
      examples.push(
        'Receive 50 bags of cement in from Supplier ABC',
        'Release 20 steel rebars to Project A',
        'Add a new material',
        'Edit material Portland Cement',
        'Show Material OUT activity logs'
      );
    }
    if (user?.role === 'engineer' || user?.role === 'manager') {
      examples.push('Show unread messages', 'Show sent messages');
    }
    examples.push('Open notification settings');
    return examples;
  }, [user?.role]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const complete = (message: string, nextStatus: VoiceStatus = 'success') => {
    setFeedback(message);
    setStatus(nextStatus);
    announce(message, nextStatus === 'error' ? 'assertive' : 'polite');
  };

  const runCommand = (rawCommand: string) => {
    const normalized = rawCommand
      .trim()
      .toLowerCase()
      .replace(/^(?:hey\s+)?hvl[,\s]+/, '')
      .replace(/[?.!]+$/g, '');
    const findMaterial = (phrase: string) => {
      const materialPhrase = phrase
        .replace(/^(bags?|pieces?|pcs|units?|meters?|kilograms?|kg)\s+of\s+/i, '')
        .trim()
        .toLowerCase();
      return materials.find(item => {
        const fullName = `${item.name} ${item.size ?? ''}`.trim().toLowerCase();
        return item.id.toLowerCase() === materialPhrase ||
          fullName === materialPhrase ||
          fullName.includes(materialPhrase);
      }) ?? materials.find(item =>
        item.name.toLowerCase().includes(materialPhrase) ||
        materialPhrase.includes(item.name.toLowerCase()) ||
        item.category.toLowerCase() === materialPhrase
      );
    };
    const formatMaterialName = (material: { name: string; size?: string }) =>
      `${material.name}${material.size ? ` ${material.size}` : ''}`;
    setRecognizedCommand(rawCommand.trim());
    setStatus('processing');

    if (!normalized) {
      complete('Enter a command before continuing.', 'error');
      return;
    }

    if (/\b(?:voice help|show voice commands|what can i say|command help)\b/.test(normalized)) {
      setOpen(true);
      complete('Showing the commands available for your role.');
      return;
    }

    if (/^(?:stop|stop listening|stop voice|turn off voice|turn off microphone|cancel listening)$/.test(normalized)) {
      listeningRef.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      complete('Hands-free voice mode stopped.');
      return;
    }

    if (/\b(go back|previous page|return to the previous page)\b/.test(normalized)) {
      navigate(-1);
      complete('Returning to the previous page.');
      setOpen(false);
      return;
    }

    const settingsSectionMatch = normalized.match(
      /\b(?:open|show|go to) (profile|password|notification|notifications|system) settings\b/
    );
    if (settingsSectionMatch) {
      const requestedTab = settingsSectionMatch[1] === 'notifications'
        ? 'notifications'
        : settingsSectionMatch[1] === 'notification'
        ? 'notifications'
        : settingsSectionMatch[1];
      if (requestedTab === 'system' && user?.role !== 'admin') {
        complete('System settings are available only to Admin.', 'error');
        return;
      }
      navigate(`/settings?tab=${requestedTab}`);
      complete(`Opening ${requestedTab} settings.`);
      setOpen(false);
      return;
    }

    if (/\b(?:show|open) unread messages\b/.test(normalized)) {
      if (user?.role !== 'engineer' && user?.role !== 'manager') {
        complete('Messages are not available for your role.', 'error');
        return;
      }
      navigate('/messages?filter=unread');
      complete('Showing unread messages.');
      setOpen(false);
      return;
    }

    if (/\b(?:show|open) sent messages\b/.test(normalized)) {
      if (user?.role !== 'engineer' && user?.role !== 'manager') {
        complete('Messages are not available for your role.', 'error');
        return;
      }
      navigate('/messages?tab=sent');
      complete('Showing sent messages.');
      setOpen(false);
      return;
    }

    if (/\b(?:show|open) (?:all )?received messages\b/.test(normalized)) {
      if (user?.role !== 'engineer' && user?.role !== 'manager') {
        complete('Messages are not available for your role.', 'error');
        return;
      }
      navigate('/messages');
      complete('Showing received messages.');
      setOpen(false);
      return;
    }

    const logSearchMatch = normalized.match(
      /\b(?:show|find|search) (?:(?:activity )?logs? (?:for|about) (.+)|(.+) activity logs?)$/
    );
    if (logSearchMatch) {
      if (user?.role !== 'admin' && user?.role !== 'staff') {
        complete('Activity logs are not available for your role.', 'error');
        return;
      }
      const logQuery = (logSearchMatch[1] ?? logSearchMatch[2]).trim();
      navigate(`/logs?q=${encodeURIComponent(logQuery)}`);
      complete(`Filtering activity logs for “${logQuery}”.`);
      setOpen(false);
      return;
    }

    const securityFilterMatch = normalized.match(
      /\b(?:show|open|find) (blocked|allowed|alert|alerts) (?:security )?(?:events|threats)?\b/
    );
    if (securityFilterMatch) {
      if (user?.role !== 'admin') {
        complete('Security Center is available only to Admin.', 'error');
        return;
      }
      const statusFilter = securityFilterMatch[1] === 'alerts' ? 'alert' : securityFilterMatch[1];
      navigate(`/security?status=${statusFilter}`);
      complete(`Showing ${statusFilter} security events.`);
      setOpen(false);
      return;
    }

    const editUserMatch = normalized.match(/\bedit user (.+)$/);
    if (editUserMatch) {
      if (user?.role !== 'admin') {
        complete('Only Admin can edit users.', 'error');
        return;
      }
      const userQuery = editUserMatch[1].trim();
      const matchedUser =
        users.find(systemUser =>
          [systemUser.fullName, systemUser.username, systemUser.email]
            .some(value => value.toLowerCase() === userQuery)
        ) ??
        users.find(systemUser =>
          [systemUser.fullName, systemUser.username, systemUser.email]
            .some(value => value.toLowerCase().includes(userQuery))
        );
      if (!matchedUser) {
        complete(`I could not find a user matching “${editUserMatch[1].trim()}”.`, 'error');
        return;
      }
      navigate('/users', { state: { voiceEditUserId: matchedUser.id } });
      complete(`Edit form opened for ${matchedUser.fullName}. Review all fields before saving.`);
      setOpen(false);
      return;
    }

    const userSearchMatch = normalized.match(/\b(?:find|search for|show) user (.+)$/);
    if (userSearchMatch) {
      if (user?.role !== 'admin') {
        complete('User Management is available only to Admin.', 'error');
        return;
      }
      navigate(`/users?q=${encodeURIComponent(userSearchMatch[1].trim())}`);
      complete(`Searching users for “${userSearchMatch[1].trim()}”.`);
      setOpen(false);
      return;
    }

    if (/\b(?:add|create) (?:a )?new user\b/.test(normalized)) {
      if (user?.role !== 'admin') {
        complete('Only Admin can create users.', 'error');
        return;
      }
      navigate('/users', { state: { voiceOpenAddUser: true } });
      complete('New user form opened. Complete and review all fields before creating the account.');
      setOpen(false);
      return;
    }

    const addMaterialMatch = rawCommand.trim().match(
      /\b(?:add|create) (?:a )?new material(?: named)?(?: (.+))?$/i
    );
    if (addMaterialMatch) {
      if (user?.role !== 'admin' && user?.role !== 'staff') {
        complete('Only Admin and Warehouse Staff can add inventory materials.', 'error');
        return;
      }
      navigate('/inventory', {
        state: {
          voiceMaterialDraft: {
            name: addMaterialMatch[1]?.trim() ?? '',
          },
        },
      });
      complete('New material form opened. Complete and review the inventory details before adding it.');
      setOpen(false);
      return;
    }

    const editMaterialMatch = rawCommand.trim().match(/\bedit material (.+)$/i);
    if (editMaterialMatch) {
      if (user?.role !== 'admin' && user?.role !== 'staff') {
        complete('Only Admin and Warehouse Staff can edit inventory materials.', 'error');
        return;
      }
      const matchedMaterial = findMaterial(editMaterialMatch[1]);
      if (!matchedMaterial) {
        complete(`I could not find a material matching “${editMaterialMatch[1].trim()}”.`, 'error');
        return;
      }
      navigate('/inventory', { state: { voiceEditMaterialId: matchedMaterial.id } });
      complete(`Edit form opened for ${formatMaterialName(matchedMaterial)}. Review all fields before saving.`);
      setOpen(false);
      return;
    }

    if (/\b(low stock|running low)\b/.test(normalized)) {
      navigate('/inventory?status=Low%20Stock');
      complete('Showing low-stock materials.');
      setOpen(false);
      return;
    }

    if (/\b(pending approvals?|requisitions? awaiting approval)\b/.test(normalized)) {
      if (user?.role !== 'admin') {
        complete('Your role does not permit access to material approvals.', 'error');
        return;
      }
      navigate('/approvals');
      complete('Opening pending approvals.');
      setOpen(false);
      return;
    }

    if (/\b(my pending requests?|pending material requests?)\b/.test(normalized)) {
      navigate('/requests?status=pending');
      complete('Opening your material requests.');
      setOpen(false);
      return;
    }

    const messageMatch = rawCommand.trim().match(
      /\b(compose|write|draft|send|message|tell) (?:a )?(?:message )?(?:to )?(.+)$/i
    );
    if (messageMatch) {
      if (user?.role !== 'engineer' && user?.role !== 'manager') {
        complete('Messaging is available only to Engineers and Project Managers.', 'error');
        return;
      }

      const action = messageMatch[1].toLowerCase();
      const details = messageMatch[2].trim();
      const sayingIndex = details.toLowerCase().indexOf(' saying ');
      const beforeContent = sayingIndex >= 0 ? details.slice(0, sayingIndex).trim() : details;
      const content = sayingIndex >= 0 ? details.slice(sayingIndex + 8).trim() : '';
      const aboutIndex = beforeContent.toLowerCase().indexOf(' about ');
      const recipientPhrase = (aboutIndex >= 0 ? beforeContent.slice(0, aboutIndex) : beforeContent).trim();
      const spokenSubject = aboutIndex >= 0 ? beforeContent.slice(aboutIndex + 7).trim() : '';

      const recipients = users.filter(candidate =>
        candidate.status === 'active' &&
        candidate.id !== user.id &&
        (user.role === 'engineer' ? candidate.role === 'manager' : candidate.role === 'engineer')
      );
      const recipientQuery = recipientPhrase.toLowerCase();
      const recipient = recipients.find(candidate =>
        candidate.fullName.toLowerCase().includes(recipientQuery) ||
        candidate.username.toLowerCase() === recipientQuery ||
        recipientQuery.includes(candidate.fullName.toLowerCase()) ||
        recipientQuery === candidate.role ||
        (recipientQuery === 'project manager' && candidate.role === 'manager') ||
        (recipientQuery === 'field engineer' && candidate.role === 'engineer')
      );

      if (!recipient) {
        const availableNames = recipients.map(candidate => candidate.fullName).join(', ');
        complete(
          availableNames
            ? `Recipient not found. Available recipients are ${availableNames}.`
            : 'No active recipients are available for your role.',
          'error'
        );
        return;
      }

      const requestReference = `${spokenSubject} ${content}`.match(/\bREQ\s*-?\s*(\d+)\b/i);
      const relatedRequest = requestReference
        ? requests.find(request => request.id.replace(/\D/g, '') === requestReference[1])
        : undefined;
      const subject = spokenSubject ||
        (relatedRequest ? `Regarding ${relatedRequest.id}` : content.slice(0, 60)) ||
        'New message';

      const shouldSendNow = ['send', 'message', 'tell'].includes(action);
      if (shouldSendNow) {
        if (!content) {
          complete(
            `Say what to send after “saying.” For example: “Send message to ${recipient.fullName} saying Delivery is ready.”`,
            'error'
          );
          return;
        }
        addMessage({
          senderId: user.id,
          senderName: user.fullName,
          senderRole: user.role,
          recipientId: recipient.id,
          recipientName: recipient.fullName,
          recipientRole: recipient.role as 'engineer' | 'manager',
          subject,
          content,
          timestamp: new Date().toISOString(),
          read: false,
          relatedRequestId: relatedRequest?.id,
        });
        complete(`Message sent to ${recipient.fullName}.`);
        setOpen(false);
        return;
      }

      navigate('/messages', {
        state: {
          voiceMessageDraft: {
            recipientId: recipient.id,
            subject,
            content,
            relatedRequestId: relatedRequest?.id ?? '',
          },
        },
      });
      complete(`Message draft opened for ${recipient.fullName}. Review it before pressing Send.`);
      setOpen(false);
      return;
    }

    const decisionMatch = normalized.match(/\b(approve|reject) (?:request )?([a-z]+\d+|\d+)\b/);
    if (decisionMatch) {
      if (user?.role !== 'admin') {
        complete('Only administrators can approve or reject requests.', 'error');
        return;
      }
      const idFragment = decisionMatch[2].toUpperCase();
      const request = requests.find(item =>
        item.id.toUpperCase() === idFragment ||
        item.id.replace(/\D/g, '') === idFragment.replace(/\D/g, '')
      );
      if (!request || request.status !== 'pending') {
        complete(`No pending request matching ${idFragment} was found.`, 'error');
        return;
      }
      navigate('/approvals', {
        state: {
          voiceApproval: {
            action: decisionMatch[1],
            requestId: request.id,
          },
        },
      });
      complete(`${decisionMatch[1] === 'approve' ? 'Approval' : 'Rejection'} confirmation opened for ${request.id}.`);
      setOpen(false);
      return;
    }

    const requestMatch = normalized.match(
      /\b(create|make|draft|submit|request|order|need) (?:a )?(?:material )?(?:request draft )?(?:request )?(?:for )?(\d+(?:\.\d+)?)\s+(.+)/
    );
    if (requestMatch) {
      if (user?.role !== 'manager') {
        complete('Only Project Managers can create material requests.', 'error');
        return;
      }
      const action = requestMatch[1];
      const quantity = Number(requestMatch[2]);
      const requestDetails = requestMatch[3];
      const purposeMatch = requestDetails.match(/\s+for\s+(.+)$/);
      const requestedName = requestDetails
        .replace(/\s+for\s+.+$/, '')
        .replace(/^(bags?|pieces?|pcs|units?|meters?|kilograms?|kg)\s+of\s+/, '')
        .trim();
      const material = findMaterial(requestedName);
      if (!material) {
        complete(`No material matching “${requestedName}” was found. Try a material name or category from inventory.`, 'error');
        return;
      }
      const shouldSubmitNow = ['submit', 'request', 'order', 'need'].includes(action);
      if (shouldSubmitNow) {
        if (!purposeMatch?.[1]?.trim()) {
          complete(
            'Include the project or purpose after “for.” For example: “Request 50 bags of cement for Project A.”',
            'error'
          );
          return;
        }
        const neededDate = new Date();
        neededDate.setDate(neededDate.getDate() + 7);
        addRequest({
          materialId: material.id,
          materialName: material.name,
          quantity,
          unit: material.unit,
          purpose: purposeMatch[1].trim(),
          dateNeeded: neededDate.toISOString().slice(0, 10),
          requestedBy: user.fullName,
          requestedById: user.id,
        });
        complete(
          `Request submitted for ${quantity} ${material.unit} of ${material.name} for ${purposeMatch[1].trim()}.`
        );
        setOpen(false);
        return;
      }
      navigate('/requests', {
        state: {
          voiceDraft: {
            materialId: material.id,
            quantity,
            purpose: purposeMatch?.[1]?.trim() ?? '',
          },
        },
      });
      complete(
        purposeMatch
          ? `Request form prepared for ${quantity} ${material.unit} of ${material.name} for ${purposeMatch[1].trim()}. Review the summary before submitting.`
          : `Request form prepared for ${quantity} ${material.unit} of ${material.name}. Add the project or purpose before submitting.`
      );
      setOpen(false);
      return;
    }

    const requestActionMatch = normalized.match(/\b(edit|cancel) (?:material )?request ([a-z]*\d+)\b/);
    if (requestActionMatch) {
      if (user?.role !== 'manager') {
        complete('Only Project Managers can edit or cancel their pending requests.', 'error');
        return;
      }
      const idFragment = requestActionMatch[2].toUpperCase();
      const request = requests.find(item =>
        item.requestedById === user.id &&
        item.status === 'pending' &&
        (
          item.id.toUpperCase() === idFragment ||
          item.id.replace(/\D/g, '') === idFragment.replace(/\D/g, '')
        )
      );
      if (!request) {
        complete(`No editable pending request matching ${idFragment} was found.`, 'error');
        return;
      }
      navigate('/requests', {
        state: {
          voiceRequestAction: {
            action: requestActionMatch[1],
            requestId: request.id,
          },
        },
      });
      complete(
        `${requestActionMatch[1] === 'edit' ? 'Edit' : 'Cancellation'} review opened for ${request.id}.`
      );
      setOpen(false);
      return;
    }

    const incomingMatch = rawCommand.trim().match(
      /\b(?:record|receive|add) (\d+(?:\.\d+)?)\s+(.+?)\s+(?:in|incoming)(?:\s+from\s+(.+))?$/i
    );
    const outgoingMatch = rawCommand.trim().match(
      /\b(?:record|release|issue) (\d+(?:\.\d+)?)\s+(.+?)\s+(?:out\s+)?to\s+(.+)$/i
    );
    if (incomingMatch || outgoingMatch) {
      if (user?.role !== 'admin' && user?.role !== 'staff') {
        complete('Only Admin and Warehouse Staff can record stock movements.', 'error');
        return;
      }
      const match = incomingMatch ?? outgoingMatch!;
      const type = incomingMatch ? 'in' : 'out';
      const quantity = Number(match[1]);
      const assignment = match[3]?.trim() ?? '';
      const material = findMaterial(match[2]);
      if (!material) {
        complete(`No material matching “${match[2].trim()}” was found.`, 'error');
        return;
      }
      if (type === 'out' && quantity > material.quantity) {
        complete(
          `Cannot prepare that release. Only ${material.quantity} ${material.unit} of ${material.name} are available.`,
          'error'
        );
        return;
      }
      navigate('/inout', {
        state: {
          voiceTransactionDraft: {
            type,
            materialId: material.id,
            quantity,
            assignedTo: assignment,
            notes: `Prepared by voice command for ${assignment || 'review'}`,
          },
        },
      });
      complete(
        `${type === 'in' ? 'Material IN' : 'Material OUT'} form prepared for ${quantity} ${material.unit} of ${material.name}. Review before recording.`
      );
      setOpen(false);
      return;
    }

    const requestStatusMatch = normalized.match(/\b(?:status of|show status of|delivery status of) (?:my )?(?:material )?request ([a-z]*\d+)\b/);
    if (requestStatusMatch) {
      const id = requestStatusMatch[1].toUpperCase();
      const request = requests.find(item =>
        item.id.toUpperCase() === id ||
        item.id.replace(/\D/g, '') === id.replace(/\D/g, '')
      );
      if (!request) {
        complete(`No request matching ${id} was found.`, 'error');
        return;
      }
      navigate(`/requests?q=${encodeURIComponent(request.id)}`);
      complete(`Request ${request.id} is ${request.status}. Opening request details.`);
      setOpen(false);
      return;
    }

    const issuedMatch = normalized.match(/\b(?:show|find) materials? issued to (.+)$/);
    if (issuedMatch) {
      const assignee = issuedMatch[1].trim();
      navigate(`/inout?q=${encodeURIComponent(assignee)}`);
      complete(`Showing material movements matching “${assignee}”.`);
      setOpen(false);
      return;
    }

    const inventorySearchMatch = normalized.match(
      /(?:check (?:the )?(?:available )?stock of|search inventory for|find|how many)\s+(.+?)(?:\s+(?:are available|in inventory|in the warehouse))?$/
    );
    if (inventorySearchMatch) {
      const query = inventorySearchMatch[1].trim();
      const matches = materials.filter(item =>
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.size?.toLowerCase().includes(query)
      );
      navigate(`/inventory?q=${encodeURIComponent(query)}`);
      complete(
        matches.length
          ? `${matches.length} matching material ${matches.length === 1 ? 'record' : 'records'} found. Opening inventory.`
          : `No inventory records matched “${query}”.`
      );
      setOpen(false);
      return;
    }

    const route = NAVIGATION_COMMANDS.find(item =>
      item.patterns.some(pattern => pattern.test(normalized))
    );
    if (route) {
      if (!user || !route.roles.includes(user.role)) {
        complete(`${route.label} is not available for your current role.`, 'error');
        return;
      }
      navigate(route.path);
      complete(`Opening ${route.label}.`);
      setOpen(false);
      return;
    }

    complete(
      'Command not recognized. Try “show low stock,” “find cement,” “create a request for 50 cement,” or “go to dashboard.”',
      'error'
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    runCommand(command);
  };

  commandRunnerRef.current = runCommand;

  const startRecognitionCycle = () => {
    if (!listeningRef.current) return;
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      listeningRef.current = false;
      setIsListening(false);
      complete('Voice recognition is unavailable in this browser. Use the command text field instead.', 'error');
      return;
    }

    const recognition = new Recognition();
    // One utterance per cycle is more reliable across Chrome/Edge versions.
    // onend immediately creates the next cycle while hands-free mode remains active.
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = event => {
      for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal === false) continue;
        const transcript = result?.[0]?.transcript?.trim() ?? '';
        if (!transcript) continue;
        setCommand(transcript);
        commandRunnerRef.current(transcript);
      }
    };
    recognition.onerror = event => {
      if (event.error === 'aborted') {
        if (listeningRef.current) setFeedback('Still listening. Say a command when you are ready.');
        return;
      }
      if (event.error === 'no-speech') {
        setFeedback('Still listening. Say a command when you are ready.');
        return;
      }
      listeningRef.current = false;
      setIsListening(false);
      complete(
        event.error === 'not-allowed'
          ? 'Microphone permission was denied. Allow microphone access or use the command text field.'
          : 'Voice recognition stopped unexpectedly. Use typed commands or start hands-free mode again.',
        'error'
      );
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!listeningRef.current) return;
      window.setTimeout(startRecognitionCycle, 200);
    };
    recognitionRef.current = recognition;
    setStatus('listening');
    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
      complete('Voice recognition could not start. Use the command text field instead.', 'error');
    }
  };

  const startListening = () => {
    if (listeningRef.current) return;
    listeningRef.current = true;
    setIsListening(true);
    setStatus('listening');
    setFeedback('Hands-free mode is active. Say commands continuously until you choose Stop Listening.');
    announce('Hands-free voice mode is active and will continue listening.');
    startRecognitionCycle();
  };

  const stopListening = () => {
    listeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus('idle');
    setFeedback('Hands-free mode stopped. You can still enter commands as text.');
    announce('Hands-free voice mode stopped.');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={isListening
              ? 'relative bg-yellow-400 text-stone-950 hover:bg-yellow-500'
              : 'text-stone-400 hover:text-white hover:bg-blue-900'}
            aria-label={isListening ? 'Voice commands listening. Open controls' : 'Open voice commands'}
            aria-pressed={isListening}
          >
            <Mic className="h-4 w-4" />
            {isListening && (
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse bg-red-600" aria-hidden="true" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Voice Commands</DialogTitle>
          <DialogDescription>
            Start hands-free mode once, then say commands across the website until you stop listening. Consequential actions still require review and confirmation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-command-input">Command</Label>
            <Input
              id="voice-command-input"
              value={command}
              onChange={event => setCommand(event.target.value)}
              placeholder="e.g., Find Portland cement"
              autoComplete="off"
            />
          </div>

          {recognizedCommand && (
            <div className="border border-stone-300 bg-stone-50 p-3 text-sm">
              <span className="font-bold">Recognized:</span> {recognizedCommand}
            </div>
          )}

          <div
            role="status"
            aria-live="polite"
            className="border-l-4 border-yellow-500 bg-stone-100 p-3 text-sm text-stone-700"
          >
            {feedback}
          </div>

          <div className="space-y-3 border border-stone-300 p-3">
            <div>
              <div className="text-sm font-bold uppercase tracking-wide">Navigate anywhere available to your role</div>
              <p className="text-xs text-stone-600">Say “open,” “show,” or “go to” followed by a page name.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableNavigationCommands.map(item => (
                <Button
                  key={item.path}
                  type="button"
                  variant="outline"
                  className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left"
                  onClick={() => {
                    setCommand(item.example);
                    runCommand(item.example);
                  }}
                  aria-label={`Run command: ${item.example}`}
                >
                  <span>
                    <span className="block text-xs text-stone-600">{item.label}</span>
                    <span className="block normal-case tracking-normal">“{item.example}”</span>
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold uppercase tracking-wide">Easy workflow commands</div>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {workflowExamples.map(example => (
                <Button
                  key={example}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-auto whitespace-normal normal-case tracking-normal"
                  onClick={() => {
                    setCommand(example);
                    runCommand(example);
                  }}
                  aria-label={`Run command: ${example}`}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {!speechSupported && (
            <div className="flex items-start gap-2 text-xs text-stone-600">
              <MicOff className="h-4 w-4 shrink-0" />
              Speech recognition is not supported here. Typed commands remain fully available.
            </div>
          )}

          <DialogFooter>
            {isListening ? (
              <Button type="button" variant="destructive" onClick={stopListening}>
                <Square className="h-4 w-4" />
                Stop Listening
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={startListening} disabled={!speechSupported}>
                <Mic className="h-4 w-4" />
                Start Hands-Free Mode
              </Button>
            )}
            <Button type="submit" disabled={!command.trim()}>
              <Send className="h-4 w-4" />
              Run Command
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>

      {isListening && !open && (
        <div
          role="status"
          aria-label="Hands-free voice mode is active"
          className="fixed bottom-[max(1rem,var(--safe-bottom))] left-3 right-3 z-50 flex items-center justify-between gap-3 border border-yellow-400 bg-blue-950 px-3 py-2 text-white shadow-lg sm:left-auto sm:w-auto"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 bg-yellow-500" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-yellow-400">Voice Active</div>
              <div className="truncate text-xs text-blue-100">
                {recognizedCommand ? `Last: “${recognizedCommand}”` : 'Say a command at any time'}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopListening}
            className="shrink-0 border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-stone-950"
          >
            <Square className="h-3 w-3" />
            Stop
          </Button>
        </div>
      )}
    </>
  );
}
