export interface AdminUser {
  id: string; name: string; email: string; phone?: string | null; platformRole?: 'super_admin' | 'support' | null;
  emailVerified: boolean; isActive: boolean; lastLoginAt?: string | null; createdAt: string;
  businesses?: { id: string; name?: string; slug?: string; role: string }[];
}
export interface AdminBusiness {
  id: string; name: string; slug: string; category: string; owner?: { name: string; email: string } | null;
  published: boolean; suspended: boolean; subscription?: AdminSubscription | null;
  products: number; sales: number; revenueKobo: number; createdAt: string;
}
export interface AdminSubscription {
  planKey: string; status: string; trialEndsAt?: string | null; currentPeriodEnd?: string | null;
  billingInterval?: string; milestoneReachedAt?: string | null; adminNote?: string | null;
}
export interface Entitlements {
  productLimit: number | null; staffSeats: number; customDomain: boolean; advancedReports: boolean;
  csvExport: boolean; pdfExport: boolean; embedWidget: boolean; whatsappBot: boolean; templates: string[];
  receiptBranding: boolean; prioritySupport: boolean;
}
export interface AdminPlan {
  id: string; key: string; name: string; description: string; priceMonthlyKobo: number; priceYearlyKobo: number;
  entitlements: Entitlements; trialDays: number; isDefault: boolean; isTrialPlan: boolean; isActive: boolean;
  trialMilestoneOrders?: number; paystackPlanCodeMonthly?: string | null; paystackPlanCodeYearly?: string | null;
  marketingFeatures: string[]; subscriptions: number;
}
export interface AdminPayment {
  id: string; reference: string; businessId: string; purpose: string; amountKobo: number; status: string;
  email?: string | null; paidAt?: string | null; createdAt: string; channel?: string | null;
  business?: { name: string; slug: string } | null;
}
export interface AdminAuditLog {
  id: string; businessId?: string | null; actorId?: string | null; actorType: string; action: string;
  entity?: string | null; entityId?: string | null; metadata: Record<string, unknown>; createdAt: string;
}
export interface AdminDashboard {
  metrics: {
    users: number; verifiedUsers: number; newUsers: number; businesses: number; published: number;
    suspended: number; newBusinesses: number; activeSubscriptions: number; trials: number; mrrKobo: number;
    revenue30Kobo: number; payments30: number; trialExpiring: number; failedWebhooks: number;
  };
  planDistribution: { planKey: string; count: number }[];
  growth: { date: string; users: number; businesses: number; revenueKobo: number }[];
  topBusinesses: { businessId: string; name: string; slug: string; revenueKobo: number; sales: number }[];
  whatsapp: AdminWhatsappHealth;
  recentAudit: AdminAuditLog[];
  integrations: Record<string, boolean>;
  affiliate?: { affiliates: number; referrals: number; conversions: number; totalEarnedKobo: number; pendingKobo: number; availableKobo: number; paidKobo: number; pendingPayouts: number };
}
export interface AdminWhatsappHealth {
  configured?: boolean; phoneNumberId?: string | null; webhookUrl?: string; last24h: { inbound: number; outbound: number; failed: number; skipped: number };
  linkedNumbers: number; lastInboundAt?: string | null; lastOutboundAt?: string | null;
  counts?: { _id: { direction: string; status: string }; count: number }[];
  recentFailures?: { id: string; phone: string; error?: string | null; createdAt: string }[];
  templates?: string[];
}
export interface Paginated<T> { items: T[]; meta: { total: number; page: number; limit: number; pages: number; [key: string]: unknown }; }

export interface AdminAffiliatePayout {
  id: string; businessId: string; amountKobo: number; status: 'requested' | 'paid' | 'rejected';
  bankName: string; accountName: string; accountNumber: string; note?: string | null;
  reference?: string | null; processedAt?: string | null; createdAt: string;
  business?: { name: string; slug: string } | null;
}
export interface AdminAffiliateStats {
  metrics: { affiliates: number; referrals: number; conversions: number; totalEarnedKobo: number; pendingKobo: number; availableKobo: number; paidKobo: number; pendingPayouts: number };
  topAffiliates: { businessId: string; name: string; slug: string; code: string; referrals: number; conversions: number; earnedKobo: number; availableKobo: number }[];
}
export interface AdminNote {
  id: string; targetType: 'user' | 'business'; targetId: string; authorId: string; authorName: string;
  body: string; pinned: boolean; createdAt: string; updatedAt?: string;
}
