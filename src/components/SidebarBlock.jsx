import React from 'react'

export default function SidebarBlock(props) {
    const { field, overlay } = props
    const { title } = field

    let className = 'sidebar-block'
    if (overlay) {
        className += ' overlay'
    }
    return <div className={className}>asdf{title}</div>
}
