import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import EditBalanceModal from "@/components/EditBalanceModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();

  const userId = user?.id;

  const {
    subscriptions,
    addSubscription,
    balance,
    nextRenewalDate,
    fetchData,
    updateBalance,
  } = useSubscriptionStore();

  useEffect(() => {
    if (userId) fetchData(userId);
  }, [fetchData, userId]);

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);

  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");
    return subscriptions
      .filter(
        (sub) =>
          sub.status === "active" &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek),
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
      .map((sub) => ({
        ...sub,
        daysLeft: dayjs(sub.renewalDate).diff(now, "day"),
      }));
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );
    posthog.capture(
      isExpanding ? "subscription_expanded" : "subscription_collapsed",
      {
        subscription_name: item.name,
        subscription_id: item.id,
      },
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription, userId ?? "");
    posthog.capture("subscription_created", {
      subscription_name: newSubscription.name,
      subscription_price: newSubscription.price,
      subscription_frequency: newSubscription.frequency ?? "",
      subscription_category: newSubscription.category ?? "",
    });
  };

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setIsEditingBalance(true)}
              className="home-balance-card"
            >
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(balance || 0)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </Pressable>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No Upcoming Renewals Yet
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No Subscriptions Yet</Text>
        }
        contentContainerClassName="pb-30"
      />

      {isEditingBalance && (
        <EditBalanceModal
          visible={isEditingBalance}
          onClose={() => setIsEditingBalance(false)}
          initialBalance={balance}
          initialRenewalDate={nextRenewalDate ?? undefined}
          onSubmit={(data) => {
            updateBalance(
              { balance: data.balance, nextRenewalDate: data.renewalDate },
              userId ?? "",
            );
            setIsEditingBalance(false);
          }}
        />
      )}
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
