import './App.css'
import { useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    rectIntersection,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import CartPreview from './components/CartPreview'
import { useImmer } from 'use-immer'
import {
    SortableContext,
    rectSwappingStrategy,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import {
    restrictToHorizontalAxis,
    restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import SidebarBlock from './components/SidebarBlock'
import PreviewBlock from './components/PreviewBlock'
import { createSpacer } from './utils/helpers/create-spacer'
import { getData } from './utils/helpers/get-data'

function App() {
    const [sidebarFieldsRegenKey, setSidebarFieldsRegenKey] = useState(
        Date.now()
    )
    const [activeSidebarBlock, setActiveSidebarBlock] = useState() // only for fields from the sidebar
    const [activePreviewBlock, setActivePreviewBlock] = useState() // only for fields from the sidebar

    const currentDragFieldRef = useRef()
    const spacerInsertedRef = useRef()

    // useImmer(initialState) is very similar to useState.
    // The function returns a tuple, the first value of the tuple is the current state,
    // the second is the updater function, which accepts an immer producer function or a value as argument

    const [data, updateData] = useImmer({
        topFields: [],
        bottomFields: [],
    })

    // console.log('currentDragFieldRef', currentDragFieldRef)
    // console.log('spacerInsertedRef', spacerInsertedRef)
    // console.log('activeSidebarBlock', activeSidebarBlock)
    // console.log('activePreviewBlock', activePreviewBlock)
    // console.log('data', data)
    const cleanUp = () => {
        console.log('CLEANING UP')
        setActiveSidebarBlock(null)
        setActivePreviewBlock(null)
        currentDragFieldRef.current = null
        spacerInsertedRef.current = false
    }

    const handleDragStart = (e) => {
        const { active } = e
        const activeData = getData(active)
        console.log('START: activeData', activeData)

        // This is where the cloning starts.
        // We set up a ref to the field we're dragging
        // from the sidebar so that we can finish the clone
        // in the onDragEnd handler.

        if (activeData.fromSidebar) {
            const { field } = activeData
            const { type } = field
            setActiveSidebarBlock(field)

            const allFieldsLength = [...data.topFields, ...data.bottomFields]
                .length

            currentDragFieldRef.current = {
                id: active.id,
                type,
                name: `${type}-${allFieldsLength + 1}`,
                parent: 'sidebar',
            }
            if (!spacerInsertedRef.current) {
                const spacerTop = createSpacer({
                    id: active.id + '-spacer-top',
                })
                const spacerBottom = createSpacer({
                    id: active.id + '-spacer-bottom',
                })

                updateData((draft) => {
                    if (!draft.topFields.length) {
                        draft.topFields.push(spacerTop)
                    }
                    if (!draft.bottomFields.length) {
                        draft.bottomFields.push(spacerBottom)
                    }
                    spacerInsertedRef.current = true
                })
            }

            return
        }
        // We aren't creating a new element so go ahead and just insert the spacer
        // since this field already belongs to the canvas.
        const { field, index } = activeData

        setActivePreviewBlock(field)
        currentDragFieldRef.current = field

        if (activeData.parent === 'cart-top') {
            const spacerBottom = createSpacer({
                id: active.id + '-spacer-bottom',
            })
            if (data.bottomFields.length <= 0) {
                updateData((draft) => {
                    draft.bottomFields.push(spacerBottom)
                })
            }
        } else if (activeData.parent === 'cart-bottom') {
            const spacerTop = createSpacer({
                id: active.id + '-spacer-top',
            })
            if (data.topFields.length <= 0) {
                updateData((draft) => {
                    draft.topFields.push(spacerTop)
                })
            }
        }
    }

    const shouldBlocksSwap = (top, bottom) => {
        console.log('top', top)
        console.log('bottom', bottom)
        const topHasBlock = top.findIndex(
            (topField) => topField?.parent === 'cart-top'
        )
        const bottomHasBlock = bottom.findIndex(
            (bottom) => bottom?.parent === 'cart-bottom'
        )
        return topHasBlock >= 0 && bottomHasBlock >= 0
    }

    const handleDragEnd = (e) => {
        console.log('e', e)
        const { active, over } = e

        // check if over already has block
        // reset active block parent to new dropped id
        // reset secondary block parent to
        // prevent sortable from transitioning with a spacer
        if (!over) {
            updateData((draft) => {
                draft.topFields = draft.topFields.filter(
                    (f) => f.type !== 'spacer'
                )
                draft.bottomFields = draft.bottomFields.filter(
                    (f) => f.type !== 'spacer'
                )
            })
            spacerInsertedRef.current = false
            return cleanUp()
        }
        let newBlock = currentDragFieldRef.current

        if (newBlock.parent === 'sidebar') {
            const overData = getData(over)

            const topSpacerIndex = data.topFields.findIndex(
                (f) => f.type === 'spacer'
            )

            const bottomSpacerIndex = data.bottomFields.findIndex(
                (f) => f.type === 'spacer'
            )
            if (overData.parent === 'cart-top') {
                const updatedNewBlock = { ...newBlock, parent: 'cart-top' }

                updateData((draft) => {
                    draft.topFields.splice(topSpacerIndex, 1, updatedNewBlock)

                    if (bottomSpacerIndex >= 0) {
                        draft.bottomFields.splice(bottomSpacerIndex, 1)
                    }
                })
            } else if (overData.parent === 'cart-bottom') {
                const updatedNewBlock = { ...newBlock, parent: 'cart-bottom' }
                updateData((draft) => {
                    draft.bottomFields.splice(
                        bottomSpacerIndex,
                        1,
                        updatedNewBlock
                    )

                    if (topSpacerIndex >= 0) {
                        draft.topFields.splice(topSpacerIndex, 1)
                    }
                })
            }
        } else {
            // console.log('newBlock', newBlock)
            const overData = getData(over)
            const activeData = getData(active)
            const overParent = overData?.parent
            const activeParent = activeData?.parent
            console.log('overData', overData)
            console.log('activeData', activeData)

            // do not update blocks if the block is dropped within the same parent
            if (overParent !== activeParent) {
                const swapBlocks = shouldBlocksSwap(
                    data.topFields,
                    data.bottomFields
                )
                if (swapBlocks) {
                    const updatedTopField = {
                        ...data.bottomFields[0],
                        parent: 'cart-top',
                    }
                    const updatedBottomField = {
                        ...data.topFields[0],
                        parent: 'cart-bottom',
                    }

                    updateData((draft) => {
                        draft.topFields.splice(0, 1, updatedTopField)
                        draft.bottomFields.splice(0, 1, updatedBottomField)
                    })
                } else {
                    if (overParent === 'cart-top') {
                        const movedBlock = { ...newBlock, parent: 'cart-top' }

                        console.log('movedBlock', movedBlock)
                        // const movedBlock =
                        updateData((draft) => {
                            draft.bottomFields.splice(0, 1)
                            draft.topFields.splice(0, 1, movedBlock)
                        })
                    } else if (overParent === 'cart-bottom') {
                        const movedBlock = {
                            ...newBlock,
                            parent: 'cart-bottom',
                        }

                        console.log('movedBlock', movedBlock)
                        // const movedBlock =
                        updateData((draft) => {
                            draft.topFields.splice(0, 1)
                            draft.bottomFields.splice(0, 1, movedBlock)
                        })
                    }
                    // console.log('data', data)
                }
            }
        }

        // if (newBlock) {
        //     const overData = getData(over)
        //     updateData((draft) => {
        //         const topSpacerIndex = draft.topFields.findIndex(
        //             (f) => f.type === 'spacer'
        //         )
        //         const bottomSpacerIndex = draft.bottomFields.findIndex(
        //             (f) => f.type === 'spacer'
        //         )
        //         if (overData.parent === 'cart-top') {
        //             draft.topFields.splice(topSpacerIndex, 1, newBlock)

        //             if (bottomSpacerIndex >= 0) {
        //                 draft.bottomFields.splice(bottomSpacerIndex, 1)
        //             }
        //             draft.topFields = arrayMove(
        //                 draft.topFields,
        //                 topSpacerIndex,
        //                 overData.index || 0
        //             )
        //         } else if (overData.parent === 'cart-bottom') {
        //             draft.bottomFields.splice(bottomSpacerIndex, 1, newBlock)

        //             if (topSpacerIndex >= 0) {
        //                 draft.topFields.splice(topSpacerIndex, 1)
        //             }

        //             draft.bottomFields = arrayMove(
        //                 draft.bottomFields,
        //                 bottomSpacerIndex,
        //                 overData.index || 0
        //             )
        //         }
        //     })
        // }
        setSidebarFieldsRegenKey(Date.now())
        cleanUp()
    }

    const { topFields, bottomFields } = data

    return (
        <div className="app">
            <div className="content">
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    // onDragOver={handleDragOver}
                    autoScroll
                    collisionDetection={rectIntersection}
                >
                    <SortableContext
                        // strategy={rectSwappingStrategy}
                        strategy={verticalListSortingStrategy}
                        items={[...topFields, ...bottomFields].map(
                            (field) => field.id
                        )}
                    >
                        <Sidebar fieldsRegKey={sidebarFieldsRegenKey} />
                        <CartPreview
                            topFields={topFields}
                            bottomFields={bottomFields}
                        />
                    </SortableContext>
                    <DragOverlay dropAnimation={false}>
                        {activeSidebarBlock ? (
                            <SidebarBlock overlay field={activeSidebarBlock} />
                        ) : null}
                        {activePreviewBlock ? (
                            <PreviewBlock overlay field={activePreviewBlock} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}

export default App
