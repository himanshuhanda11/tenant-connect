import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import InviteAccept from "./pages/InviteAccept";
import SignupPage from "./pages/onboarding/SignupPage";
import OrganizationPage from "./pages/onboarding/OrganizationPage";
import PasswordPage from "./pages/onboarding/PasswordPage";
import AuthCallback from "./pages/AuthCallback";
import CreateWorkspace from "./pages/CreateWorkspace";
import SelectWorkspace from "./pages/SelectWorkspace";
import NotFound from "./pages/NotFound";
import { RequirePermission } from "@/components/auth/RequirePermission";
import {
  META_ADS_ATTRIBUTION_PERMISSIONS,
  META_ADS_AUTOMATION_PERMISSIONS,
  META_ADS_CONNECT_PERMISSIONS,
  META_ADS_VIEW_PERMISSIONS,
} from "@/hooks/useCurrentRolePermissions";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const InboxPage = lazy(() => import("./pages/InboxPage"));
const InboxCRMDashboard = lazy(() => import("./pages/inbox/InboxCRMDashboard"));
const Contacts = lazy(() => import("./pages/Contacts"));
const ContactSegments = lazy(() => import("./pages/ContactSegments"));
const ContactImports = lazy(() => import("./pages/ContactImports"));
const ContactDuplicates = lazy(() => import("./pages/ContactDuplicates"));
const ContactDataRequests = lazy(() => import("./pages/ContactDataRequests"));
const Tags = lazy(() => import("./pages/Tags"));
const UserAttributes = lazy(() => import("./pages/UserAttributes"));
const PhoneNumbers = lazy(() => import("./pages/PhoneNumbers"));
const PhoneNumbersList = lazy(() => import("./pages/phone-numbers/PhoneNumbersList"));
const ConnectNumber = lazy(() => import("./pages/phone-numbers/ConnectNumber"));
const PhoneNumberDetails = lazy(() => import("./pages/phone-numbers/PhoneNumberDetails"));
const Templates = lazy(() => import("./pages/Templates"));
const CampaignsList = lazy(() => import("./pages/campaigns/CampaignsList"));
const CreateCampaign = lazy(() => import("./pages/campaigns/CreateCampaign"));
const CampaignDetails = lazy(() => import("./pages/campaigns/CampaignDetails"));
const CampaignLibrary = lazy(() => import("./pages/campaigns/CampaignLibrary"));
const AutomationWorkflows = lazy(() => import("./pages/AutomationWorkflows"));
const AutoFormRules = lazy(() => import("./pages/AutoFormRules"));
const AutoFormsList = lazy(() => import("./pages/auto-forms/AutoFormsList"));
const AutoFormBuilder = lazy(() => import("./pages/auto-forms/AutoFormBuilder"));
const AutoFormRulesPage = lazy(() => import("./pages/auto-forms/AutoFormRulesPage"));
const AutoFormSubmissions = lazy(() => import("./pages/auto-forms/AutoFormSubmissions"));
const FlowsHub = lazy(() => import("./pages/flows/FlowsHub"));
const FlowBuilder = lazy(() => import("./pages/flows/FlowBuilder"));
const Billing = lazy(() => import("./pages/Billing"));
const WorkspaceAddOns = lazy(() => import("./pages/WorkspaceAddOns"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const AppAccessInstructions = lazy(() => import("./pages/AppAccessInstructions"));
const Products = lazy(() => import("./pages/Products"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Help = lazy(() => import("./pages/Help"));
const HelpCenter = lazy(() => import("./pages/help/HelpCenter"));
const HelpCategory = lazy(() => import("./pages/help/HelpCategory"));
const GuideDetail = lazy(() => import("./pages/help/GuideDetail"));
const InboxGuide = lazy(() => import("./pages/help/InboxGuide"));
const TemplatesGuide = lazy(() => import("./pages/help/TemplatesGuide"));
const AutomationGuide = lazy(() => import("./pages/help/AutomationGuide"));
const ContactsTagsGuide = lazy(() => import("./pages/help/ContactsTagsGuide"));
const MetaAdsGuide = lazy(() => import("./pages/help/MetaAdsGuide"));
const WorkspacesGuide = lazy(() => import("./pages/help/WorkspacesGuide"));
const TeamGuide = lazy(() => import("./pages/help/TeamGuide"));
const CampaignsGuide = lazy(() => import("./pages/help/CampaignsGuide"));
const FormRulesGuide = lazy(() => import("./pages/help/FormRulesGuide"));
const PhoneNumbersGuide = lazy(() => import("./pages/help/PhoneNumbersGuide"));
const GuideManager = lazy(() =>
  import("./components/admin/GuideManager").then((module) => ({ default: module.GuideManager }))
);
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Careers = lazy(() => import("./pages/Careers"));
const Integrations = lazy(() => import("./pages/Integrations"));
const IntegrationsHub = lazy(() => import("./pages/IntegrationsHub"));
const IntegrationDetail = lazy(() => import("./pages/IntegrationDetail"));
const Security = lazy(() => import("./pages/Security"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const AcceptableUse = lazy(() => import("./pages/AcceptableUse"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Compliance = lazy(() => import("./pages/Compliance"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));
const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"));
const Documentation = lazy(() => import("./pages/Documentation"));
const InboxFeature = lazy(() => import("./pages/features/InboxFeature"));
const ContactsFeature = lazy(() => import("./pages/features/ContactsFeature"));
const TemplatesFeature = lazy(() => import("./pages/features/TemplatesFeature"));
const CampaignsFeature = lazy(() => import("./pages/features/CampaignsFeature"));
const AutomationFeature = lazy(() => import("./pages/features/AutomationFeature"));
const IntegrationsFeature = lazy(() => import("./pages/features/IntegrationsFeature"));
const AnalyticsFeature = lazy(() => import("./pages/features/AnalyticsFeature"));
const PhoneNumbersFeature = lazy(() => import("./pages/features/PhoneNumbersFeature"));
const TeamRolesFeature = lazy(() => import("./pages/features/TeamRolesFeature"));
const AuditLogsFeature = lazy(() => import("./pages/features/AuditLogsFeature"));
const Partners = lazy(() => import("./pages/Partners"));
const Features = lazy(() => import("./pages/Features"));
const WhatsAppForms = lazy(() => import("./pages/WhatsAppForms"));
const WhatsAppBusinessApi = lazy(() => import("./pages/WhatsAppBusinessApi"));
const ClickToWhatsApp = lazy(() => import("./pages/ClickToWhatsApp"));
const WhyWhatsAppMarketing = lazy(() => import("./pages/WhyWhatsAppMarketing"));
const FreeWhatsAppApiLifetime = lazy(() => import("./pages/FreeWhatsAppApiLifetime"));
const DocsViewer = lazy(() => import("./pages/DocsViewer"));
const WhyAireatro = lazy(() => import("./pages/WhyAireatro"));
const MetaAdsOverview = lazy(() => import("./pages/meta-ads/MetaAdsOverview"));
const MetaAdsSetup = lazy(() => import("./pages/meta-ads/MetaAdsSetup"));
const MetaAdsManager = lazy(() => import("./pages/meta-ads/MetaAdsManager"));
const MetaAdsAnalytics = lazy(() => import("./pages/meta-ads/MetaAdsAnalytics"));
const MetaAdsAttribution = lazy(() => import("./pages/meta-ads/MetaAdsAttribution"));
const MetaAdsAutomations = lazy(() => import("./pages/meta-ads/MetaAdsAutomations"));
const MetaAdsSettings = lazy(() => import("./pages/meta-ads/MetaAdsSettings"));
const CreateMetaCampaign = lazy(() => import("./pages/meta-ads/CreateMetaCampaign"));
const LeadFormsPage = lazy(() => import("./pages/LeadFormsPage"));
const Install = lazy(() => import("./pages/Install"));
const ShopifyOverview = lazy(() => import("./pages/shopify/ShopifyOverview"));
const ShopifyConnect = lazy(() => import("./pages/shopify/ShopifyConnect"));
const ShopifyStoreDetail = lazy(() => import("./pages/shopify/ShopifyStoreDetail"));
const ShopifySyncCenter = lazy(() => import("./pages/shopify/ShopifySyncCenter"));
const ShopifyWebhooks = lazy(() => import("./pages/shopify/ShopifyWebhooks"));
const ShopifySettings = lazy(() => import("./pages/shopify/ShopifySettings"));
const ShopifyDataExplorer = lazy(() => import("./pages/shopify/ShopifyDataExplorer"));
const ShopifyCartRecovery = lazy(() => import("./pages/shopify/ShopifyCartRecovery"));
const ShopifyAnalytics = lazy(() => import("./pages/shopify/ShopifyAnalytics"));
const ShopifyAutomations = lazy(() => import("./pages/shopify/ShopifyAutomations"));
const SeoDashboard = lazy(() => import("./pages/developer/SeoDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminWorkspaces = lazy(() => import("./pages/admin/AdminWorkspaces"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminWorkspaceDetail = lazy(() => import("./pages/admin/AdminWorkspaceDetail"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminPhoneNumbers = lazy(() => import("./pages/admin/AdminPhoneNumbers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminIncidents = lazy(() => import("./pages/admin/AdminIncidents"));
const QualifiedLeads = lazy(() => import("./pages/QualifiedLeads"));
const TeamOverview = lazy(() => import("./pages/team/TeamOverview"));
const TeamMembers = lazy(() => import("./pages/team/TeamMembers"));
const TeamRoles = lazy(() => import("./pages/team/TeamRoles"));
const TeamGroups = lazy(() => import("./pages/team/TeamGroups"));
const TeamRouting = lazy(() => import("./pages/team/TeamRouting"));
const TeamSLA = lazy(() => import("./pages/team/TeamSLA"));
const TeamAudit = lazy(() => import("./pages/team/TeamAudit"));

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
        <Toaster />
        <Sonner />
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
