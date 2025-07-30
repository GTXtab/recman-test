export interface Task {
  id: string;
  title: string;
  completed: boolean;
  selected: boolean;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface AppData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}
