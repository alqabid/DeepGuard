import { Message } from './types';

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Amazon Support',
    senderEmail: 'support-security-check@amazon-security-alert-x92.com',
    subject: 'URGENT: Suspicious activity on your business account',
    content: `Dear Customer,

We have detected unusual purchasing activity on your Amazon Business account. To prevent suspension, please verify your payment method immediately by clicking the link below or replying with your credit card details for manual verification.

If you do not respond within 2 hours, your account will be permanently locked.

Sincerely,
Amazon Security Team`,
    timestamp: '10:42 AM',
    type: 'email',
    isRead: false,
  },
  {
    id: '2',
    sender: 'CEO - John Smith',
    senderEmail: 'john.smith@compnay-internal.com', // Typo in domain
    subject: 'Wire Transfer Request - Confidential',
    content: `Hi,

I'm currently in a meeting with investors and can't talk. I need you to process an urgent wire transfer of $4,500 to a new vendor immediately. It is critical for closing this deal today. 

I will forward the invoice shortly. Please confirm once the transfer is initiated. Do not call me as I am occupied.

Best,
John`,
    timestamp: '09:15 AM',
    type: 'email',
    isRead: false,
  },
  {
    id: '3',
    sender: 'Sarah Jenkins',
    senderEmail: 'sarah.j@legit-vendor.com',
    subject: 'Q3 Marketing Proposal',
    content: `Hi team,

Attached is the proposal for the Q3 marketing campaign we discussed last week. Let me know if you have any feedback before we finalize the budget.

Thanks,
Sarah`,
    timestamp: 'Yesterday',
    type: 'email',
    isRead: true,
  },
  {
    id: '4',
    sender: 'Unknown Caller',
    senderEmail: 'voice-msg@telecom-service.net',
    subject: 'Voicemail: Urgent Action Required',
    content: 'Voice message attached. Transcription: "This is Officer David from the IRS. There is a lawsuit against your company. You must call us back immediately or pay the penalty fine to avoid arrest."',
    timestamp: 'Yesterday',
    type: 'voice',
    isRead: false,
    // A placeholder simulated audio URL - in a real app this would be a blob
    audioUrl: 'simulated_audio_path', 
  }
];