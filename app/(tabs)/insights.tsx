import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchable = styled(TouchableOpacity);

const Insights = () => {
  const posthog = usePostHog();
  const { subscriptions, fetchData } = useSubscriptionStore();

  const categoryBreakdown: Record<string, number> = {};

  subscriptions.forEach((sub) => {
    const key = sub.category || "Other";
    categoryBreakdown[key] = (categoryBreakdown[key] || 0) + sub.price;
  });

  const monthlySpending = subscriptions.reduce((acc, sub) => {
    if (sub.frequency === "Monthly") return acc + sub.price;
    if (sub.frequency === "Yearly") return acc + sub.price / 12;
    return acc;
  }, 0);

  const { user } = useUser();

  useEffect(() => {
    if (user?.id) fetchData(user.id);
  }, [fetchData, user]);

  useEffect(() => {
    posthog.capture("insights_screen_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StyledScrollView className="px-5 pt-4">
        {/* Header */}
        <StyledView className="flex-row items-center justify-between mb-6">
          <StyledText className="text-lg font-sans-bold text-foreground">
            Monthly Insights
          </StyledText>
          <StyledTouchable className="px-4 py-2 border border-border rounded-full">
            <StyledText className="text-sm text-foreground">•••</StyledText>
          </StyledTouchable>
        </StyledView>

        {/* Upcoming Section */}
        <StyledView className="flex-row items-center justify-between mb-3">
          <StyledText className="text-base font-sans-semibold text-foreground">
            Upcoming
          </StyledText>
          <StyledTouchable className="px-3 py-1 border border-border rounded-full">
            <StyledText className="text-xs text-muted-foreground">
              View all
            </StyledText>
          </StyledTouchable>
        </StyledView>

        {/* Chart Card */}
        <StyledView className="bg-[#E7D8B9] rounded-3xl p-4 mb-6">
          <StyledView className="flex-row justify-between items-end h-40">
            {["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"].map(
              (day, index) => {
                const isActive = index === 3;

                return (
                  <StyledView
                    key={day}
                    className="items-center justify-end flex-1"
                  >
                    <StyledView
                      style={{ height: Math.min(monthlySpending / 10, 140) }}
                      className={`w-3 rounded-full ${
                        isActive ? "bg-orange-500" : "bg-black"
                      }`}
                    />
                    <StyledText className="text-xs mt-2 text-muted-foreground">
                      {day}
                    </StyledText>
                  </StyledView>
                );
              },
            )}
          </StyledView>
        </StyledView>

        {/* Expenses Card */}
        <StyledView className="border border-border rounded-2xl p-4 mb-6">
          <StyledView className="flex-row justify-between items-center">
            <StyledView>
              <StyledText className="text-base font-sans-semibold text-foreground">
                Expenses
              </StyledText>
              <StyledText className="text-sm text-muted-foreground">
                March 2026
              </StyledText>
            </StyledView>

            <StyledView className="items-end">
              <StyledText className="text-lg font-sans-bold text-foreground">
                ₹{monthlySpending.toFixed(2)}
              </StyledText>
              <StyledText className="text-sm text-green-500">+12%</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* History Section */}
        <StyledView className="flex-row items-center justify-between mb-3">
          <StyledText className="text-base font-sans-semibold text-foreground">
            History
          </StyledText>
          <StyledTouchable className="px-3 py-1 border border-border rounded-full">
            <StyledText className="text-xs text-muted-foreground">
              View all
            </StyledText>
          </StyledTouchable>
        </StyledView>

        {subscriptions
          .slice()
          .sort(
            (a, b) =>
              new Date(b.renewalDate ?? "").getTime() -
              new Date(a.renewalDate ?? "").getTime(),
          )
          .map((item) => (
            <SubscriptionCard
              key={item.id}
              name={item.name}
              price={item.price}
              currency={item.currency}
              icon={item.icon}
              billing={item.billing}
              color={item.color}
              category={item.category}
              plan={item.plan}
              renewalDate={item.renewalDate}
              paymentMethod={item.paymentMethod}
              startDate={item.startDate}
              status={item.status}
              expanded={false}
              onPress={() => {}}
            />
          ))}
        <StyledView className="pb-30" />
      </StyledScrollView>
    </SafeAreaView>
  );
};

export default Insights;
