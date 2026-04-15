import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import { RequirePermission } from "@/components/auth/RequirePermission";
import {
  META_ADS_ATTRIBUTION_PERMISSIONS,
  META_ADS_AUTOMATION_PERMISSIONS,
  META_ADS_CONNECT_PERMISSIONS,
  META_ADS_VIEW_PERMISSIONS,
} from "@/lib/metaAdsPermissions";

const Login = lazyWithRetry(() => import("./pages/Login"));
const Toaster = lazyWithRetry(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const Sonner = lazyWithRetry(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const InviteAccept = lazyWithRetry(() => import("./pages/InviteAccept"));
const SignupPage = lazyWithRetry(() => import("./pages/onboarding/SignupPage"));
const OrganizationPage = lazyWithRetry(() => import("./pages/onboarding/OrganizationPage"));
const PasswordPage = lazyWithRetry(() => import("./pages/onboarding/PasswordPage"));
const AuthCallback = lazyWithRetry(() => import("./pages/AuthCallback"));
const CreateWorkspace = lazyWithRetry(() => import("./pages/CreateWorkspace"));
const SelectWorkspace = lazyWithRetry(() => import("./pages/SelectWorkspace"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const InboxPage = lazyWithRetry(() => import("./pages/InboxPage"));
const InboxCRMDashboard = lazyWithRetry(() => import("./pages/inbox/InboxCRMDashboard"));
const Contacts = lazyWithRetry(() => import("./pages/Contacts"));
const ContactSegments = lazyWithRetry(() => import("./pages/ContactSegments"));
const ContactImports = lazyWithRetry(() => import("./pages/ContactImports"));
const ContactDuplicates = lazyWithRetry(() => import("./pages/ContactDuplicates"));
const ContactDataRequests = lazyWithRetry(() => import("./pages/ContactDataRequests"));
const Tags = lazyWithRetry(() => import("./pages/Tags"));
const UserAttributes = lazyWithRetry(() => import("./pages/UserAttributes"));
const PhoneNumbers = lazyWithRetry(() => import("./pages/PhoneNumbers"));
const PhoneNumbersList = lazyWithRetry(() => import("./pages/phone-numbers/PhoneNumbersList"));
const ConnectNumber = lazyWithRetry(() => import("./pages/phone-numbers/ConnectNumber"));
const PhoneNumberDetails = lazyWithRetry(() => import("./pages/phone-numbers/PhoneNumberDetails"));
const Templates = lazyWithRetry(() => import("./pages/Templates"));
const CampaignsList = lazyWithRetry(() => import("./pages/campaigns/CampaignsList"));
const CreateCampaign = lazyWithRetry(() => import("./pages/campaigns/CreateCampaign"));
const CampaignDetails = lazyWithRetry(() => import("./pages/campaigns/CampaignDetails"));
const CampaignLibrary = lazyWithRetry(() => import("./pages/campaigns/CampaignLibrary"));
const AutomationWorkflows = lazyWithRetry(() => import("./pages/AutomationWorkflows"));
const AutoFormRules = lazyWithRetry(() => import("./pages/AutoFormRules"));
const AutoFormsList = lazyWithRetry(() => import("./pages/auto-forms/AutoFormsList"));
const AutoFormBuilder = lazyWithRetry(() => import("./pages/auto-forms/AutoFormBuilder"));
const AutoFormRulesPage = lazyWithRetry(() => import("./pages/auto-forms/AutoFormRulesPage"));
const AutoFormSubmissions = lazyWithRetry(() => import("./pages/auto-forms/AutoFormSubmissions"));
const FlowsHub = lazyWithRetry(() => import("./pages/flows/FlowsHub"));
const FlowBuilder = lazyWithRetry(() => import("./pages/flows/FlowBuilder"));
const Billing = lazyWithRetry(() => import("./pages/Billing"));
const WorkspaceAddOns = lazyWithRetry(() => import("./pages/WorkspaceAddOns"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const AppAccessInstructions = lazyWithRetry(() => import("./pages/AppAccessInstructions"));
const Products = lazyWithRetry(() => import("./pages/Products"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing"));
const Help = lazyWithRetry(() => import("./pages/Help"));
const HelpCenter = lazyWithRetry(() => import("./pages/help/HelpCenter"));
const HelpCategory = lazyWithRetry(() => import("./pages/help/HelpCategory"));
const GuideDetail = lazyWithRetry(() => import("./pages/help/GuideDetail"));
const InboxGuide = lazyWithRetry(() => import("./pages/help/InboxGuide"));
const TemplatesGuide = lazyWithRetry(() => import("./pages/help/TemplatesGuide"));
const AutomationGuide = lazyWithRetry(() => import("./pages/help/AutomationGuide"));
const ContactsTagsGuide = lazyWithRetry(() => import("./pages/help/ContactsTagsGuide"));
const MetaAdsGuide = lazyWithRetry(() => import("./pages/help/MetaAdsGuide"));
const WorkspacesGuide = lazyWithRetry(() => import("./pages/help/WorkspacesGuide"));
const TeamGuide = lazyWithRetry(() => import("./pages/help/TeamGuide"));
const CampaignsGuide = lazyWithRetry(() => import("./pages/help/CampaignsGuide"));
const FormRulesGuide = lazyWithRetry(() => import("./pages/help/FormRulesGuide"));
const PhoneNumbersGuide = lazyWithRetry(() => import("./pages/help/PhoneNumbersGuide"));
const GuideManager = lazyWithRetry(() =>
  import("./components/admin/GuideManager").then((module) => ({ default: module.GuideManager }))
);
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const Careers = lazyWithRetry(() => import("./pages/Careers"));
const Integrations = lazyWithRetry(() => import("./pages/Integrations"));
const IntegrationsHub = lazyWithRetry(() => import("./pages/IntegrationsHub"));
const IntegrationDetail = lazyWithRetry(() => import("./pages/IntegrationDetail"));
const Security = lazyWithRetry(() => import("./pages/Security"));
const DataDeletion = lazyWithRetry(() => import("./pages/DataDeletion"));
const AcceptableUse = lazyWithRetry(() => import("./pages/AcceptableUse"));
const CookiePolicy = lazyWithRetry(() => import("./pages/CookiePolicy"));
const RefundPolicy = lazyWithRetry(() => import("./pages/RefundPolicy"));
const Compliance = lazyWithRetry(() => import("./pages/Compliance"));
const CaseStudies = lazyWithRetry(() => import("./pages/CaseStudies"));
const CaseStudyDetail = lazyWithRetry(() => import("./pages/CaseStudyDetail"));
const TemplateLibrary = lazyWithRetry(() => import("./pages/TemplateLibrary"));
const Documentation = lazyWithRetry(() => import("./pages/Documentation"));
const InboxFeature = lazyWithRetry(() => import("./pages/features/InboxFeature"));
const ContactsFeature = lazyWithRetry(() => import("./pages/features/ContactsFeature"));
const TemplatesFeature = lazyWithRetry(() => import("./pages/features/TemplatesFeature"));
const CampaignsFeature = lazyWithRetry(() => import("./pages/features/CampaignsFeature"));
const AutomationFeature = lazyWithRetry(() => import("./pages/features/AutomationFeature"));
const IntegrationsFeature = lazyWithRetry(() => import("./pages/features/IntegrationsFeature"));
const AnalyticsFeature = lazyWithRetry(() => import("./pages/features/AnalyticsFeature"));
const PhoneNumbersFeature = lazyWithRetry(() => import("./pages/features/PhoneNumbersFeature"));
const TeamRolesFeature = lazyWithRetry(() => import("./pages/features/TeamRolesFeature"));
const AuditLogsFeature = lazyWithRetry(() => import("./pages/features/AuditLogsFeature"));
const Partners = lazyWithRetry(() => import("./pages/Partners"));
const Features = lazyWithRetry(() => import("./pages/Features"));
const WhatsAppForms = lazyWithRetry(() => import("./pages/WhatsAppForms"));
const WhatsAppBusinessApi = lazyWithRetry(() => import("./pages/WhatsAppBusinessApi"));
const ClickToWhatsApp = lazyWithRetry(() => import("./pages/ClickToWhatsApp"));
const WhyWhatsAppMarketing = lazyWithRetry(() => import("./pages/WhyWhatsAppMarketing"));
const FreeWhatsAppApiLifetime = lazyWithRetry(() => import("./pages/FreeWhatsAppApiLifetime"));
const DocsViewer = lazyWithRetry(() => import("./pages/DocsViewer"));
const WhyAireatro = lazyWithRetry(() => import("./pages/WhyAireatro"));
const MetaAdsOverview = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsOverview"));
const MetaAdsSetup = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsSetup"));
const MetaAdsManager = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsManager"));
const MetaAdsAnalytics = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsAnalytics"));
const MetaAdsAttribution = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsAttribution"));
const MetaAdsAutomations = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsAutomations"));
const MetaAdsSettings = lazyWithRetry(() => import("./pages/meta-ads/MetaAdsSettings"));
const CreateMetaCampaign = lazyWithRetry(() => import("./pages/meta-ads/CreateMetaCampaign"));
const LeadFormsPage = lazyWithRetry(() => import("./pages/LeadFormsPage"));
const Install = lazyWithRetry(() => import("./pages/Install"));
const BlogBuilderDashboard = lazyWithRetry(() => import("./pages/developer/BlogBuilderDashboard"));
const BlogEditor = lazyWithRetry(() => import("./pages/developer/BlogEditor"));
const MediaLibraryPage = lazyWithRetry(() => import("./pages/developer/MediaLibraryPage"));
const ShopifyOverview = lazyWithRetry(() => import("./pages/shopify/ShopifyOverview"));
const ShopifyConnect = lazyWithRetry(() => import("./pages/shopify/ShopifyConnect"));
const ShopifyStoreDetail = lazyWithRetry(() => import("./pages/shopify/ShopifyStoreDetail"));
const ShopifySyncCenter = lazyWithRetry(() => import("./pages/shopify/ShopifySyncCenter"));
const ShopifyWebhooks = lazyWithRetry(() => import("./pages/shopify/ShopifyWebhooks"));
const ShopifySettings = lazyWithRetry(() => import("./pages/shopify/ShopifySettings"));
const ShopifyDataExplorer = lazyWithRetry(() => import("./pages/shopify/ShopifyDataExplorer"));
const ShopifyCartRecovery = lazyWithRetry(() => import("./pages/shopify/ShopifyCartRecovery"));
const ShopifyAnalytics = lazyWithRetry(() => import("./pages/shopify/ShopifyAnalytics"));
const ShopifyAutomations = lazyWithRetry(() => import("./pages/shopify/ShopifyAutomations"));
const SeoDashboard = lazyWithRetry(() => import("./pages/developer/SeoDashboard"));
const AdminLayout = lazyWithRetry(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazyWithRetry(() => import("./pages/admin/AdminOverview"));
const AdminWorkspaces = lazyWithRetry(() => import("./pages/admin/AdminWorkspaces"));
const AdminAuditLogs = lazyWithRetry(() => import("./pages/admin/AdminAuditLogs"));
const AdminWorkspaceDetail = lazyWithRetry(() => import("./pages/admin/AdminWorkspaceDetail"));
const AdminTeam = lazyWithRetry(() => import("./pages/admin/AdminTeam"));
const AdminBilling = lazyWithRetry(() => import("./pages/admin/AdminBilling"));
const AdminPhoneNumbers = lazyWithRetry(() => import("./pages/admin/AdminPhoneNumbers"));
const AdminSettings = lazyWithRetry(() => import("./pages/admin/AdminSettings"));
const AdminIncidents = lazyWithRetry(() => import("./pages/admin/AdminIncidents"));
const QualifiedLeads = lazyWithRetry(() => import("./pages/QualifiedLeads"));
const TeamOverview = lazyWithRetry(() => import("./pages/team/TeamOverview"));
const TeamMembers = lazyWithRetry(() => import("./pages/team/TeamMembers"));
const TeamRoles = lazyWithRetry(() => import("./pages/team/TeamRoles"));
const TeamGroups = lazyWithRetry(() => import("./pages/team/TeamGroups"));
const TeamRouting = lazyWithRetry(() => import("./pages/team/TeamRouting"));
const TeamSLA = lazyWithRetry(() => import("./pages/team/TeamSLA"));
const TeamAudit = lazyWithRetry(() => import("./pages/team/TeamAudit"));

const queryClient = new QueryClient();

function RouteLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={null}>
          <Toaster />
          <Sonner />
        </Suspense>
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <ThemeProvider>
                <ScrollToTop />
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/index" element={<Index />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/invite/accept" element={<InviteAccept />} />
                    <Route path="/onboarding/org" element={<OrganizationPage />} />
                    <Route path="/onboarding/password" element={<PasswordPage />} />
                    <Route path="/create-workspace" element={<CreateWorkspace />} />
                    <Route path="/select-workspace" element={<SelectWorkspace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/inbox/dashboard" element={<InboxCRMDashboard />} />
                    <Route path="/inbox/mine" element={<InboxPage />} />
                    <Route path="/inbox/unassigned" element={<InboxPage />} />
                    <Route path="/inbox/open" element={<InboxPage />} />
                    <Route path="/inbox/follow-up" element={<InboxPage />} />
                    <Route path="/inbox/resolved" element={<InboxPage />} />
                    <Route path="/inbox/spam" element={<InboxPage />} />
                    <Route path="/inbox/:id" element={<InboxPage />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/qualified-leads" element={<QualifiedLeads />} />
                    <Route path="/contacts/segments" element={<ContactSegments />} />
                    <Route path="/contacts/imports" element={<ContactImports />} />
                    <Route path="/contacts/duplicates" element={<ContactDuplicates />} />
                    <Route path="/contacts/data-requests" element={<ContactDataRequests />} />
                    <Route path="/tags" element={<Tags />} />
                    <Route path="/user-attributes" element={<UserAttributes />} />
                    <Route path="/phone-numbers" element={<PhoneNumbersList />} />
                    <Route path="/phone-numbers/connect" element={<ConnectNumber />} />
                    <Route path="/phone-numbers/:id" element={<PhoneNumberDetails />} />
                    <Route path="/phone-numbers-legacy" element={<PhoneNumbers />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/campaigns" element={<CampaignsList />} />
                    <Route path="/campaigns/create" element={<CreateCampaign />} />
                    <Route path="/campaigns/library" element={<CampaignLibrary />} />
                    <Route path="/campaigns/:id" element={<CampaignDetails />} />
                    <Route path="/automation" element={<AutomationWorkflows />} />
                    <Route path="/automation/form-rules" element={<AutoFormRules />} />
                    <Route path="/auto-forms" element={<AutoFormsList />} />
                    <Route path="/auto-forms/:id/builder" element={<AutoFormBuilder />} />
                    <Route path="/auto-forms/:id/rules" element={<AutoFormRulesPage />} />
                    <Route path="/auto-forms/:id/submissions" element={<AutoFormSubmissions />} />
                    <Route path="/flows" element={<FlowsHub />} />
                    <Route path="/flows/builder" element={<FlowBuilder />} />
                    <Route path="/flows/builder/:id" element={<FlowBuilder />} />
                    <Route path="/team" element={<TeamOverview />} />
                    <Route path="/team/overview" element={<TeamOverview />} />
                    <Route path="/team/members" element={<TeamMembers />} />
                    <Route path="/team/roles" element={<TeamRoles />} />
                    <Route path="/team/groups" element={<TeamGroups />} />
                    <Route path="/team/routing" element={<TeamRouting />} />
                    <Route path="/team/sla" element={<TeamSLA />} />
                    <Route path="/team/audit" element={<TeamAudit />} />
                    <Route path="/meta-ads" element={<RequirePermission anyOf={META_ADS_VIEW_PERMISSIONS}><MetaAdsOverview /></RequirePermission>} />
                    <Route path="/meta-ads/setup" element={<RequirePermission anyOf={META_ADS_CONNECT_PERMISSIONS}><MetaAdsSetup /></RequirePermission>} />
                    <Route path="/lead-forms" element={<RequirePermission anyOf={META_ADS_VIEW_PERMISSIONS}><LeadFormsPage /></RequirePermission>} />
                    <Route path="/meta-ads/manager" element={<RequirePermission anyOf={META_ADS_VIEW_PERMISSIONS}><MetaAdsManager /></RequirePermission>} />
                    <Route path="/meta-ads/analytics" element={<RequirePermission anyOf={META_ADS_VIEW_PERMISSIONS}><MetaAdsAnalytics /></RequirePermission>} />
                    <Route path="/meta-ads/attribution" element={<RequirePermission anyOf={META_ADS_ATTRIBUTION_PERMISSIONS}><MetaAdsAttribution /></RequirePermission>} />
                    <Route path="/meta-ads/automations" element={<RequirePermission anyOf={META_ADS_AUTOMATION_PERMISSIONS}><MetaAdsAutomations /></RequirePermission>} />
                    <Route path="/meta-ads/settings" element={<RequirePermission anyOf={META_ADS_CONNECT_PERMISSIONS}><MetaAdsSettings /></RequirePermission>} />
                    <Route path="/meta-ads/create" element={<RequirePermission anyOf={['meta_ads.manage']}><CreateMetaCampaign /></RequirePermission>} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/add-ons" element={<WorkspaceAddOns />} />
                    <Route path="/app/integrations" element={<IntegrationsHub />} />
                    <Route path="/app/integrations/shopify" element={<ShopifyOverview />} />
                    <Route path="/app/integrations/shopify/connect" element={<ShopifyConnect />} />
                    <Route path="/app/integrations/shopify/:storeId" element={<ShopifyStoreDetail />} />
                    <Route path="/app/integrations/shopify/:storeId/sync" element={<ShopifySyncCenter />} />
                    <Route path="/app/integrations/shopify/:storeId/webhooks" element={<ShopifyWebhooks />} />
                    <Route path="/app/integrations/shopify/:storeId/settings" element={<ShopifySettings />} />
                    <Route path="/app/integrations/shopify/:storeId/data" element={<ShopifyDataExplorer />} />
                    <Route path="/app/integrations/shopify/:storeId/recovery" element={<ShopifyCartRecovery />} />
                    <Route path="/app/integrations/shopify/:storeId/analytics" element={<ShopifyAnalytics />} />
                    <Route path="/app/integrations/shopify/:storeId/automations" element={<ShopifyAutomations />} />
                    <Route path="/app/integrations/:key" element={<IntegrationDetail />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/data-deletion" element={<DataDeletion />} />
                    <Route path="/acceptable-use" element={<AcceptableUse />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/app-access-instructions" element={<AppAccessInstructions />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/help/category/:category" element={<HelpCategory />} />
                    <Route path="/help/inbox" element={<InboxGuide />} />
                    <Route path="/help/templates" element={<TemplatesGuide />} />
                    <Route path="/help/automation" element={<AutomationGuide />} />
                    <Route path="/help/contacts-tags" element={<ContactsTagsGuide />} />
                    <Route path="/help/meta-ads" element={<MetaAdsGuide />} />
                    <Route path="/help/workspaces" element={<WorkspacesGuide />} />
                    <Route path="/help/team" element={<TeamGuide />} />
                    <Route path="/help/campaigns" element={<CampaignsGuide />} />
                    <Route path="/help/form-rules" element={<FormRulesGuide />} />
                    <Route path="/help/phone-numbers" element={<PhoneNumbersGuide />} />
                    <Route path="/help/:slug" element={<GuideDetail />} />
                    <Route path="/control/guides" element={<GuideManager />} />
                    <Route path="/help/all" element={<HelpCenter />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/case-studies" element={<CaseStudies />} />
                    <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
                    <Route path="/template-library" element={<TemplateLibrary />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/docs" element={<DocsViewer />} />
                    <Route path="/api-docs" element={<Documentation />} />
                    <Route path="/guides" element={<Help />} />
                    <Route path="/webinars" element={<Blog />} />
                    <Route path="/changelog" element={<Blog />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/press" element={<About />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/features/inbox" element={<InboxFeature />} />
                    <Route path="/features/contacts" element={<ContactsFeature />} />
                    <Route path="/features/templates" element={<TemplatesFeature />} />
                    <Route path="/features/campaigns" element={<CampaignsFeature />} />
                    <Route path="/features/automation" element={<AutomationFeature />} />
                    <Route path="/features/integrations" element={<IntegrationsFeature />} />
                    <Route path="/features/analytics" element={<AnalyticsFeature />} />
                    <Route path="/features/phone-numbers" element={<PhoneNumbersFeature />} />
                    <Route path="/features/team-roles" element={<TeamRolesFeature />} />
                    <Route path="/features/audit-logs" element={<AuditLogsFeature />} />
                    <Route path="/whatsapp-forms" element={<WhatsAppForms />} />
                    <Route path="/whatsapp-business-api" element={<WhatsAppBusinessApi />} />
                    <Route path="/click-to-whatsapp" element={<ClickToWhatsApp />} />
                    <Route path="/why-whatsapp-marketing" element={<WhyWhatsAppMarketing />} />
                    <Route path="/why-aireatro" element={<WhyAireatro />} />
                    <Route path="/free-whatsapp-api-lifetime" element={<FreeWhatsAppApiLifetime />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/developer/seo" element={<SeoDashboard />} />
                    <Route path="/control" element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="workspaces" element={<AdminWorkspaces />} />
                      <Route path="workspaces/:id" element={<AdminWorkspaceDetail />} />
                      <Route path="billing" element={<AdminBilling />} />
                      <Route path="phone-numbers" element={<AdminPhoneNumbers />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="team" element={<AdminTeam />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="incidents" element={<AdminIncidents />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ThemeProvider>
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
