export interface MailSendOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}
