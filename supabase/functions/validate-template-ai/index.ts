import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplateValidationRequest {
  template_id?: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  header_type?: string;
  header_content?: string;
  body: string;
  footer?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  variable_samples?: Record<string, string>;
}

interface ValidationIssue {
  category: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  suggestion?: string;
}

interface ValidationResponse {
  score: number;
  predictedCategory: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  categoryConfidence: number;
  categoryMismatch: boolean;
  risk: 'low' | 'medium' | 'high';
  issues: ValidationIssue[];
  suggestedRewrite?: string;
  suggestedExamples?: Record<string, string>;
  recommendedButtons?: Array<{ type: string; text: string }>;
  checklist: {
    categoryIntent: { status: 'pass' | 'warn' | 'fail'; items: string[] };
    variablesExamples: { status: 'pass' | 'warn' | 'fail'; items: string[] };
    linksButtons: { status: 'pass' | 'warn' | 'fail'; items: string[] };
    languageFormatting: { status: 'pass' | 'warn' | 'fail'; items: string[] };
    complianceRisk: { status: 'pass' | 'warn' | 'fail'; items: string[] };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const templateData: TemplateValidationRequest = await req.json();
    
    console.log('Validating template with AI:', templateData.name);

    // Build the prompt for AI analysis
    const prompt = `You are a WhatsApp Business API template expert. Analyze this template and provide validation feedback.

Template Details:
- Name: ${templateData.name}
- Category: ${templateData.category}
- Language: ${templateData.language}
- Header Type: ${templateData.header_type || 'none'}
- Header: ${templateData.header_content || 'N/A'}
- Body: ${templateData.body}
- Footer: ${templateData.footer || 'N/A'}
- Buttons: ${JSON.stringify(templateData.buttons || [])}
- Variable Samples: ${JSON.stringify(templateData.variable_samples || {})}

Analyze this template for Meta WhatsApp Business API approval. Consider:

1. CATEGORY DETECTION: What category does this template actually belong to?
   - UTILITY: Transactional messages (order updates, appointments, account notifications)
   - MARKETING: Promotional content, offers, newsletters
   - AUTHENTICATION: OTP/verification codes only

2. CONTENT ANALYSIS:
   - Check for promotional language in utility templates
   - Check for required OTP format in authentication templates
   - Check variable usage and examples
   - Check button configuration
   - Check for spam triggers or banned content

3. COMPLIANCE:
   - No misleading content
   - No prohibited content
   - Proper opt-out options for marketing
   - Clear sender identification

Return a JSON response with this exact structure:
{
  "predictedCategory": "MARKETING" | "UTILITY" | "AUTHENTICATION",
  "categoryConfidence": 0.0-1.0,
  "categoryMismatch": boolean,
  "risk": "low" | "medium" | "high",
  "issues": [
    {
      "category": "category_intent" | "variables_examples" | "links_buttons" | "language_formatting" | "compliance_risk",
      "severity": "error" | "warning" | "info",
      "message": "Description of the issue",
      "field": "body" | "header" | "footer" | "buttons" | null,
      "suggestion": "How to fix this"
    }
  ],
  "suggestedRewrite": "Improved version of the body text if needed, or null",
  "suggestedExamples": {"1": "example value"} or null,
  "recommendedButtons": [{"type": "QUICK_REPLY", "text": "Reply text"}] or null,
  "analysisNotes": "Brief explanation of the analysis"
}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai-gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a WhatsApp template validation expert. Always respond with valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI Gateway error:', await aiResponse.text());
      throw new Error('AI validation failed');
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let aiAnalysis;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic analysis
      aiAnalysis = {
        predictedCategory: templateData.category,
        categoryConfidence: 0.7,
        categoryMismatch: false,
        risk: 'medium',
        issues: [],
        suggestedRewrite: null,
        suggestedExamples: null,
        recommendedButtons: null,
      };
    }

    // Build checklist from issues
    const categoryIssues = aiAnalysis.issues?.filter((i: ValidationIssue) => i.category === 'category_intent') || [];
    const variableIssues = aiAnalysis.issues?.filter((i: ValidationIssue) => i.category === 'variables_examples') || [];
    const buttonIssues = aiAnalysis.issues?.filter((i: ValidationIssue) => i.category === 'links_buttons') || [];
    const formatIssues = aiAnalysis.issues?.filter((i: ValidationIssue) => i.category === 'language_formatting') || [];
    const complianceIssues = aiAnalysis.issues?.filter((i: ValidationIssue) => i.category === 'compliance_risk') || [];

    const getStatus = (issues: ValidationIssue[]) => {
      if (issues.some(i => i.severity === 'error')) return 'fail';
      if (issues.some(i => i.severity === 'warning')) return 'warn';
      return 'pass';
    };

    // Calculate score
    const errorCount = (aiAnalysis.issues || []).filter((i: ValidationIssue) => i.severity === 'error').length;
    const warningCount = (aiAnalysis.issues || []).filter((i: ValidationIssue) => i.severity === 'warning').length;
    let score = 100 - (errorCount * 20) - (warningCount * 5);
    if (aiAnalysis.categoryMismatch) score -= 15;
    if (aiAnalysis.risk === 'high') score -= 10;
    score = Math.max(0, Math.min(100, score));

    const response: ValidationResponse = {
      score,
      predictedCategory: aiAnalysis.predictedCategory || templateData.category,
      categoryConfidence: aiAnalysis.categoryConfidence || 0.8,
      categoryMismatch: aiAnalysis.categoryMismatch || false,
      risk: aiAnalysis.risk || 'low',
      issues: aiAnalysis.issues || [],
      suggestedRewrite: aiAnalysis.suggestedRewrite,
      suggestedExamples: aiAnalysis.suggestedExamples,
      recommendedButtons: aiAnalysis.recommendedButtons,
      checklist: {
        categoryIntent: {
          status: getStatus(categoryIssues),
          items: categoryIssues.map((i: ValidationIssue) => i.message),
        },
        variablesExamples: {
          status: getStatus(variableIssues),
          items: variableIssues.map((i: ValidationIssue) => i.message),
        },
        linksButtons: {
          status: getStatus(buttonIssues),
          items: buttonIssues.map((i: ValidationIssue) => i.message),
        },
        languageFormatting: {
          status: getStatus(formatIssues),
          items: formatIssues.map((i: ValidationIssue) => i.message),
        },
        complianceRisk: {
          status: getStatus(complianceIssues),
          items: complianceIssues.map((i: ValidationIssue) => i.message),
        },
      },
    };

    // Log validation for analytics (optional)
    if (templateData.template_id) {
      const { error: logError } = await supabase.from('template_validation_logs').insert({
        template_id: templateData.template_id,
        validation_result: response,
        validated_by: user.id,
      });
      if (logError) {
        console.log('Validation log skipped:', logError);
      }
    }

    console.log(`Template validation complete. Score: ${score}, Risk: ${response.risk}`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error validating template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Validation failed',
      details: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
