import React from 'react'
import blocks from '../utils/constants/blocks.json'
import DraggableSidebarBlock from './DraggableSidebarBlock'

export default function Sidebar({ fieldsRegKey }) {
    return (
        <div key={fieldsRegKey} className="sidebar">
            {blocks.map((f) => {
                return (
                    // temporary block
                    // <div key={f.type}>{f.title}</div>
                    <DraggableSidebarBlock key={f.type} field={f} />
                )
            })}
        </div>
    )
}
