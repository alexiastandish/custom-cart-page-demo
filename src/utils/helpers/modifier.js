function restrictToBoundingRect(transform, rect, boundingRect, margins) {
    const value = {
        ...transform,
    }

    const marginY = margins.y || 0
    const marginX = margins.x || 0

    if (rect.top + value.y <= boundingRect.top + marginY) {
        value.y = boundingRect.top - rect.top + marginY
    } else if (
        rect.bottom + value.y >=
        boundingRect.top + boundingRect.height - marginY
    ) {
        value.y = boundingRect.top + boundingRect.height - rect.bottom - marginY
    }

    if (rect.left + value.x <= boundingRect.left - marginX) {
        value.x = boundingRect.left - rect.left + marginX
    } else if (
        rect.right + value.x >=
        boundingRect.left + boundingRect.width + marginX
    ) {
        value.x = boundingRect.left + boundingRect.width - rect.right + marginX
    }

    return value
}

export const restrictToParentElementWithMargins =
    (margins) =>
    ({ containerNodeRect, draggingNodeRect, transform }) => {
        if (!draggingNodeRect || !containerNodeRect) {
            return transform
        }

        return restrictToBoundingRect(
            transform,
            draggingNodeRect,
            containerNodeRect,
            margins
        )
    }
