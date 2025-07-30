import { useEffect, useState } from "react";
import type { TBoard, TCard, TColumn, TFilter } from "../types/data";
import { toast } from "react-toastify";

function getInitialData(): TBoard {
  // Doing this so we get consistent ids on server and client
  const getCards = (() => {
    let count: number = 0;

    return function getCards({ amount }: { amount: number }): TCard[] {
      return Array.from({ length: amount }, (): TCard => {
        const id = count++;
        return {
          id: `card:${id}`,
          description: `Card ${id}`,
          completed: false,
          selected: false,
        };
      });
    };
  })();

  const columns: TColumn[] = [
    { id: "column:a", title: "Monday", cards: getCards({ amount: 4 }) },
    { id: "column:b", title: "Tuesday", cards: getCards({ amount: 8 }) },
  ];

  return {
    columns,
  };
}

export const useBoard = () => {
  const [data, setData] = useState<TBoard>(getInitialData());
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<TFilter>("all");

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("todo-app-data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("todo-app-data", JSON.stringify(data));
  }, [data]);

  /**
   * Handler to add a new column to the board.
   * Shows a toast notification on success.
   */
  const handleAddColumn = () => {
    const newColumn: TColumn = {
      id: `column:${Date.now()}`,
      title: "New column",
      cards: [],
    };

    setData((prevData) => ({
      ...prevData,
      columns: [...prevData.columns, newColumn],
    }));
    toast.success("Column added!");
  };

  /**
   * Handler to add a new card to a column.
   * @param columnId - ID of the column
   * @param description - Card description
   */
  const handleAddCard = (columnId: string, description: string) => {
    const newCard: TCard = {
      id: `card:${Date.now()}`,
      description,
      completed: false,
      selected: false,
    };

    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) =>
        column.id === columnId
          ? { ...column, cards: [...column.cards, newCard] }
          : column
      ),
    }));
  };

  /**
   * Handler to edit a card's description.
   * @param cardId - Card ID
   * @param newText - New description
   */
  const handleEdit = (cardId: string, newText: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? { ...card, description: newText } : card
        ),
      })),
    }));
  };

  /**
   * Handler to delete a card by ID.
   * @param cardId - Card ID
   */
  const handleDelete = (cardId: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    }));
  };

  /**
   * Handler to toggle card completion status.
   * @param cardId - Card ID
   */
  const handleToggleComplete = (cardId: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? { ...card, completed: !card.completed } : card
        ),
      })),
    }));
  };

  /**
   * Handler to toggle card selection status.
   * @param cardId - Card ID
   */
  const handleToggleSelect = (cardId: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? { ...card, selected: !card.selected } : card
        ),
      })),
    }));
  };

  /**
   * Handler to select all cards in a column.
   * @param columnId - Column ID
   */
  const handleSelectAll = (columnId: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: column.cards.map((card) => ({ ...card, selected: true })),
            }
          : column
      ),
    }));
  };

  /**
   * Handler to delete a column by ID.
   * @param columnId - Column ID
   */
  const handleDeleteColumn = (columnId: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.filter((column) => column.id !== columnId),
    }));
  };
  /**
   * Handler to edit a column's title.
   * @param columnId - Column ID
   * @param newTitle - New title
   */
  const handleEditColumn = (columnId: string, newTitle: string) => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) =>
        column.id === columnId ? { ...column, title: newTitle } : column
      ),
    }));
  };
  /**
   * Handler to delete all selected cards in all columns.
   */
  const handleDeleteSelected = () => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => !card.selected),
      })),
    }));
  };
  /**
   * Handler to mark all selected cards as completed.
   */
  const handleMarkSelectedComplete = () => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.selected ? { ...card, completed: true } : card
        ),
      })),
    }));
  };
  /**
   * Handler to mark all selected cards as uncompleted.
   */
  const handleMarkSelectedIncomplete = () => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.selected ? { ...card, completed: false } : card
        ),
      })),
    }));
  };
  /**
   * Handler to clear selection for all cards.
   */
  const handleClearSelection = () => {
    setData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => ({ ...card, selected: false })),
      })),
    }));
  };
  return {
    data,
    searchTerm,
    filter,
    setSearchTerm,
    setFilter,
    handleAddColumn,
    handleAddCard,
    handleEdit,
    handleDelete,
    handleToggleComplete,
    handleToggleSelect,
    handleSelectAll,
    handleDeleteColumn,
    handleEditColumn,
    handleDeleteSelected,
    handleMarkSelectedComplete,
    handleMarkSelectedIncomplete,
    handleClearSelection,
  };
};
