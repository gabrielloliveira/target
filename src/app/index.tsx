import { View, StatusBar, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { HomeHeader, HomeHeaderProps } from "@/components/HomeHeader";
import { Target, TargetProps } from "@/components/Target";
import { List } from "@/components/List";
import { Button } from "@/components/Button";
import { useTargetDatabase } from "@/database/useTargetDatabase";
import { useCallback, useState } from "react";
import { Loading } from "@/components/Loading";
import { numberToCurrency } from "@/utils/numberToCurrency";
import { useTransactionDatabase } from "@/database/useTransactionDatabase";

// const summary = {
//   total: "R$ 2.680,00",
//   input: { label: "Entradas", value: "R$ 6,184.90" },
//   output: { label: "Saídas", value: "-R$ 883.65" },
// };

export default function Index() {
  const [summary, setSummary] = useState<HomeHeaderProps>();
  const [isFetching, setIsFetching] = useState(true);
  const [targets, setTargets] = useState<TargetProps[]>([]);
  const targetDatabase = useTargetDatabase();
  const transactionsDatabase = useTransactionDatabase();

  async function fetchTargets(): Promise<TargetProps[]> {
    try {
      const response = await targetDatabase.listByAmount();
      return response.map((item) => ({
        id: String(item.id),
        name: item.name,
        current: numberToCurrency(item.current),
        target: numberToCurrency(item.amount),
        percentage: item.percentage.toFixed(0) + "%",
      }));
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar as metas.");
    }
  }

  async function fetchSummary(): Promise<HomeHeaderProps> {
    try {
      const response = await transactionsDatabase.summary();

      console.log(response);

      return {
        total: numberToCurrency(response.income + response.expense),
        input: { label: "Entradas", value: numberToCurrency(response.income) },
        output: { label: "Saídas", value: numberToCurrency(response.expense) },
      };
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar o resumo das suas metas.");
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargets();
    const summaryDataPromise = fetchSummary();
    const [targetData, summaryData] = await Promise.all([targetDataPromise, summaryDataPromise]);
    setTargets(targetData);
    setSummary(summaryData);
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
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />
      <List
        title="Metas"
        data={targets}
        renderItem={({ item }) => (
          <Target
            data={item}
            onPress={() => router.navigate(`/in-progress/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />
      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova meta" onPress={() => router.navigate("/target")} />
      </View>
    </View>
  );
}
