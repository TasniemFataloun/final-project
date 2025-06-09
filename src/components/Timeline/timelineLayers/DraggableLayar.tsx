import React, { useRef } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { XYCoord } from "react-dnd";

const ItemTypes = {
  LAYER: "layer",
};

type DraggableLayerProps = {
  layer: any; // your layer type
  index: number;
  moveLayer: (dragIndex: number, hoverIndex: number) => void;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  children: React.ReactNode;
};

const DraggableLayer: React.FC<DraggableLayerProps> = ({
  layer,
  index,
  moveLayer,
  selectedLayerId,
  onSelectLayer,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<{ index: number }>({
    accept: ItemTypes.LAYER,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only move when mouse has crossed half of the item's height
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Perform the move
      moveLayer(dragIndex, hoverIndex);

      // Update the dragged item's index to avoid redundant moves
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.LAYER,
    item: () => ({ id: layer.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        zIndex: 1000 - index, // higher layers on top
      }}
      onClick={() => onSelectLayer(layer.id)}
      className={`${selectedLayerId === layer.id ? "selectedLayer" : ""}`}
    >
      {children}
    </div>
  );
};

export default DraggableLayer;