import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Mail, User, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailViewerProps {
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  date: string;
  body: string;
  showRedFlags?: boolean;
  redFlags?: {
    element: string;
    description: string;
    location: string;
  }[];
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  sender,
  subject,
  date,
  body,
  showRedFlags = false,
  redFlags = [],
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(400);

  // Sanitize HTML content
  const sanitizedHtml = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: [
      'div', 'p', 'span', 'a', 'img', 'table', 'tr', 'td', 'th', 'tbody', 'thead',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'ul', 'ol', 'li', 'strong',
      'em', 'b', 'i', 'u', 's', 'strike', 'blockquote', 'pre', 'code', 'center',
      'font', 'style'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'style', 'class', 'id', 'width', 'height',
      'border', 'cellpadding', 'cellspacing', 'align', 'valign', 'bgcolor', 'color'
    ],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
  });

  // Adjust iframe height based on content
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const adjustHeight = () => {
        try {
          const height = iframe.contentWindow?.document.body.scrollHeight;
          if (height) {
            setIframeHeight(Math.max(height + 40, 400));
          }
        } catch (e) {
          // Cross-origin restrictions may prevent access
        }
      };
      
      iframe.onload = adjustHeight;
      // Fallback adjustment
      setTimeout(adjustHeight, 100);
    }
  }, [sanitizedHtml]);

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Check if email domain is suspicious
  const isSuspiciousDomain = (email: string) => {
    const suspiciousPatterns = [
      /-secure/i, /-verify/i, /-update/i, /-confirm/i,
      /security/i, /verification/i, /support-/i,
      /mailer-/i, /email-/i, /notification-/i,
    ];
    const domain = email.split('@')[1];
    if (!domain) return false;
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  };

  // Extract domain from email
  const getDomain = (email: string) => {
    return email.split('@')[1] || '';
  };

  return (
    <TooltipProvider>
      <Card className="w-full overflow-hidden border-gray-200 shadow-lg">
        {/* Email Header */}
        <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="space-y-3">
            {/* Subject */}
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {subject}
              </h2>
            </div>

            {/* Sender Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{sender.name}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p 
                        className={`text-sm truncate cursor-help ${
                          isSuspiciousDomain(sender.email) 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                        }`}
                      >
                        {sender.email}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Domain: {getDomain(sender.email)}</p>
                      {isSuspiciousDomain(sender.email) && (
                        <p className="text-red-500">⚠️ Suspicious domain pattern detected</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 sm:ml-auto">
                <Clock className="w-4 h-4" />
                <span>{formatDate(date)}</span>
              </div>
            </div>

            {/* Red Flags Banner */}
            {showRedFlags && redFlags.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-700">Red Flags Detected</span>
                </div>
                <ul className="space-y-1">
                  {redFlags.map((flag, index) => (
                    <li 
                      key={index} 
                      className="text-sm text-red-600 flex items-start gap-2"
                    >
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{flag.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Email Body */}
        <CardContent className="p-0">
          <div className="relative">
            {/* Suspicious Link Warning */}
            {showRedFlags && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Review Links Carefully
                </Badge>
              </div>
            )}

            {/* Iframe for isolated email rendering */}
            <iframe
              ref={iframeRef}
              sandbox="allow-same-origin"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        word-wrap: break-word;
                      }
                      a {
                        color: #0066cc;
                        text-decoration: underline;
                      }
                      a:hover {
                        color: #0052a3;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                      table {
                        max-width: 100%;
                      }
                      /* Highlight suspicious elements when red flags are shown */
                      ${showRedFlags ? `
                        a[href*="http://"] {
                          border: 2px dashed #ef4444;
                          padding: 2px 4px;
                          border-radius: 4px;
                        }
                      ` : ''}
                    </style>
                  </head>
                  <body>
                    ${sanitizedHtml}
                  </body>
                </html>
              `}
              style={{
                width: '100%',
                height: `${iframeHeight}px`,
                border: 'none',
                backgroundColor: 'white',
              }}
              title="Email content"
            />
          </div>
        </CardContent>

        {/* Security Notice */}
        <div className="bg-blue-50 border-t border-blue-100 p-3 text-xs text-blue-700 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Security Tip:</strong> Always hover over links to see the actual URL before clicking. 
            Legitimate companies use their official domain (e.g., amazon.com, not amazon-secure.com).
          </span>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default EmailViewer;
