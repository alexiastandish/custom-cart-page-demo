import React from 'react'
import CartBottom from './CartBottom'
import CartTop from './CartTop'

export default function CartPreview({ topFields, bottomFields }) {
    return (
        <div className="preview">
            <CartTop topFields={topFields} />
            <div
                style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid gray',
                    width: '225px',
                    margin: '0 auto',
                }}
            >
                Cart preview static section
            </div>
            <CartBottom bottomFields={bottomFields} />
        </div>
    )
}
