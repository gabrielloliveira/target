import { useSQLiteContext } from "expo-sqlite";

export type TransactionCreate = {
  target_id: number;
  amount: number;
  observation?: string;
};

export type TransactionResponse = {
  id: number;
  target_id: number;
  created_at: Date;
  updated_at: Date;
  amount: number;
  observation?: string;
};

export function useTransactionDatabase() {
  const database = useSQLiteContext();

  async function create(data: TransactionCreate) {
    const statement = await database.prepareAsync(`
        INSERT INTO transactions (target_id, amount, observation)
        VALUES ($target_id, $amount, $observation);
      `);
    statement.executeAsync({
      $target_id: data.target_id,
      $amount: data.amount,
      $observation: data.observation,
    });
  }

  function listByTargetId(target_id: number) {
    return database.getAllAsync<TransactionResponse>(
      `SELECT * FROM transactions where target_id = ? ORDER BY created_at DESC;`,
      target_id
    );
  }

  async function deleteById(id: number){
    await database.runAsync("DELETE FROM transactions WHERE id = ?", id);
  }

  return {
    create,
    listByTargetId,
    deleteById,
  };
}
