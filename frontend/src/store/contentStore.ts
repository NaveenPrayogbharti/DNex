import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ContentState {
  content: Record<string, string>;
  isLoading: boolean;
  fetchContent: () => Promise<void>;
  getValue: (key: string, fallback: string) => string;
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: {},
  isLoading: true,
  fetchContent: async () => {
    try {
      const { data, error } = await supabase.from('admin_content').select('key, value');
      if (error) {
        console.error('Error fetching admin content:', error);
        set({ isLoading: false });
        return;
      }
      
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.key] = item.value;
      });
      
      // Save to localStorage as a fallback
      localStorage.setItem('dnex_admin_content', JSON.stringify(contentMap));
      
      set({ content: contentMap, isLoading: false });
    } catch (err) {
      console.error('Failed to load content:', err);
      // Try to load from localStorage fallback
      const cached = localStorage.getItem('dnex_admin_content');
      if (cached) {
        set({ content: JSON.parse(cached), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },
  getValue: (key: string, fallback: string) => {
    const { content } = get();
    return content[key] || fallback;
  }
}));
