import { useSQLiteContext } from "expo-sqlite";

export type TargetCreate = {
  name: string;
  amount: number;
};

export type TargetResponse = {
  id: number;
  name: string;
  amount: number;
  current: number;
  percentage: number;
  created_at: Date;
  updated_at: Date;
};

export type TargetUpdate = TargetCreate & {
  id: number;
};

export function useTargetDatabase() {
  const database = useSQLiteContext();

  async function create(data: TargetCreate) {
    const statement = await database.prepareAsync(
      "INSERT INTO targets (name, amount) VALUES ($name, $amount)"
    );
    statement.executeAsync({
      $name: data.name,
      $amount: data.amount,
    });
  }

  async function listByAmount() {
    return database.getAllAsync<TargetResponse>(`
      SELECT
        targets.id,
        targets.name,
        targets.amount,
        targets.created_at,
        targets.updated_at,
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM(transactions.amount) / targets.amount) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      GROUP BY targets.id, targets.name, targets.amount
      ORDER BY current DESC;
    `);
  }

  async function getTargetById(id: number) {
    return database.getFirstAsync<TargetResponse>(`
      SELECT
        targets.id,
        targets.name,
        targets.amount,
        targets.created_at,
        targets.updated_at,
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM(transactions.amount) / targets.amount) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      WHERE targets.id = ${id}
    `);
  }

  async function updateTarget(data: TargetUpdate) {
    const statement = await database.prepareAsync(`
      UPDATE targets SET
        name = $name,
        amount = $amount,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $id;
    `);
    statement.executeAsync({
      $id: data.id,
      $name: data.name,
      $amount: data.amount,
    });
  }

  return {
    create,
    listByAmount,
    getTargetById,
    updateTarget,
  };
}
