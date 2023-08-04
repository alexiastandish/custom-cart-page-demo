import React from 'react'
import CartBottom from './CartBottom'
import CartTop from './CartTop'

export default function CartPreview({ topFields, bottomFields }) {
    return (
        <div className="preview" style={{ width: 250 }}>
            <CartTop topFields={topFields} />
            <div style={{ height: 200 }}>Cart preview static section</div>
            <CartBottom bottomFields={bottomFields} />
        </div>
    )
}
