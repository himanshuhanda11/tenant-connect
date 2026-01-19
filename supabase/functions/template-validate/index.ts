import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  workspaceId: string;
  templateVersionId?: string;
  selectedCategory: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  body: string;
  header?: { type?: string; text?: string; example?: string };
  footer?: string;
  buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }>;
  variables?: Array<{ key: string; label?: string; sample?: string }>;
  exampleValues?: Record<string, string>;
}

interface ValidationResult {
  predictedCategory: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  risk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  issues: Array<{
    type: string;
    message: string;
    severity: "error" | "warning" | "info";
    fix?: string;
  }>;
  suggestions: {
    suggestedRewrite?: string;
    suggestedExamples?: Record<string, string>;
    recommendedButtons?: Array<{ type: string; text: string }>;
    categoryAdvice?: string;
  };
  modelInfo: {
    model: string;
    latency?: number;
  };
}

function analyzeCategory(body: string, selectedCategory: string): {
  predicted: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  mismatch: boolean;
  advice?: string;
} {
  const lowerBody = body.toLowerCase();
  
  // Marketing indicators
  const marketingPatterns = [
    /\b(discount|offer|sale|promo|deal|exclusive|limited|hurry|now|buy|shop|order now)\b/i,
    /\b(\d+%\s*off|free shipping|bonus|gift|win|save)\b/i,
    /\b(don't miss|act now|last chance|today only|special)\b/i,
  ];
  
  // Utility indicators
  const utilityPatterns = [
    /\b(order|shipment|delivery|tracking|confirmation|appointment|booking|payment|receipt)\b/i,
    /\b(scheduled|confirmed|updated|status|notification|reminder|alert)\b/i,
    /\b(invoice|bill|transaction|account|balance)\b/i,
  ];
  
  // Authentication indicators
  const authPatterns = [
    /\b(otp|code|verify|verification|authenticate|login|password|reset)\b/i,
    /\{\{1\}\}\s*(is your|is the|para)/i,
    /\b(one-time|security code|pin)\b/i,
  ];
  
  const hasMarketing = marketingPatterns.some(p => p.test(lowerBody));
  const hasUtility = utilityPatterns.some(p => p.test(lowerBody));
  const hasAuth = authPatterns.some(p => p.test(lowerBody));
  
  let predicted: "UTILITY" | "MARKETING" | "AUTHENTICATION" = selectedCategory as any;
  let advice: string | undefined;
  
  if (hasAuth && body.includes("{{1}}")) {
    predicted = "AUTHENTICATION";
  } else if (hasMarketing && !hasUtility) {
    predicted = "MARKETING";
  } else if (hasUtility && !hasMarketing) {
    predicted = "UTILITY";
  } else if (hasMarketing && hasUtility) {
    predicted = "MARKETING"; // When both, prefer marketing to be safe
    advice = "Template contains both utility and promotional language. Consider splitting into separate templates.";
  }
  
  const mismatch = predicted !== selectedCategory;
  if (mismatch) {
    advice = `Content looks like ${predicted} but you selected ${selectedCategory}. This may cause rejection.`;
  }
  
  return { predicted, mismatch, advice };
}

function analyzeContent(payload: ValidateRequest): ValidationResult["issues"] {
  const issues: ValidationResult["issues"] = [];
  const { body, header, footer, buttons, selectedCategory, exampleValues, variables } = payload;
  
  // Body validation
  if (!body || body.trim().length < 10) {
    issues.push({
      type: "body_too_short",
      message: "Body text is too short. Minimum 10 characters required.",
      severity: "error",
    });
  }
  
  if (body.length > 1024) {
    issues.push({
      type: "body_too_long",
      message: "Body exceeds 1024 character limit.",
      severity: "error",
    });
  }
  
  // Variable validation
  const extractedVars = body.match(/\{\{(\d+)\}\}/g) || [];
  const varNumbers = [...new Set(extractedVars.map(v => v.replace(/[{}]/g, '')))];
  
  for (const varNum of varNumbers) {
    if (!exampleValues?.[varNum]) {
      issues.push({
        type: "missing_example",
        message: `Missing example value for variable {{${varNum}}}. Meta requires example values.`,
        severity: "error",
        fix: `Add a realistic sample value for {{${varNum}}}`,
      });
    }
  }
  
  // Authentication specific
  if (selectedCategory === "AUTHENTICATION" && !body.includes("{{1}}")) {
    issues.push({
      type: "auth_missing_otp",
      message: "Authentication templates must include {{1}} as the OTP/verification code.",
      severity: "error",
    });
  }
  
  // Formatting issues
  if (/[A-Z]{5,}/.test(body)) {
    issues.push({
      type: "excessive_caps",
      message: "Excessive use of capital letters may cause rejection.",
      severity: "warning",
      fix: "Use sentence case instead of ALL CAPS",
    });
  }
  
  if (/[!]{2,}/.test(body)) {
    issues.push({
      type: "excessive_punctuation",
      message: "Multiple exclamation marks may appear spammy.",
      severity: "warning",
      fix: "Use single punctuation marks",
    });
  }
  
  // URL validation in buttons
  buttons?.forEach((btn, idx) => {
    if (btn.type === "URL") {
      if (!btn.url) {
        issues.push({
          type: "missing_url",
          message: `Button ${idx + 1} is URL type but missing URL.`,
          severity: "error",
        });
      } else if (btn.url.includes("bit.ly") || btn.url.includes("tinyurl") || btn.url.includes("goo.gl")) {
        issues.push({
          type: "short_url",
          message: "URL shorteners are discouraged. Use direct links.",
          severity: "warning",
          fix: "Replace with your actual website URL",
        });
      } else if (!btn.url.startsWith("https://")) {
        issues.push({
          type: "insecure_url",
          message: "URLs must use HTTPS.",
          severity: "error",
          fix: "Change http:// to https://",
        });
      }
    }
  });
  
  // Utility with promotional content
  if (selectedCategory === "UTILITY") {
    const promoPatterns = [
      /discount/i, /offer/i, /sale/i, /promo/i, /deal/i, /buy now/i, /shop/i, /order now/i
    ];
    if (promoPatterns.some(p => p.test(body))) {
      issues.push({
        type: "utility_promotional",
        message: "Utility templates should not contain promotional language.",
        severity: "warning",
        fix: "Remove promotional content or switch to MARKETING category",
      });
    }
  }
  
  // Header validation
  if (header?.type === "text" && header.text && header.text.length > 60) {
    issues.push({
      type: "header_too_long",
      message: "Header text exceeds 60 character limit.",
      severity: "error",
    });
  }
  
  // Footer validation
  if (footer && footer.length > 60) {
    issues.push({
      type: "footer_too_long",
      message: "Footer text exceeds 60 character limit.",
      severity: "error",
    });
  }
  
  return issues;
}

function calculateScore(issues: ValidationResult["issues"]): number {
  let score = 100;
  
  for (const issue of issues) {
    if (issue.severity === "error") {
      score -= 25;
    } else if (issue.severity === "warning") {
      score -= 10;
    } else {
      score -= 5;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

function determineRisk(score: number, issues: ValidationResult["issues"]): "LOW" | "MEDIUM" | "HIGH" {
  const hasErrors = issues.some(i => i.severity === "error");
  
  if (hasErrors || score < 50) return "HIGH";
  if (score < 75) return "MEDIUM";
  return "LOW";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();
  
  try {
    const payload = await req.json() as ValidateRequest;
    
    // Validate required fields
    if (!payload.workspaceId || !payload.body || !payload.selectedCategory) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: workspaceId, body, selectedCategory" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Analyze category
    const categoryAnalysis = analyzeCategory(payload.body, payload.selectedCategory);
    
    // Analyze content
    const issues = analyzeContent(payload);
    
    // Add category mismatch issue if detected
    if (categoryAnalysis.mismatch) {
      issues.unshift({
        type: "category_mismatch",
        message: categoryAnalysis.advice || `Detected as ${categoryAnalysis.predicted}, but selected ${payload.selectedCategory}`,
        severity: "warning",
        fix: `Consider changing category to ${categoryAnalysis.predicted}`,
      });
    }
    
    // Calculate score and risk
    const score = calculateScore(issues);
    const risk = determineRisk(score, issues);
    
    // Build suggestions
    const suggestions: ValidationResult["suggestions"] = {
      categoryAdvice: categoryAnalysis.advice,
    };
    
    // Generate example suggestions for missing examples
    const extractedVars = payload.body.match(/\{\{(\d+)\}\}/g) || [];
    const varNumbers = [...new Set(extractedVars.map(v => v.replace(/[{}]/g, '')))];
    const missingExamples: Record<string, string> = {};
    
    for (const varNum of varNumbers) {
      if (!payload.exampleValues?.[varNum]) {
        // Suggest based on category
        if (payload.selectedCategory === "AUTHENTICATION" && varNum === "1") {
          missingExamples[varNum] = "123456";
        } else if (varNum === "1") {
          missingExamples[varNum] = "Customer Name";
        } else {
          missingExamples[varNum] = `Example ${varNum}`;
        }
      }
    }
    
    if (Object.keys(missingExamples).length > 0) {
      suggestions.suggestedExamples = missingExamples;
    }
    
    const result: ValidationResult = {
      predictedCategory: categoryAnalysis.predicted,
      risk,
      score,
      issues,
      suggestions,
      modelInfo: {
        model: "template-validator-v1",
        latency: Date.now() - startTime,
      },
    };
    
    // Store validation log in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    await adminClient.from("wa_template_validation_logs").insert({
      workspace_id: payload.workspaceId,
      template_version_id: payload.templateVersionId || null,
      selected_category: payload.selectedCategory,
      predicted_category: result.predictedCategory,
      risk: result.risk,
      score: result.score,
      issues: result.issues,
      suggestions: result.suggestions,
      model_info: result.modelInfo,
    });
    
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Validation error:", e);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      message: String(e) 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});