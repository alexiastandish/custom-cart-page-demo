import React from 'react'
import blocks from '../utils/constants/blocks.json'
import DraggableSidebarBlock from './DraggableSidebarBlock'

export default function Sidebar({ fieldsRegKey }) {
    return (
        <div key={fieldsRegKey} className="sidebar">
            {blocks.map((f) => {
                return <DraggableSidebarBlock key={f.type} field={f} />
            })}
        </div>
    )
}
