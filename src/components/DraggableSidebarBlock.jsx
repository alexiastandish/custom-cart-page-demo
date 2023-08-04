import { useDraggable } from '@dnd-kit/core'
import { nanoid } from 'nanoid'
import React, { useRef } from 'react'
import SidebarBlock from './SidebarBlock'

export default function DraggableSidebarBlock(props) {
    const { field, ...rest } = props

    const id = useRef(nanoid())

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: id.current,
        data: {
            field, //
            fromSidebar: true,
        },
    })
    return (
        <div
            ref={setNodeRef}
            className="sidebar-block"
            {...listeners}
            {...attributes}
        >
            <SidebarBlock field={field} {...rest} />
        </div>
    )
}
