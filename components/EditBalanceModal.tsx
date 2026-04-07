import dayjs, { Dayjs } from "dayjs";
import { styled } from "nativewind";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledPressable = styled(Pressable);

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { balance: number; renewalDate: string }) => void;
  initialBalance?: number;
  initialRenewalDate?: string | Dayjs;
};

const EditBalanceModal = ({
  visible,
  onClose,
  onSubmit,
  initialBalance = 0,
  initialRenewalDate,
}: Props) => {
  const [balance, setBalance] = useState<string>("0");
  const [renewalDate, setRenewalDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );

  useEffect(() => {
    if (visible) {
      setBalance(String(initialBalance ?? 0));
      const date = initialRenewalDate
        ? dayjs(initialRenewalDate)
        : dayjs().add(7, "day");
      setRenewalDate(date.format("YYYY-MM-DD"));
    }
  }, [visible, initialBalance, initialRenewalDate]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <StyledView className="flex-1 bg-black/40 justify-end">
        <StyledView className="bg-background rounded-t-3xl p-5">
          {/* Header */}
          <StyledView className="flex-row justify-between items-center mb-4">
            <StyledText className="text-lg font-sans-semibold text-foreground">
              Edit Balance
            </StyledText>
            <StyledPressable onPress={onClose}>
              <StyledText className="text-sm text-muted-foreground">
                Cancel
              </StyledText>
            </StyledPressable>
          </StyledView>

          {/* Balance Input */}
          <StyledView className="mb-4">
            <StyledText className="text-sm text-muted-foreground mb-2">
              Balance
            </StyledText>
            <StyledInput
              value={balance}
              onChangeText={setBalance}
              keyboardType="numeric"
              placeholder="Enter amount"
              className="border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor="#888"
            />
          </StyledView>

          {/* Date Input */}
          <StyledView className="mb-6">
            <StyledText className="text-sm text-muted-foreground mb-2">
              Next Renewal Date
            </StyledText>
            <StyledInput
              value={renewalDate}
              onChangeText={setRenewalDate}
              placeholder="YYYY-MM-DD"
              className="border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor="#888"
            />
          </StyledView>

          {/* Actions */}
          <StyledPressable
            onPress={() => {
              onSubmit({
                balance: Number(balance) || 0,
                renewalDate,
              });
              onClose();
            }}
            className="bg-primary rounded-xl py-3 items-center"
          >
            <StyledText className="text-primary-foreground font-sans-semibold">
              Save
            </StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default EditBalanceModal;
