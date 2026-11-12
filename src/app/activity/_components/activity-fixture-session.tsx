"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ActivityRow } from "../_lib/activity-view";

type FixtureSession = {
  rows: readonly ActivityRow[];
  lastEnteredDates: Readonly<Record<string, ActivityRow["date"]>>;
  save: (entry: Omit<ActivityRow, "id">, id?: string) => void;
  remove: (id: string) => void;
};

const ActivityFixtureSession = createContext<FixtureSession | null>(null);

export function useActivityFixtureSession() {
  const session = useContext(ActivityFixtureSession);
  if (!session) throw new Error("Missing activity fixture session");
  return session;
}

export function ActivityFixtureSessionProvider({
  initialRows,
  children,
}: {
  initialRows: readonly ActivityRow[];
  children: ReactNode;
}) {
  const [rows, setRows] = useState(initialRows);
  const [lastEnteredDates, setLastEnteredDates] = useState<
    FixtureSession["lastEnteredDates"]
  >({});
  const sequence = useRef(0);

  function save(entry: Omit<ActivityRow, "id">, id?: string) {
    if (id) {
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...entry, id } : row)),
      );
      return;
    }

    const row = { ...entry, id: `session-${++sequence.current}` };
    setRows((current) => [...current, row]);
    setLastEnteredDates((current) => ({
      ...current,
      [entry.date.slice(0, 7)]: entry.date,
    }));
  }

  function remove(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <ActivityFixtureSession value={{ rows, lastEnteredDates, save, remove }}>
      {children}
    </ActivityFixtureSession>
  );
}
