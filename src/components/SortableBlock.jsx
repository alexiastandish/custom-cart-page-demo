import { useSortable } from '@dnd-kit/sortable'
import React from 'react'
import { CSS } from '@dnd-kit/utilities'
import PreviewBlock from './PreviewBlock'

export default function SortableBlock(props) {
    const { index, id, field, parent } = props

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
        transform: CSS.Transform.toString(transform),
        // position: isDragging ? 'absolute' : 'relative',
        // transform:
        //     CSS.Translate.toString(transform) ===
        //     `translate3d(${transform?.x}, ${transform?.y}, 0)`,
        transition,
    }

    return (
        <div {...attributes} {...listeners} ref={setNodeRef} style={style}>
            <PreviewBlock field={field} />
        </div>
    )
}
