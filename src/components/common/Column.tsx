import {
  dropTargetForElements,
  draggable,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { Card } from "../../components/TaskCard";
import {
  getColumnData,
  isCardData,
  isCardDropTargetData,
  isDraggingACard,
  isDraggingAColumn,
  isColumnData,
  type TColumn,
  type TFilter,
} from "../../types/data";
import SelectAllIcon from "../icons/SelectAllIcon";
import DeleteIcon from "../icons/DeleteIcon";
import { Button } from "./Button";

type TColumnState =
  | { type: "is-card-over"; isOverChildCard: boolean; dragging: DOMRect }
  | { type: "is-column-over" }
  | { type: "idle" }
  | { type: "is-dragging" };

const idle = { type: "idle" } as const;

const stateStyles: { [Key in TColumnState["type"]]: string } = {
  idle: "cursor-grab",
  "is-card-over": "ring-2 ring-blue-500 ring-offset-2",
  "is-dragging": "opacity-40 transform rotate-1",
  "is-column-over": "bg-blue-50",
};

interface ColumnProps {
  column: TColumn;
  searchTerm?: string;
  filter?: TFilter;
  onAddCard?: (columnId: string, description: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditColumn?: (columnId: string, newTitle: string) => void;
  onToggleComplete?: (cardId: string) => void;
  onToggleSelect?: (cardId: string) => void;
  onSelectAll?: (columnId: string) => void;
  onEdit?: (cardId: string, newText: string) => void;
  onDelete?: (cardId: string) => void;
}

/*
 * Column component.
 * Renders a single column with its cards, add/edit/delete logic, and drag-and-drop.
 */
export function Column({
  column,
  searchTerm = "",
  filter = "all",
  onAddCard,
  onDeleteColumn,
  onEditColumn,
  onToggleComplete,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
}: ColumnProps) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Local state for column UI (title editing, add card input, drag state).
   */
  const [state, setState] = useState<TColumnState>(idle);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const filteredCards = column.cards.filter((card) => {
    if (filter === "completed" && !card.completed) return false;
    if (filter === "incomplete" && card.completed) return false;

    if (
      searchTerm &&
      !card.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  /**
   * useEffect for drag-and-drop setup.
   */
  useEffect(() => {
    const outer = outerRef.current;
    const scrollable = scrollableRef.current;
    const header = headerRef.current;
    const inner = innerRef.current;
    invariant(outer);
    invariant(scrollable);
    invariant(header);
    invariant(inner);

    const data = getColumnData({ column });

    function setIsCardOver({
      data,
      location,
    }: {
      data: { rect: DOMRect };
      location: {
        current: {
          dropTargets: Array<{ data: Record<string | symbol, unknown> }>;
        };
      };
    }) {
      const innerMost = location.current.dropTargets[0];
      const isOverChildCard = Boolean(
        innerMost && isCardDropTargetData(innerMost.data)
      );

      const proposed: TColumnState = {
        type: "is-card-over",
        dragging: data.rect,
        isOverChildCard,
      };
      setState(proposed);
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => data,
        onDragStart() {
          setState({ type: "is-dragging" });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element: outer,
        getData: () => data,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
            return;
          }
          if (
            isColumnData(source.data) &&
            source.data.column.id !== column.id
          ) {
            setState({ type: "is-column-over" });
          }
        },
        onDragLeave({ source }) {
          if (
            isColumnData(source.data) &&
            source.data.column.id === column.id
          ) {
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          return isDraggingACard({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: "fast" }),
        element: scrollable,
      })
    );
  }, [column]);

  /**
   * Handler to add a card to this column.
   */
  const handleAddCard = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onAddCard?.(column.id, trimmed);
    setTitle("");
  };

  /**
   * Handler to start editing column title.
   */
  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  /**
   * Handler to save edited column title.
   */
  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onEditColumn?.(column.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  /**
   * Handler to cancel editing column title.
   */
  const handleCancelTitle = () => {
    setEditTitle(column.title);
    setIsEditingTitle(false);
  };

  /**
   * Handler to select all cards in this column.
   */
  const handleSelectAll = () => {
    onSelectAll?.(column.id);
  };

  /**
   * Handler to delete this column.
   */
  const handleDeleteColumn = () => {
    onDeleteColumn?.(column.id);
  };

  return (
    <div
      className="flex w-80 flex-shrink-0 select-none flex-col"
      ref={outerRef}
    >
      <div
        className={`column-card ${stateStyles[state.type]} ${
          state.type === "is-column-over" ? "opacity-50" : ""
        }`}
        ref={innerRef}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex flex-row items-center justify-between p-4 pb-3 border-b border-gray-200"
            ref={headerRef}
          >
            <div className="flex items-center gap-3 flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelTitle();
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-white text-base"
                  autoFocus
                  placeholder="Edit column title..."
                />
              ) : (
                <div
                  className="font-bold text-lg text-gray-800 cursor-pointer flex-1"
                  onDoubleClick={handleEditTitle}
                >
                  {column.title}
                </div>
              )}
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredCards.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSelectAll}
                variant="default"
                title="Select all"
              >
                <SelectAllIcon />
              </Button>

              <Button
                onClick={handleDeleteColumn}
                variant="danger"
                title="Delete column"
              >
                <DeleteIcon />
              </Button>
            </div>
          </div>
          <div
            className="flex flex-col overflow-y-auto max-h-96 [overflow-anchor:none] [scrollbar-color:theme(colors.gray.300)_theme(colors.gray.100)] [scrollbar-width:thin]"
            ref={scrollableRef}
          >
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                columnId={column.id}
                searchTerm={searchTerm}
                onToggleComplete={onToggleComplete}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {state.type === "is-card-over" && !state.isOverChildCard ? (
              <div className="flex-shrink-0 px-4 py-2">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-500 bg-blue-50">
                  Drop here
                </div>
              </div>
            ) : null}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-row gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCard();
                }}
                placeholder="Add a task..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-white text-base"
              />
              <button
                onClick={handleAddCard}
                className="btn-primary text-sm px-4 py-2"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
