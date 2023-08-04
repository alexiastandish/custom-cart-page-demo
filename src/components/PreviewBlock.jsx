import React from 'react'
import { getRenderer } from '../utils/helpers/get-renderer'

export default function PreviewBlock(props) {
    const { field, overlay, handleRemoveBlock, ...rest } = props
    const { type } = field

    const Component = getRenderer(type)

    let className = 'canvas-field'
    if (overlay) {
        className += ' overlay'
    }

    return (
        <div className={className}>
            <Component {...rest} />
        </div>
    )
}
