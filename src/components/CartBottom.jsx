import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import SortableBlock from './SortableBlock'
import { CSS } from '@dnd-kit/utilities'

export default function CartBottom({
    bottomFields,
    handleRemoveBlock,
    hideButton,
}) {
    const { listeners, setNodeRef, transform, attributes, transition } =
        useDroppable({
            id: 'cart-bottom',
            data: {
                isContainer: true,
            },
            // disabled: bottomFields.length > 0,
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
            className="preview-section preview-section-bottom"
        >
            {bottomFields.map((bottomField, index) => {
                return (
                    <SortableBlock
                        hideButton={hideButton}
                        handleRemoveBlock={handleRemoveBlock}
                        parent="cart-bottom"
                        key={bottomField.id}
                        id={bottomField.id}
                        index={index}
                        field={bottomField}
                    />
                )
            })}
        </div>
    )
}
