import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { TransactionType } from "@/components/TransactionType";
import { TransactionTypes } from "@/utils/TransactionTypes";
import { useTransactionDatabase } from "@/database/useTransactionDatabase";

export default function Transaction() {
  const params = useLocalSearchParams<{ id: string }>();
  const transactionDatabase = useTransactionDatabase();
  const [isCreating, setIsCreating] = useState(false);
  const [amount, setAmount] = useState<number | null>(0);
  const [observation, setObservation] = useState("");
  const [type, setType] = useState(TransactionTypes.INPUT);

  async function handleCreate() {
    try {
      if (amount <= 0) {
        return Alert.alert("Atenção", "Preencha os valores.");
      }
      setIsCreating(true);
      await transactionDatabase.create({
        target_id: Number(params.id),
        amount: type === TransactionTypes.OUTPUT ? amount * -1 : amount,
        observation: observation,
      });
      Alert.alert("Sucesso!", "Transação salva com sucesso.", [
        { text: "Ok", onPress: router.back },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar a transação");
      setIsCreating(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <TransactionType selected={type} onChange={setType} />
        <CurrencyInput
          label="Valor (R$)"
          value={amount}
          onChangeValue={setAmount}
        />
        <Input
          label="Motivo (opcional)"
          placeholder="Ex: Investir em CDB de 110% no banco XPTO"
          value={observation}
          onChangeText={setObservation}
        />
        <Button
          title="Salvar"
          onPress={handleCreate}
          isProcessing={isCreating}
        />
      </View>
    </View>
  );
}
