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
  },

  async fetchReviews(storeId: string) {
    const { data, error } = await supabase
      .from("store_reviews")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async addReview(reviewData: any) {
    const { data, error } = await supabase
      .from("store_reviews")
      .insert([reviewData]);

    if (error) throw error;
    return data;
  },

  // 리뷰 삭제
  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from("store_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;
  },

  async fetchStoresInBounds(sw: any, ne: any): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .gte("lat", sw.lat)
    .lte("lat", ne.lat)
    .gte("lng", sw.lng)
    .lte("lng", ne.lng());

  if (error) throw error;
  return data as Store[];
}
};