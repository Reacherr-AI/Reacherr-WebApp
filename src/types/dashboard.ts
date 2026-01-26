export interface CallOutcomeSummary {
  completed: number;
  missed: number;
  failed: number;
}

export interface RecentCall {
  customerNumber: string;
  duration: string;
  intent: string;
  sentiment?: string;
  aiSummary: string;
}

export interface DashboardAnalyticsDto {
  onGoingCalls: number;
  totalTimeOnCallToday: number;
  callOutcomeSummaryToday: CallOutcomeSummary;
  recentCalls: RecentCall[];
}


