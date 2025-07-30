import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import {
  getCardData,
  getCardDropTargetData,
  isCardData,
  isDraggingACard,
  type TCard,
} from "./../types/data";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import IconButton from "./common/IconButton";
import { Checkbox } from "./common/Checkbox";

type TCardState = "idle" | "is-dragging" | "is-over";

const innerStyles: { [Key in TCardState]: string } = {
  idle: "task-card card-hover cursor-grab",
  "is-dragging": "opacity-40 transform rotate-2",
  "is-over": "ring-2 ring-blue-500 ring-offset-2",
};

interface TaskCardProps {
  card: TCard;
  columnId: string;
  searchTerm?: string;
  onToggleComplete?: (cardId: string) => void;
  onToggleSelect?: (cardId: string) => void;
  onEdit?: (cardId: string, newText: string) => void;
  onDelete?: (cardId: string) => void;
}

/*
 * Card component.
 * Renders a single task card with drag-and-drop, edit, complete, select, and delete logic.
 */
export function Card({
  card,
  columnId,
  searchTerm = "",
  onToggleComplete,
  onToggleSelect,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  /**
   * Local state for card UI (edit mode, drag state).
   */
  const [state, setState] = useState<TCardState>("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(card.description);

  /**
   * useEffect for drag-and-drop setup.
   */
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    invariant(outer && inner);

    return combine(
      draggable({
        element: inner,
        getInitialData: ({ element }) => {
          const data = getCardData({
            card,
            columnId,
            rect: element.getBoundingClientRect(),
          });
          return data;
        },
        onDragStart() {
          setState("is-dragging");
        },
        onDrop() {
          setState("idle");
        },
      }),
      dropTargetForElements({
        element: outer,
        canDrop: isDraggingACard,
        getData: ({ input, element }) => {
          const data = getCardDropTargetData({ card, columnId });
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        onDragEnter({ source }) {
          
          if (isCardData(source.data) && source.data.card.id !== card.id) {
            setState("is-over");
          }
        },
        onDragLeave() {
          setState("idle");
        },
        onDrop() {
          setState("idle");
        },
      })
    );
  }, [card, columnId]);

  /**
   * Handler to toggle completion status.
   */
  const handleToggleComplete = () => {
    onToggleComplete?.(card.id);
  };

  /**
   * Handler to toggle selection status.
   */
  const handleToggleSelect = () => {
    onToggleSelect?.(card.id);
  };

  /**
   * Handler to start editing card description.
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * Handler to save edited card description.
   */
  const handleSaveEdit = () => {
    if (editText.trim() && editText !== card.description) {
      onEdit?.(card.id, editText.trim());
    }
    setIsEditing(false);
  };

  /**
   * Handler to cancel editing card description.
   */
  const handleCancelEdit = () => {
    setEditText(card.description);
    setIsEditing(false);
  };

  /**
   * Handler to delete this card.
   */
  const handleDelete = () => {
    onDelete?.(card.id);
  };

  /**
   * Highlights search term in card description.
   */
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={outerRef} className="flex flex-shrink-0 flex-col px-2 py-1">
      <div
        ref={innerRef}
        className={`p-4 ${innerStyles[state]} ${
          card.completed ? "completed-task" : ""
        } ${card.selected ? "selected-task" : ""}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Checkbox
              checked={card.selected}
              onChange={handleToggleSelect}
              color="blue"
            />

            <Checkbox
              checked={card.completed}
              onChange={handleToggleComplete}
              color="green"
            />

            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="w-full pl-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-white text-base"
                autoFocus
              />
            ) : (
              <div
                className="flex-1 min-w-0 cursor-pointer text-gray-800 font-medium"
                onDoubleClick={handleEdit}
              >
                {highlightSearchTerm(card.description, searchTerm)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<EditIcon />}
              onClick={handleEdit}
              title="Edit"
              variant="warning"
            />

            <IconButton
              icon={<DeleteIcon />}
              onClick={handleDelete}
              title="Delete"
              variant="danger"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
