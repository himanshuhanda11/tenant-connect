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
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import InviteAccept from "./pages/InviteAccept";
import SignupPage from "./pages/onboarding/SignupPage";
import OrganizationPage from "./pages/onboarding/OrganizationPage";
import PasswordPage from "./pages/onboarding/PasswordPage";
import AuthCallback from "./pages/AuthCallback";
import CreateWorkspace from "./pages/CreateWorkspace";
import SelectWorkspace from "./pages/SelectWorkspace";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import TeamOverview from "./pages/team/TeamOverview";
import TeamMembers from "./pages/team/TeamMembers";
import TeamRoles from "./pages/team/TeamRoles";
import TeamGroups from "./pages/team/TeamGroups";
import TeamRouting from "./pages/team/TeamRouting";
import TeamSLA from "./pages/team/TeamSLA";
import TeamAudit from "./pages/team/TeamAudit";
import Settings from "./pages/Settings";
import InboxPage from "./pages/InboxPage";
import InboxCRMDashboard from "./pages/inbox/InboxCRMDashboard";
import Contacts from "./pages/Contacts";
import ContactSegments from "./pages/ContactSegments";
import ContactImports from "./pages/ContactImports";
import ContactDuplicates from "./pages/ContactDuplicates";
import ContactDataRequests from "./pages/ContactDataRequests";
import Tags from "./pages/Tags";
import UserAttributes from "./pages/UserAttributes";
import PhoneNumbers from "./pages/PhoneNumbers";
import PhoneNumbersList from "./pages/phone-numbers/PhoneNumbersList";
import ConnectNumber from "./pages/phone-numbers/ConnectNumber";
import PhoneNumberDetails from "./pages/phone-numbers/PhoneNumberDetails";
import Templates from "./pages/Templates";
import CampaignsList from "./pages/campaigns/CampaignsList";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import CampaignDetails from "./pages/campaigns/CampaignDetails";
import CampaignLibrary from "./pages/campaigns/CampaignLibrary";
import AutomationWorkflows from "./pages/AutomationWorkflows";
import AutoFormRules from "./pages/AutoFormRules";
import AutoFormsList from "./pages/auto-forms/AutoFormsList";
import AutoFormBuilder from "./pages/auto-forms/AutoFormBuilder";
import AutoFormRulesPage from "./pages/auto-forms/AutoFormRulesPage";
import AutoFormSubmissions from "./pages/auto-forms/AutoFormSubmissions";
import FlowsHub from "./pages/flows/FlowsHub";
import FlowBuilder from "./pages/flows/FlowBuilder";
import Billing from "./pages/Billing";
import WorkspaceAddOns from "./pages/WorkspaceAddOns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AppAccessInstructions from "./pages/AppAccessInstructions";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import Help from "./pages/Help";
import HelpCenter from "./pages/help/HelpCenter";
import HelpCategory from "./pages/help/HelpCategory";
import GuideDetail from "./pages/help/GuideDetail";
import InboxGuide from "./pages/help/InboxGuide";
import TemplatesGuide from "./pages/help/TemplatesGuide";
import AutomationGuide from "./pages/help/AutomationGuide";
import ContactsTagsGuide from "./pages/help/ContactsTagsGuide";
import MetaAdsGuide from "./pages/help/MetaAdsGuide";
import WorkspacesGuide from "./pages/help/WorkspacesGuide";
import TeamGuide from "./pages/help/TeamGuide";
import CampaignsGuide from "./pages/help/CampaignsGuide";
import FormRulesGuide from "./pages/help/FormRulesGuide";
import PhoneNumbersGuide from "./pages/help/PhoneNumbersGuide";
import { GuideManager } from "./components/admin/GuideManager";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Careers from "./pages/Careers";
import Integrations from "./pages/Integrations";
import IntegrationsHub from "./pages/IntegrationsHub";
import IntegrationDetail from "./pages/IntegrationDetail";
import Security from "./pages/Security";
import DataDeletion from "./pages/DataDeletion";
import AcceptableUse from "./pages/AcceptableUse";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Compliance from "./pages/Compliance";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import TemplateLibrary from "./pages/TemplateLibrary";
import Documentation from "./pages/Documentation";
import InboxFeature from "./pages/features/InboxFeature";
import ContactsFeature from "./pages/features/ContactsFeature";
import TemplatesFeature from "./pages/features/TemplatesFeature";
import CampaignsFeature from "./pages/features/CampaignsFeature";
import AutomationFeature from "./pages/features/AutomationFeature";
import IntegrationsFeature from "./pages/features/IntegrationsFeature";
import AnalyticsFeature from "./pages/features/AnalyticsFeature";
import PhoneNumbersFeature from "./pages/features/PhoneNumbersFeature";
import TeamRolesFeature from "./pages/features/TeamRolesFeature";
import AuditLogsFeature from "./pages/features/AuditLogsFeature";
import Partners from "./pages/Partners";
import Features from "./pages/Features";
import WhatsAppForms from "./pages/WhatsAppForms";
import WhatsAppBusinessApi from "./pages/WhatsAppBusinessApi";
import ClickToWhatsApp from "./pages/ClickToWhatsApp";
import WhyWhatsAppMarketing from "./pages/WhyWhatsAppMarketing";
import FreeWhatsAppApiLifetime from "./pages/FreeWhatsAppApiLifetime";
import DocsViewer from "./pages/DocsViewer";
import NotFound from "./pages/NotFound";
import MetaAdsOverview from "./pages/meta-ads/MetaAdsOverview";
import MetaAdsSetup from "./pages/meta-ads/MetaAdsSetup";
import MetaAdsManager from "./pages/meta-ads/MetaAdsManager";
import MetaAdsAnalytics from "./pages/meta-ads/MetaAdsAnalytics";
import MetaAdsAttribution from "./pages/meta-ads/MetaAdsAttribution";
import MetaAdsAutomations from "./pages/meta-ads/MetaAdsAutomations";
import MetaAdsSettings from "./pages/meta-ads/MetaAdsSettings";
import CreateMetaCampaign from "./pages/meta-ads/CreateMetaCampaign";
import LeadFormsPage from "./pages/LeadFormsPage";
import Install from "./pages/Install";
import ShopifyOverview from "./pages/shopify/ShopifyOverview";
import ShopifyConnect from "./pages/shopify/ShopifyConnect";
import ShopifyStoreDetail from "./pages/shopify/ShopifyStoreDetail";
import ShopifySyncCenter from "./pages/shopify/ShopifySyncCenter";
import ShopifyWebhooks from "./pages/shopify/ShopifyWebhooks";
import ShopifySettings from "./pages/shopify/ShopifySettings";
import ShopifyDataExplorer from "./pages/shopify/ShopifyDataExplorer";
import ShopifyCartRecovery from "./pages/shopify/ShopifyCartRecovery";
import ShopifyAnalytics from "./pages/shopify/ShopifyAnalytics";
import ShopifyAutomations from "./pages/shopify/ShopifyAutomations";
import SeoDashboard from "./pages/developer/SeoDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminWorkspaces from "./pages/admin/AdminWorkspaces";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminWorkspaceDetail from "./pages/admin/AdminWorkspaceDetail";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminPhoneNumbers from "./pages/admin/AdminPhoneNumbers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminIncidents from "./pages/admin/AdminIncidents";
import QualifiedLeads from "./pages/QualifiedLeads";

const queryClient = new QueryClient();

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
              <Routes>
              <Route path="/" element={<Index />} />
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
              <Route path="/inbox/new-today" element={<InboxPage />} />
              <Route path="/inbox/followup-today" element={<InboxPage />} />
              <Route path="/inbox/overdue" element={<InboxPage />} />
              <Route path="/inbox/converted" element={<InboxPage />} />
              <Route path="/inbox/junk" element={<InboxPage />} />
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
              <Route path="/meta-ads" element={<MetaAdsOverview />} />
              <Route path="/meta-ads/setup" element={<MetaAdsSetup />} />
              <Route path="/lead-forms" element={<LeadFormsPage />} />
              <Route path="/meta-ads/manager" element={<MetaAdsManager />} />
              <Route path="/meta-ads/analytics" element={<MetaAdsAnalytics />} />
              <Route path="/meta-ads/attribution" element={<MetaAdsAttribution />} />
              <Route path="/meta-ads/automations" element={<MetaAdsAutomations />} />
              <Route path="/meta-ads/settings" element={<MetaAdsSettings />} />
              <Route path="/meta-ads/create" element={<CreateMetaCampaign />} />
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
          </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
