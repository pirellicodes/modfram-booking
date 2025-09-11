"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MailIcon,
  SaveIcon,
  TestTubeIcon,
  SettingsIcon,
  BellIcon,
  UserIcon,
  CalendarIcon,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "confirmation" | "reminder" | "cancellation" | "reschedule";
}

export function EmailSettings() {
  const [settings, setSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "ModFram Booking",
    replyToEmail: "",
    enableSSL: true,
    enableNotifications: true,
    reminderEnabled: true,
    reminderHours: "24",
    confirmationEnabled: true,
    cancellationEnabled: true,
    rescheduleEnabled: true,
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Booking Confirmation",
      subject: "Booking Confirmed - {{sessionType}} on {{date}}",
      content: `Hi {{clientName}},

Your booking has been confirmed!

Session Details:
- Type: {{sessionType}}
- Date: {{date}}
- Time: {{time}}
- Duration: {{duration}}

We look forward to seeing you soon!

Best regards,
{{businessName}}`,
      type: "confirmation",
    },
    {
      id: "2",
      name: "Booking Reminder",
      subject: "Reminder: {{sessionType}} tomorrow at {{time}}",
      content: `Hi {{clientName}},

This is a friendly reminder about your upcoming appointment:

Session Details:
- Type: {{sessionType}}
- Date: {{date}}
- Time: {{time}}
- Duration: {{duration}}

If you need to reschedule or cancel, please let us know as soon as possible.

See you soon!
{{businessName}}`,
      type: "reminder",
    },
    {
      id: "3",
      name: "Booking Cancellation",
      subject: "Booking Cancelled - {{sessionType}} on {{date}}",
      content: `Hi {{clientName}},

We've received your cancellation for the following booking:

Session Details:
- Type: {{sessionType}}
- Date: {{date}}
- Time: {{time}}

Thank you for letting us know. We hope to see you again soon!

Best regards,
{{businessName}}`,
      type: "cancellation",
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Implement save functionality with Supabase or API
    console.log("Saving email settings:", settings);
  };

  const handleTestEmail = () => {
    // TODO: Implement test email functionality
    console.log("Sending test email to:", testEmail);
    setIsTestDialogOpen(false);
    setTestEmail("");
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate({ ...template });
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate.id ? selectedTemplate : t
        )
      );
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "confirmation":
        return "bg-green-500/10 text-green-700";
      case "reminder":
        return "bg-blue-500/10 text-blue-700";
      case "cancellation":
        return "bg-red-500/10 text-red-700";
      case "reschedule":
        return "bg-yellow-500/10 text-yellow-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MailIcon className="h-6 w-6" />
            Email Settings
          </h2>
          <p className="text-muted-foreground">
            Configure email notifications and templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TestTubeIcon className="h-4 w-4 mr-2" />
                Test Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test email to verify your SMTP configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="test-email">Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTestDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleTestEmail} disabled={!testEmail}>
                  Send Test Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveSettings}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>

        {/* SMTP Configuration Tab */}
        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                SMTP Server Settings
              </CardTitle>
              <CardDescription>
                Configure your email server settings for sending notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={settings.smtpHost}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpHost: e.target.value })
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={settings.smtpPort}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPort: e.target.value })
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    value={settings.smtpUser}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpUser: e.target.value })
                    }
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-ssl"
                  checked={settings.enableSSL}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableSSL: checked })
                  }
                />
                <Label htmlFor="enable-ssl">Enable SSL/TLS</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Identity</CardTitle>
              <CardDescription>
                Configure how emails appear to recipients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    value={settings.fromEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, fromEmail: e.target.value })
                    }
                    placeholder="bookings@yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={settings.fromName}
                    onChange={(e) =>
                      setSettings({ ...settings, fromName: e.target.value })
                    }
                    placeholder="ModFram Booking"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-To Email</Label>
                <Input
                  id="reply-to"
                  value={settings.replyToEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, replyToEmail: e.target.value })
                  }
                  placeholder="support@yourcompany.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Control when and how email notifications are sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable all email notifications
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableNotifications: checked })
                  }
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Send confirmation emails when bookings are made
                    </p>
                  </div>
                  <Switch
                    checked={settings.confirmationEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, confirmationEnabled: checked })
                    }
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminder emails before appointments
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminderEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, reminderEnabled: checked })
                    }
                    disabled={!settings.enableNotifications}
                  />
                </div>

                {settings.reminderEnabled && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="reminder-hours">Send reminder</Label>
                    <Select
                      value={settings.reminderHours}
                      onValueChange={(value) =>
                        setSettings({ ...settings, reminderHours: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="4">4 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cancellation Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send emails when bookings are cancelled
                    </p>
                  </div>
                  <Switch
                    checked={settings.cancellationEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, cancellationEnabled: checked })
                    }
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reschedule Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send emails when bookings are rescheduled
                    </p>
                  </div>
                  <Switch
                    checked={settings.rescheduleEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, rescheduleEnabled: checked })
                    }
                    disabled={!settings.enableNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize the content of your automated emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge
                          variant="secondary"
                          className={getTemplateTypeColor(template.type)}
                        >
                          {template.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.subject}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variables Tab */}
        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Available variables you can use in your email templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Client Variables
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{clientName}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Client&apos;s full name
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{clientEmail}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Client&apos;s email address
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Booking Variables
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{sessionType}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Type of session
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{date}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Booking date
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{time}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Booking time
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{duration}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Session duration
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Business Variables
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{businessName}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Your business name
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <code className="text-sm">{"{{supportEmail}}"}</code>
                      <span className="text-xs text-muted-foreground">
                        Support email address
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize your email template content and subject line.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={selectedTemplate.name}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-subject">Subject Line</Label>
                <Input
                  id="template-subject"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      subject: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Email Content</Label>
                <Textarea
                  id="template-content"
                  rows={12}
                  value={selectedTemplate.content}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      content: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
