import { supabase } from "../supabase";
import type { Store } from "../types/store";

export const storeService = {
  // 모든 상점 가져오기
  async fetchStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from("stores")
      .select("*");

    if (error) throw error; // 에러가 나면 호출한 곳으로 던짐
    return data as Store[];
  },

  // 새로운 상점 제보하기
  async reportStore(newStore: Partial<Store>) {
    const { data, error } = await supabase
      .from("stores")
      .insert([newStore]);

    if (error) throw error;
    return data;
  },

  // 상점 삭제하기
  async deleteStore(storeId: string) {
    const { error } = await supabase
      .from("stores")
      .delete()
      .eq("id", storeId);

    if (error) throw error;
  }
};