import React from 'react';
import { Calendar, CreditCard, Download, Github, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const auditHistory = [
  {
    id: '1',
    projectName: 'react-todo-app',
    date: '2025-01-24',
    totalIssues: 61,
    status: 'paid'
  },
  {
    id: '2',
    projectName: 'vue-dashboard',
    date: '2025-01-22',
    totalIssues: 34,
    status: 'free'
  },
  {
    id: '3',
    projectName: 'nodejs-api',
    date: '2025-01-20',
    totalIssues: 28,
    status: 'paid'
  }
];

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account and view audit history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <Input
                    label="Name"
                    type="text"
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Company"
                    type="text"
                    placeholder="Your company name (optional)"
                  />
                  <Button>Update Profile</Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-6">Connected Accounts</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Github className="h-6 w-6" />
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-gray-600">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-6">Audit History</h2>
                <div className="space-y-4">
                  {auditHistory.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <History className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium">{audit.projectName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{audit.date}</span>
                            <span>•</span>
                            <span>{audit.totalIssues} issues found</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          audit.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {audit.status === 'paid' ? 'Paid' : 'Free'}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects analyzed</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issues found</span>
                    <span className="font-medium">123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fixes applied</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">Jan 2025</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing</span>
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Current plan</p>
                  <p className="font-medium">Pay-per-use</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade to Monthly
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};