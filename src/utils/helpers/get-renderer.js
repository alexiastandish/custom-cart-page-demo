import { renderers } from './renderers'

export const getRenderer = (type) => {
    if (type === 'spacer') {
        return () => {
            return <div className="spacer">spacer</div>
        }
    }
    return renderers[type]
}
