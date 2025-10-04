import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";
import { List } from "@/components/List";
import { Transaction, TransactionProps } from "@/components/Transaction";
import { TransactionTypes } from "@/utils/TransactionTypes";
import { Button } from "@/components/Button";
import { useTargetDatabase } from "@/database/useTargetDatabase";
import { Loading } from "@/components/Loading";
import { numberToCurrency } from "@/utils/numberToCurrency";
import { useTransactionDatabase } from "@/database/useTransactionDatabase";

export default function InProgress() {
  const params = useLocalSearchParams<{ id: string }>();
  const targetDatabase = useTargetDatabase();
  const transactionDatabase = useTransactionDatabase();
  const [isFetching, setIsFetching] = useState(true);
  const [details, setDetails] = useState({
    name: "",
    current: "",
    target: "",
    percentage: 0,
  });
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);

  async function fetchDetails() {
    try {
      const response = await targetDatabase.getTargetById(Number(params.id));
      setDetails({
        name: response.name,
        current: numberToCurrency(response.current),
        target: numberToCurrency(response.amount),
        percentage: response.percentage,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  }

  async function fetchTransactions() {
    try {
      const response = await transactionDatabase.listByTargetId(
        Number(params.id)
      );
      setTransactions(
        response.map((item) => ({
          id: String(item.id),
          value: numberToCurrency(item.amount),
          date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
          description: item.observation,
          type:
            item.amount > 0 ? TransactionTypes.INPUT : TransactionTypes.OUTPUT,
        }))
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar as transações.");
    }
  }

  async function fetchData() {
    const fetchDetailsPromise = fetchDetails();
    const fetchTransactionsPromise = fetchTransactions();
    await Promise.all([fetchDetailsPromise, fetchTransactionsPromise]);
    setIsFetching(false);
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (isFetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <PageHeader
        title={details.name}
        righButton={{
          icon: "edit",
          onPress: () => {
            router.navigate(`/target?id=${params.id}`);
          },
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction data={item} onRemove={() => {}} />
        )}
        emptyMessage="Nenhuma transação. Toque em nova transação para guardar seu primeiro dinheiro aqui."
      />

      <Button
        title="Nova transação"
        onPress={() => {
          router.navigate(`/transaction/${params.id}`);
        }}
      />
    </View>
  );
}
