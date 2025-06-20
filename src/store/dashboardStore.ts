import { create } from 'zustand'
import dayjs, { Dayjs } from 'dayjs'

export interface AdAccount {
  id: string
  name: string
  meta_ad_account_id: string
  currency?: string
}

export interface DashboardMetrics {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  conversions: number
}

export interface Campaign {
  key: string
  name: string
  status: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  conversions: number
}

export interface ChartDataPoint {
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
}

interface DashboardState {
  selectedAccount: AdAccount | null
  adAccounts: AdAccount[]
  dateRange: [Dayjs, Dayjs]
  metrics: DashboardMetrics | null
  campaigns: Campaign[]
  chartData: ChartDataPoint[]
  loading: boolean
  
  setSelectedAccount: (account: AdAccount | null) => void
  setAdAccounts: (accounts: AdAccount[]) => void
  setDateRange: (range: [Dayjs, Dayjs]) => void
  setMetrics: (metrics: DashboardMetrics | null) => void
  setCampaigns: (campaigns: Campaign[]) => void
  setChartData: (data: ChartDataPoint[]) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedAccount: null,
  adAccounts: [],
  dateRange: [dayjs().subtract(7, 'day'), dayjs()],
  metrics: null,
  campaigns: [],
  chartData: [],
  loading: false,
  
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setAdAccounts: (accounts) => set({ adAccounts: accounts }),
  setDateRange: (range) => set({ dateRange: range }),
  setMetrics: (metrics) => set({ metrics }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setChartData: (data) => set({ chartData: data }),
  setLoading: (loading) => set({ loading })
}))