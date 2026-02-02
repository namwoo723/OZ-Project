export const getTier = (activityCount: number) => {
  if (activityCount >= 50) return { name: "챌린저 붕어", color: "#F0E68C" };
  if (activityCount >= 20) return { name: "골드 붕어", color: "#FFD700" };
  if (activityCount >= 10) return { name: "실버 붕어", color: "#C0C0C0" };
  return { name: "브론즈 붕어", color: "#CD7F32" };
};