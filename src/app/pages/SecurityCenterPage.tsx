import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Shield,
  Lock,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  FileCheck,
  Code,
  Server,
  Globe,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  ShieldCheck,
  ShieldAlert,
  Wifi
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  status: 'allowed' | 'blocked' | 'alert';
  details: string;
  ipAddress?: string;
}

export default function SecurityCenterPage() {
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  // Mock security events
  const securityEvents: SecurityEvent[] = [
    {
      id: 'SE001',
      timestamp: '2026-04-20 14:32:15',
      eventType: 'Login Attempt',
      status: 'allowed',
      details: 'User admin logged in successfully',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'SE002',
      timestamp: '2026-04-20 14:28:43',
      eventType: 'SQL Injection Attempt',
      status: 'blocked',
      details: 'Malicious query detected and blocked',
      ipAddress: '203.45.67.89'
    },
    {
      id: 'SE003',
      timestamp: '2026-04-20 14:25:12',
      eventType: 'XSS Attack',
      status: 'blocked',
      details: 'Cross-site scripting attempt prevented',
      ipAddress: '185.22.33.44'
    },
    {
      id: 'SE004',
      timestamp: '2026-04-20 14:20:05',
      eventType: 'Firewall Block',
      status: 'blocked',
      details: 'Unauthorized port access denied',
      ipAddress: '91.103.45.22'
    },
    {
      id: 'SE005',
      timestamp: '2026-04-20 14:15:33',
      eventType: 'Suspicious Activity',
      status: 'alert',
      details: 'Multiple failed login attempts detected',
      ipAddress: '78.91.12.56'
    },
    {
      id: 'SE006',
      timestamp: '2026-04-20 14:10:22',
      eventType: 'API Access',
      status: 'allowed',
      details: 'Authorized API request processed',
      ipAddress: '192.168.1.50'
    },
    {
      id: 'SE007',
      timestamp: '2026-04-20 14:05:18',
      eventType: 'DDoS Attempt',
      status: 'blocked',
      details: 'Rate limit exceeded - request throttled',
      ipAddress: '45.67.89.123'
    },
    {
      id: 'SE008',
      timestamp: '2026-04-20 14:00:00',
      eventType: 'Security Scan',
      status: 'allowed',
      details: 'Automated security scan completed',
      ipAddress: 'Internal'
    }
  ];

  const networkSecurityFeatures = [
    {
      title: 'HTTPS (TLS 1.3 Encryption)',
      status: 'active',
      description: 'End-to-end encryption for all data transmission',
      icon: Lock,
      color: 'green'
    },
    {
      title: 'Firewall Protection',
      status: 'enabled',
      description: 'Blocking unauthorized access and malicious traffic',
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Network Segmentation',
      status: 'active',
      description: 'Controlled traffic flow between network zones',
      icon: Network,
      color: 'green'
    },
    {
      title: 'IDS/IPS System',
      status: 'monitoring',
      description: 'Real-time intrusion detection and prevention',
      icon: Eye,
      color: 'green'
    }
  ];

  const applicationSecurityFeatures = [
    {
      title: 'Input Validation & Sanitization',
      status: 'protected',
      description: 'OWASP protection against SQL Injection and XSS attacks',
      icon: ShieldCheck,
      details: ['Prevents SQL Injection', 'Blocks XSS attacks', 'Input filtering active']
    },
    {
      title: 'Secure Code Review',
      status: 'compliant',
      description: 'Automated and manual security code analysis',
      icon: Code,
      details: ['SAST: Passed ✓', 'DAST: Completed ✓', 'Last scan: 2026-04-19']
    },
    {
      title: 'Web Application Firewall (WAF)',
      status: 'active',
      description: 'Filtering malicious HTTP/HTTPS requests',
      icon: Globe,
      details: ['SQL Injection: Blocked', 'XSS: Blocked', 'DDoS Protection: Active']
    },
    {
      title: 'Secure SDLC',
      status: 'compliant',
      description: 'Security integrated throughout development lifecycle',
      icon: FileCheck,
      details: ['Security requirements defined', 'Threat modeling completed', 'Regular security audits']
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'bg-green-600 hover:bg-green-600 text-white' },
      enabled: { label: 'Enabled', className: 'bg-green-600 hover:bg-green-600 text-white' },
      monitoring: { label: 'Monitoring', className: 'bg-blue-900 hover:bg-blue-900 text-white' },
      protected: { label: 'Protected', className: 'bg-green-600 hover:bg-green-600 text-white' },
      compliant: { label: 'Compliant', className: 'bg-green-600 hover:bg-green-600 text-white' }
    };

    const config = statusConfig[status] || { label: 'Unknown', className: 'bg-slate-600' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getEventStatusBadge = (status: 'allowed' | 'blocked' | 'alert') => {
    const statusConfig = {
      allowed: { label: 'Allowed', className: 'bg-green-600 hover:bg-green-600', icon: CheckCircle },
      blocked: { label: 'Blocked', className: 'bg-red-600 hover:bg-red-600', icon: XCircle },
      alert: { label: 'Alert', className: 'bg-red-700 hover:bg-red-700', icon: AlertTriangle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  const blockedThreats = securityEvents.filter(e => e.status === 'blocked').length;
  const totalAlerts = securityEvents.filter(e => e.status === 'alert').length;
  const activeSecurityLayers = networkSecurityFeatures.length + applicationSecurityFeatures.length;

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950 flex items-center gap-3">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-stone-800" />
            Security Center
          </h1>
          <p className="text-stone-700 mt-1">Comprehensive security monitoring and protection</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-sm text-stone-700 hidden sm:inline">Last updated: {lastUpdated}</span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-stone-950 gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Overview Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-800 bg-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System Security Status</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Secure</div>
            <p className="text-xs text-green-100 mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-red-800 bg-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Threats Blocked</CardTitle>
            <ShieldAlert className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{blockedThreats}</div>
            <p className="text-xs text-red-100 mt-1">In the last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-stone-300 bg-stone-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-950">Active Security Layers</CardTitle>
            <Activity className="h-5 w-5 text-stone-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-950">{activeSecurityLayers}</div>
            <p className="text-xs text-stone-900 mt-1">Protections enabled</p>
          </CardContent>
        </Card>

        <Card className="border-red-800 bg-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Last Security Scan</CardTitle>
            <Clock className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">Apr 19</div>
            <p className="text-xs text-red-700 mt-1">Next scan: Apr 21</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Security Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="h-6 w-6 text-stone-800" />
          <h2 className="text-2xl font-semibold text-stone-950">Network Security</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {networkSecurityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-none transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-green-700" />
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-700">{feature.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Fully Operational</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Application Security Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-semibold text-stone-950">Application Security</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {applicationSecurityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-none transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-stone-900" />
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-stone-800">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security Monitoring Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-red-600" />
              <div>
                <CardTitle>Real-Time Security Monitoring</CardTitle>
                <CardDescription>Live security events and threat detection</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-700 hover:bg-red-700 gap-1">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
              {totalAlerts > 0 && (
                <Badge className="bg-red-600 hover:bg-red-600">
                  {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-300 text-left">
                  <th className="pb-3 text-sm font-medium text-stone-700">Timestamp</th>
                  <th className="pb-3 text-sm font-medium text-stone-700">Event Type</th>
                  <th className="pb-3 text-sm font-medium text-stone-700">Status</th>
                  <th className="pb-3 text-sm font-medium text-stone-700">Details</th>
                  <th className="pb-3 text-sm font-medium text-stone-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {securityEvents.map((event) => (
                  <tr key={event.id} className="border-b border-stone-300 hover:bg-stone-50">
                    <td className="py-3 text-sm text-stone-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-stone-500" />
                        {event.timestamp}
                      </div>
                    </td>
                    <td className="py-3 text-sm font-medium text-stone-950">{event.eventType}</td>
                    <td className="py-3">{getEventStatusBadge(event.status)}</td>
                    <td className="py-3 text-sm text-stone-700">{event.details}</td>
                    <td className="py-3 text-sm text-stone-600 font-mono">{event.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Compliance Footer */}
      <Card className="bg-blue-950 border-stone-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                <Shield className="h-8 w-8 text-stone-800" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Security Compliance Status</h3>
                <p className="text-sm text-blue-200 mt-1">
                  HVL Engineering Services meets industry-standard security requirements
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 hover:bg-green-600 text-white px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Fully Compliant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}