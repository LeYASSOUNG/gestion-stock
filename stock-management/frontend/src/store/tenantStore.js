import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTenantStore = create(
  persist(
    (set) => ({
      companyId: null,
      companyName: null,
      companyType: null,
      
      setTenant: (tenantData) => set({ 
        companyId: tenantData.companyId, 
        companyName: tenantData.companyName, 
        companyType: tenantData.companyType 
      }),
      
      clearTenant: () => set({ 
        companyId: null, 
        companyName: null, 
        companyType: null 
      }),
    }),
    {
      name: 'tenant-storage', // nom clé dans localStorage
    }
  )
);
