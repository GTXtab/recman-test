import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { loadData, saveData } from "./useStorage";
import type { AppData, Task } from "../types/task";

const DEFAULT_DATA: AppData = {
  tasks: {},
  columns: {
    "column-1": {
      id: "column-1",
      title: "Tasks",
      taskIds: [],
    },
  },
  columnOrder: ["column-1"],
};

export function useTasks() {
  const [data, setData] = useState<AppData>(loadData() || DEFAULT_DATA);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTask = (columnId: string, title: string) => {
    const id = uuidv4();
    const newTask: Task = { id, title, completed: false, selected: false };

    setData((prev) => {
      const updated = {
        ...prev,
        tasks: { ...prev.tasks, [id]: newTask },
        columns: {
          ...prev.columns,
          [columnId]: {
            ...prev.columns[columnId],
            taskIds: [...prev.columns[columnId].taskIds, id],
          },
        },
      };
      return updated;
    });
  };

  const removeTask = (taskId: string, columnId: string) => {
    setData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [taskId]: _, ...newTasks } = prev.tasks;
      const newTaskIds = prev.columns[columnId].taskIds.filter(
        (id) => id !== taskId
      );
      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [columnId]: { ...prev.columns[columnId], taskIds: newTaskIds },
        },
      };
    });
  };

  const toggleComplete = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          completed: !prev.tasks[taskId].completed,
        },
      },
    }));
  };

  const moveTask = (taskId: string, from: string, to: string, targetIndex?: number) => {
    if (from === to && targetIndex !== undefined) {
      setData((prev) => {
        const ids = [...prev.columns[from].taskIds];
        const oldIndex = ids.indexOf(taskId);
        if (oldIndex === -1 || oldIndex === targetIndex) return prev;
        ids.splice(oldIndex, 1);
        ids.splice(targetIndex, 0, taskId);
        return {
          ...prev,
          columns: {
            ...prev.columns,
            [from]: { ...prev.columns[from], taskIds: ids },
          },
        };
      });
      return;
    }

    setData((prev) => {
      const fromIds = prev.columns[from].taskIds.filter((id) => id !== taskId);
      let toIds = [...prev.columns[to].taskIds];
      if (targetIndex !== undefined) {
        toIds.splice(targetIndex, 0, taskId);
      } else {
        toIds = [...toIds, taskId];
      }
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [from]: { ...prev.columns[from], taskIds: fromIds },
          [to]: { ...prev.columns[to], taskIds: toIds },
        },
      };
    });
  };

  const moveColumn = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setData((prev) => {
      const ids = [...prev.columnOrder];
      const fromIdx = ids.indexOf(fromId);
      const toIdx = ids.indexOf(toId);
      ids.splice(fromIdx, 1);
      ids.splice(toIdx, 0, fromId);
      return { ...prev, columnOrder: ids };
    });
  };

  return { data, addTask, removeTask, toggleComplete, moveTask, moveColumn };
}
