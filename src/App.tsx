import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateWorkspace from "./pages/CreateWorkspace";
import SelectWorkspace from "./pages/SelectWorkspace";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import Contacts from "./pages/Contacts";
import Tags from "./pages/Tags";
import UserAttributes from "./pages/UserAttributes";
import PhoneNumbers from "./pages/PhoneNumbers";
import Templates from "./pages/Templates";
import Campaigns from "./pages/Campaigns";
import AutomationWorkflows from "./pages/AutomationWorkflows";
import Billing from "./pages/Billing";
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
import { GuideManager } from "./components/admin/GuideManager";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Integrations from "./pages/Integrations";
import Security from "./pages/Security";
import DataDeletion from "./pages/DataDeletion";
import AcceptableUse from "./pages/AcceptableUse";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Compliance from "./pages/Compliance";
import CaseStudies from "./pages/CaseStudies";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-workspace" element={<CreateWorkspace />} />
              <Route path="/select-workspace" element={<SelectWorkspace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/user-attributes" element={<UserAttributes />} />
              <Route path="/phone-numbers" element={<PhoneNumbers />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/automation" element={<AutomationWorkflows />} />
              <Route path="/team" element={<Team />} />
              <Route path="/billing" element={<Billing />} />
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
              <Route path="/help/:slug" element={<GuideDetail />} />
              <Route path="/admin/guides" element={<GuideManager />} />
              <Route path="/help/all" element={<HelpCenter />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/security" element={<Security />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/template-library" element={<TemplateLibrary />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/api-docs" element={<Documentation />} />
              <Route path="/guides" element={<Help />} />
              <Route path="/webinars" element={<Blog />} />
              <Route path="/changelog" element={<Blog />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/press" element={<About />} />
              <Route path="/cookies" element={<CookiePolicy />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
