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
  // Update local data when initial prop changes
  useEffect(() => { setData(initial); }, [initial]);
  // Set up drag-and-drop monitors for cards and columns
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

          // dropping on a card
          if (isCardDropTargetData(dropTargetData)) {
            console.log('Dropping on card:', {
              draggingCard: dragging.card.id,
              targetCard: dropTargetData.card.id,
              homeColumn: home.id,
              targetColumn: dropTargetData.columnId
            });

            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.columnId,
            );
            const destination = data.columns[destinationColumnIndex];
            // reordering in home column
            if (home === destination) {
              console.log('Reordering within same column');
              const cardFinishIndex = home.cards.findIndex(
                (card) => card.id === dropTargetData.card.id,
              );

              // could not find cards needed
              if (cardIndexInHome === -1 || cardFinishIndex === -1) {
                console.log('Could not find cards:', { cardIndexInHome, cardFinishIndex });
                return;
              }

              // no change needed
              if (cardIndexInHome === cardFinishIndex) {
                console.log('No change needed');
                return;
              }

              const closestEdge = extractClosestEdge(dropTargetData);
              console.log('Closest edge:', closestEdge, 'Drop target data:', dropTargetData);
              console.log('Card positions:', {
                startIndex: cardIndexInHome,
                targetIndex: cardFinishIndex,
                cards: home.cards.map(c => c.id)
              });

              // Додаємо детальне логування для reorderWithEdge
              console.log('Before reorder:', home.cards.map(c => c.id));
              console.log('Drag operation:', {
                draggingCard: dragging.card.id,
                targetCard: dropTargetData.card.id,
                startIndex: cardIndexInHome,
                targetIndex: cardFinishIndex,
                closestEdge,
                operation: closestEdge === 'top' ? 'insert before' : 'insert after'
              });
              
              const reordered = reorderWithEdge({
                axis: 'vertical',
                list: home.cards,
                startIndex: cardIndexInHome,
                indexOfTarget: cardFinishIndex,
                closestEdgeOfTarget: closestEdge,
              });

              console.log('After reorder:', reordered.map(c => c.id));
              console.log('Expected behavior:', {
                startIndex: cardIndexInHome,
                targetIndex: cardFinishIndex,
                closestEdge,
                shouldMove: cardIndexInHome !== cardFinishIndex || closestEdge === 'bottom'
              });

              console.log('Reordered cards:', reordered.map(c => c.id));

              const updated = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              const newData = { 
                columns: columns.map(col => ({ ...col }))
              };
              console.log('Setting new data:', newData);
              setData(newData);
              console.log('Cards reordered successfully');
              return;
            }

            // moving card from one column to another
            console.log('Moving card between columns');

            // unable to find destination
            if (!destination) {
              console.log('Could not find destination column');
              return;
            }

            const indexOfTarget = destination.cards.findIndex(
              (card) => card.id === dropTargetData.card.id,
            );

            const closestEdge = extractClosestEdge(dropTargetData);
            const finalIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;
            console.log('Final index:', finalIndex);

            // remove card from home list
            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
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
            console.log('Card moved successfully');
            return;
          }

          // dropping onto a column, but not onto a card
          if (isColumnData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.column.id,
            );
            const destination = data.columns[destinationColumnIndex];

            if (!destination) {
              return;
            }

            // dropping on home
            if (home === destination) {
              console.log('moving card to home column');

              // move to last position
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

            console.log('moving card to another column');

            // remove card from home list

            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
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
