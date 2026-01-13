import { HeaderType, TemplateButton } from '@/types/template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, FileText, ExternalLink, Phone } from 'lucide-react';

interface WhatsAppPreviewProps {
  headerType: HeaderType;
  headerContent?: string;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
  variableSamples: Record<string, string>;
}

export function WhatsAppPreview({
  headerType,
  headerContent,
  body,
  footer,
  buttons,
  variableSamples
}: WhatsAppPreviewProps) {
  // Replace variables with sample values
  const replaceVariables = (text: string) => {
    return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
      return variableSamples[num] || match;
    });
  };

  const displayBody = replaceVariables(body);
  const displayHeader = headerContent ? replaceVariables(headerContent) : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📱 WhatsApp Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          {/* Phone Frame */}
          <div className="w-[320px] bg-[#ECE5DD] rounded-2xl p-4 shadow-lg">
            {/* Chat Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 rounded-t-xl -mx-4 -mt-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-lg">B</span>
              </div>
              <div>
                <p className="font-medium">Business Name</p>
                <p className="text-xs text-gray-200">Online</p>
              </div>
            </div>

            {/* Message Bubble */}
            <div className="bg-white rounded-lg shadow-sm max-w-[85%] ml-auto">
              {/* Header */}
              {headerType !== 'none' && (
                <div className="border-b">
                  {headerType === 'text' && displayHeader && (
                    <div className="px-3 py-2 font-semibold text-sm">
                      {displayHeader}
                    </div>
                  )}
                  {headerType === 'image' && (
                    <div className="bg-gray-100 rounded-t-lg p-8 flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {headerType === 'video' && (
                    <div className="bg-gray-100 rounded-t-lg p-8 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {headerType === 'document' && (
                    <div className="bg-gray-100 rounded-t-lg p-4 flex items-center gap-3">
                      <FileText className="h-10 w-10 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Document</p>
                        <p className="text-xs text-gray-500">PDF • Click to open</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-3 py-2">
                <p className="text-sm whitespace-pre-wrap">
                  {displayBody || (
                    <span className="text-gray-400 italic">Your message will appear here...</span>
                  )}
                </p>
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-3 pb-2">
                  <p className="text-xs text-gray-500">{footer}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="px-3 pb-2 flex justify-end">
                <span className="text-[10px] text-gray-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Buttons */}
              {buttons.length > 0 && (
                <div className="border-t">
                  {buttons.map((button, index) => (
                    <div 
                      key={index}
                      className="border-b last:border-b-0 px-3 py-2.5 flex items-center justify-center gap-2 text-[#00A5F4] text-sm font-medium hover:bg-gray-50 cursor-pointer"
                    >
                      {button.type === 'URL' && <ExternalLink className="h-4 w-4" />}
                      {button.type === 'PHONE_NUMBER' && <Phone className="h-4 w-4" />}
                      {button.text || `Button ${index + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <span className="text-gray-400 text-sm">Type a message</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
