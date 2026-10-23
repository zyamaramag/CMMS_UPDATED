import PageTransition from '../components/PageTransition';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const requestedStatus = searchParams.get('status');
  const statusFilter =
    requestedStatus === 'allowed' || requestedStatus === 'blocked' || requestedStatus === 'alert'
      ? requestedStatus
      : 'all';
  const filteredSecurityEvents = statusFilter === 'all'
    ? securityEvents
    : securityEvents.filter(event => event.status === statusFilter);

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
      alert: { label: 'Alert', className: 'bg-amber-500 text-stone-950 hover:bg-amber-500', icon: AlertTriangle }
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

  const handleExport = () => {
    const rows = [
      ['Event ID', 'Type', 'Description', 'Status', 'Timestamp'],
      ...filteredSecurityEvents.map(event => [
        event.id,
        event.eventType,
        event.details,
        event.status,
        event.timestamp,
      ]),
    ];
    const csv = rows
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `hvl-security-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            onClick={handleExport}
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

        <Card className="border-blue-900 bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Last Security Scan</CardTitle>
            <Clock className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Apr 19</div>
            <p className="text-xs text-blue-100 mt-1">Next scan: Apr 21</p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-red-600" />
              <div>
                <CardTitle>Real-Time Security Monitoring</CardTitle>
                <CardDescription>Live security events and threat detection</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-red-700 hover:bg-red-700 gap-1">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
              {totalAlerts > 0 && (
                <Badge className="bg-amber-500 text-stone-950 hover:bg-amber-500">
                  {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <div className="max-w-xs pt-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setSearchParams(value === 'all' ? {} : { status: value }, { replace: true });
              }}
            >
              <SelectTrigger aria-label="Filter security events by status">
                <SelectValue placeholder="Filter security events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All security events</SelectItem>
                <SelectItem value="blocked">Blocked events</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="allowed">Allowed events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="Security events">
            {filteredSecurityEvents.map(event => (
              <Card key={event.id} className="border-stone-300 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-stone-600">{event.id}</div>
                      <h3 className="text-base font-bold text-stone-950">{event.eventType}</h3>
                    </div>
                    {getEventStatusBadge(event.status)}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Timestamp</dt>
                      <dd className="mt-0.5 text-sm text-stone-800">{event.timestamp}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Details</dt>
                      <dd className="mt-0.5 break-words text-sm text-stone-800">{event.details}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">IP Address</dt>
                      <dd className="mt-0.5 break-all font-mono text-sm text-stone-700">{event.ipAddress}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
            {filteredSecurityEvents.length === 0 && (
              <p className="border border-stone-300 p-6 text-center text-sm text-stone-600 md:col-span-2">
                No {statusFilter} security events found.
              </p>
            )}
          </div>

          <div className="hidden overflow-x-auto xl:block">
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
                {filteredSecurityEvents.map((event) => (
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
                {filteredSecurityEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-stone-600">
                      No {statusFilter} security events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Compliance Footer */}
      <Card className="bg-blue-950 border-stone-300">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
