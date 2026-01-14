import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, MessageSquare, Phone, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AppAccessInstructions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Badge variant="outline" className="text-xs">
              For Meta Reviewers
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">App Access Instructions</h1>
            <p className="text-xl text-muted-foreground">
              Instructions for Meta App Review Team
            </p>
          </div>

          {/* App Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">App Name</p>
                  <p className="font-medium">AiReatro.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">App URL</p>
                  <a 
                    href="https://aireatro.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    https://aireatro.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">Web application (desktop browser)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                How to Access the App
              </CardTitle>
              <CardDescription>
                Follow these steps to create an account and access the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">1</span>
                  <div>
                    <p className="font-medium">Visit the application</p>
                    <p className="text-muted-foreground">Go to <a href="https://aireatro.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://aireatro.com</a></p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">2</span>
                  <div>
                    <p className="font-medium">Create an account</p>
                    <p className="text-muted-foreground">Click "Sign Up" and create a free account (no payment required)</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</span>
                  <div>
                    <p className="font-medium">Log in</p>
                    <p className="text-muted-foreground">Log in using the newly created account</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* WhatsApp Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                How to Test WhatsApp Business API Onboarding
              </CardTitle>
              <CardDescription>
                Steps to connect a WhatsApp Business Account using Meta Embedded Signup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">1</span>
                  <div>
                    <p className="font-medium">Navigate to WhatsApp Setup</p>
                    <p className="text-muted-foreground">After login, go to Dashboard → Phone Numbers</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">2</span>
                  <div>
                    <p className="font-medium">Start the connection flow</p>
                    <p className="text-muted-foreground">Click "Continue with Facebook"</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</span>
                  <div>
                    <p className="font-medium">Meta Embedded Signup popup</p>
                    <p className="text-muted-foreground">A Meta Embedded Signup popup will open</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">4</span>
                  <div>
                    <p className="font-medium">Facebook Login</p>
                    <p className="text-muted-foreground">Log in with a Facebook account that has access to a Facebook Business Manager</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">5</span>
                  <div>
                    <p className="font-medium">Select Business Portfolio</p>
                    <p className="text-muted-foreground">Select or create a Facebook Business Portfolio</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">6</span>
                  <div>
                    <p className="font-medium">WhatsApp Business Account</p>
                    <p className="text-muted-foreground">Select or create a WhatsApp Business Account</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">7</span>
                  <div>
                    <p className="font-medium">Phone Number Verification</p>
                    <p className="text-muted-foreground">Add a new or existing phone number and complete OTP verification</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">8</span>
                  <div>
                    <p className="font-medium">Complete Authorization</p>
                    <p className="text-muted-foreground">Complete the Meta authorization flow</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">9</span>
                  <div>
                    <p className="font-medium">Redirect & Confirmation</p>
                    <p className="text-muted-foreground">You will be redirected back to AiReatro.com. The WhatsApp status will display <Badge variant="default" className="ml-1">Connected / Live</Badge></p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Messaging Functionality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                How to Verify Messaging Functionality
              </CardTitle>
              <CardDescription>
                Test the WhatsApp messaging capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">1</span>
                  <div>
                    <p className="font-medium">Open Inbox</p>
                    <p className="text-muted-foreground">Navigate to the Inbox section</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">2</span>
                  <div>
                    <p className="font-medium">Send a test message</p>
                    <p className="text-muted-foreground">Send a test WhatsApp message (within WhatsApp policy limits)</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</span>
                  <div>
                    <p className="font-medium">Real-time updates</p>
                    <p className="text-muted-foreground">Incoming messages and delivery/read statuses will appear in real time</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* API Usage Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Confirmation of Meta APIs / Facebook Login Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Yes</strong>, this app uses Facebook Login as part of the WhatsApp Embedded Signup authorization flow.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Facebook Login is used <strong>only</strong> to authenticate users and authorize access to their Facebook Business Manager and WhatsApp Business Account.</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-3">The app uses Meta WhatsApp Cloud API with the following permissions:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">whatsapp_business_management</Badge>
                  <Badge variant="secondary">whatsapp_business_messaging</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p><strong>No additional Facebook user data</strong> (such as email, friends list, birthday, or gender) is accessed or stored.</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes for Reviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Users explicitly authorize access during Meta's Embedded Signup flow</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Customers do not access Meta Developer Console</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>WhatsApp data is accessed only after user consent</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>The app complies with Meta Platform Policies and WhatsApp Business Messaging Policies</p>
                </li>
              </ul>

              <Separator className="my-6" />

              <p className="text-muted-foreground text-center">
                If additional test access or clarification is required, we are available to provide it.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 AiReatro.com. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
