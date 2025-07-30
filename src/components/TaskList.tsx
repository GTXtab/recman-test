import {
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import { Column } from './common/Column';
import {
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  type TBoard,
  type TFilter,
} from '../types/data';

interface BoardProps {
  initial: TBoard;
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
 * Board component.
 * Manages columns and drag-and-drop logic for columns and cards.
 */
export function Board({
  initial,
  searchTerm = "",
  filter = 'all',
  onAddCard,
  onDeleteColumn,
  onEditColumn,
  onToggleComplete,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete
}: BoardProps) {
  /**
   * Local state for board data (columns/cards).
   * Synced with initial prop.
   */
  const [data, setData] = useState(initial);
  /**
   * Ref for the scrollable board container.
   */
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { setData(initial); }, [initial]);
  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);

    return combine(
      monitorForElements({
        canMonitor: isDraggingACard,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isCardData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;
          const homeColumnIndex = data.columns.findIndex(
            (column) => column.id === dragging.columnId,
          );
          const home = data.columns[homeColumnIndex];

          if (!home) {
            return;
          }
          const cardIndexInHome = home.cards.findIndex((card) => card.id === dragging.card.id);

          if (isCardDropTargetData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.columnId,
            );
            const destination = data.columns[destinationColumnIndex];
            if (home === destination) {
              const cardFinishIndex = home.cards.findIndex(
                (card) => card.id === dropTargetData.card.id,
              );


              const closestEdge = extractClosestEdge(dropTargetData);
              
              const reordered = reorderWithEdge({
                axis: 'vertical',
                list: home.cards,
                startIndex: cardIndexInHome,
                indexOfTarget: cardFinishIndex,
                closestEdgeOfTarget: closestEdge,
              });

              const updated = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              const newData = { 
                columns: columns.map(col => ({ ...col }))
              };
              setData(newData);
              return;
            }

            const indexOfTarget = destination.cards.findIndex(
              (card) => card.id === dropTargetData.card.id,
            );

            const closestEdge = extractClosestEdge(dropTargetData);
            const finalIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;
            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(finalIndex, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });
            return;
          }

          if (isColumnData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.column.id,
            );
            const destination = data.columns[destinationColumnIndex];

            if (!destination) {
              return;
            }

            if (home === destination) {
              const reordered = reorder({
                list: home.cards,
                startIndex: cardIndexInHome,
                finishIndex: home.cards.length - 1,
              });

              const updated = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              setData({ ...data, columns });
              return;
            }


            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(destination.cards.length, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });
            return;
          }
        },
      }),
      monitorForElements({
        canMonitor: isDraggingAColumn,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isColumnData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;

          if (!isColumnData(dropTargetData)) {
            return;
          }

          const homeIndex = data.columns.findIndex((column) => column.id === dragging.column.id);
          const destinationIndex = data.columns.findIndex(
            (column) => column.id === dropTargetData.column.id,
          );

          if (homeIndex === -1 || destinationIndex === -1) {
            return;
          }

          if (homeIndex === destinationIndex) {
            return;
          }

          const reordered = reorder({
            list: data.columns,
            startIndex: homeIndex,
            finishIndex: destinationIndex,
          });
          setData({ ...data, columns: reordered });
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: "fast" }),
        element,
      }),
    );
  }, [data]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollableRef}
        className="flex h-full flex-row gap-6 overflow-x-auto p-2"
      >
        {data.columns.map((column) => (
          <Column 
            key={column.id} 
            column={column}
            searchTerm={searchTerm}
            filter={filter}
            onAddCard={onAddCard}
            onDeleteColumn={onDeleteColumn}
            onEditColumn={onEditColumn}
            onToggleComplete={onToggleComplete}
            onToggleSelect={onToggleSelect}
            onSelectAll={onSelectAll}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
