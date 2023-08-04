import { useSortable } from '@dnd-kit/sortable'
import React from 'react'
import { CSS } from '@dnd-kit/utilities'
import PreviewBlock from './PreviewBlock'

export default function SortableBlock(props) {
    const { index, id, field, parent, handleRemoveBlock, hideButton } = props

    const {
        attributes,
        listeners,
        transform,
        transition,
        setNodeRef,
        isDragging,
    } = useSortable({
        id,
        data: { index, id, field, parent },
    })

    const style = {
        transform: field.type !== 'spacer' && CSS.Transform.toString(transform),
        transition,
        border: '1px solid red',
        height: 50,
    }

    return (
        <>
            {!isDragging && !hideButton && (
                <button
                    type="button"
                    onClick={(e) => handleRemoveBlock(parent, id)}
                >
                    remove
                </button>
            )}
            <div {...attributes} {...listeners} ref={setNodeRef} style={style}>
                <PreviewBlock
                    field={field}
                    handleRemoveBlock={handleRemoveBlock}
                />
            </div>
        </>
    )
}
