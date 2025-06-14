import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
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

      const hoverBoundingRect = ref.current.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveLayer(dragIndex, hoverIndex);

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
        zIndex: 1000 - index,
      }}
      onClick={() => onSelectLayer(layer.id)}
      className={`${selectedLayerId === layer.id ? "selectedLayer" : ""}`}
    >
      {children}
    </div>
  );
};

export default DraggableLayer;
