import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import SortableBlock from './SortableBlock'
import { CSS } from '@dnd-kit/utilities'

export default function CartTop({ topFields, handleRemoveBlock, hideButton }) {
    const { listeners, setNodeRef, transform, attributes, transition } =
        useDroppable({
            id: 'cart-top',
            data: {
                isContainer: true,
            },
            // disabled: topFields.length > 0,
        })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="preview-section preview-section-top"
        >
            {topFields.map((topField, index) => {
                return (
                    <SortableBlock
                        handleRemoveBlock={handleRemoveBlock}
                        parent="cart-top"
                        key={topField.id}
                        id={topField.id}
                        index={index}
                        field={topField}
                        hideButton={hideButton}
                    />
                )
            })}
        </div>
    )
}
