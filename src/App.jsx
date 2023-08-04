import './App.css'
import { useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core'
import CartPreview from './components/CartPreview'
import { useImmer } from 'use-immer'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SidebarBlock from './components/SidebarBlock'
import PreviewBlock from './components/PreviewBlock'
import { createSpacer } from './utils/helpers/create-spacer'
import { getData } from './utils/helpers/get-data'
import { FormProvider, useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'

function App() {
    const [sidebarFieldsRegenKey, setSidebarFieldsRegenKey] = useState(
        Date.now()
    )
    const [activeSidebarBlock, setActiveSidebarBlock] = useState() // only for fields from the sidebar
    const [activePreviewBlock, setActivePreviewBlock] = useState() // only for fields from the cart preview

    const currentDragFieldRef = useRef()
    const spacerInsertedRef = useRef()

    // useImmer(initialState): similar to useState.
    // returns a tuple, the first value of the tuple is the current state
    // second is the updater function, which accepts an immer producer function or a value as argument

    const [data, updateData] = useImmer({
        topFields: [],
        bottomFields: [],
    })

    const methods = useForm({
        defaultValues: {
            topFields: [...data.topFields],
            bottomFields: [...data.bottomFields],
        },
        mode: 'onSubmit',
    })

    methods.register('topFields')
    methods.register('bottomFields')

    console.log('data', data)

    const cleanUp = () => {
        // console.log('CLEANING UP')
        setActiveSidebarBlock(null)
        setActivePreviewBlock(null)
        currentDragFieldRef.current = null
        spacerInsertedRef.current = false
    }

    const handleDragStart = (e) => {
        const { active } = e
        const activeData = getData(active)

        // cloning from the side bar w temporary "spacer"
        // set up a ref to the block we're dragging from the sidebar
        // if block is dropped in cart preview the clone is configured as a
        // preview block in the onDragEnd handler

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
        // not creating a new element but inserting the spacer here
        // since this field already belongs to the cart preview
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
        const topHasBlock = top.findIndex(
            (topField) => topField?.parent === 'cart-top'
        )
        const bottomHasBlock = bottom.findIndex(
            (bottom) => bottom?.parent === 'cart-bottom'
        )
        return topHasBlock >= 0 && bottomHasBlock >= 0
    }

    // handleDragEnd:
    // checks if over droppable already has a block
    // resets active block parent to new dropped parent id ("cart-top" or "cart-bottom")
    // resets non-active block parent to opposing parent id (if non-active block exists)
    // prevents sortable from transitioning animation with a spacer block

    const handleDragEnd = (e) => {
        const { active, over } = e

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
            if (
                overData.parent === 'cart-top' &&
                overData.field.type === 'spacer'
            ) {
                const updatedNewBlock = { ...newBlock, parent: 'cart-top' }

                updateData((draft) => {
                    draft.topFields.splice(topSpacerIndex, 1, updatedNewBlock)

                    if (bottomSpacerIndex >= 0) {
                        draft.bottomFields.splice(bottomSpacerIndex, 1)
                    }
                })
                methods.setValue('topFields', [updatedNewBlock], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                })
            } else if (
                overData.parent === 'cart-bottom' &&
                overData.field.type === 'spacer'
            ) {
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
                methods.setValue('bottomFields', [updatedNewBlock], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                })
            }
        } else {
            const overData = getData(over)
            const activeData = getData(active)
            const overParent = overData?.parent
            const activeParent = activeData?.parent

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

                    methods.setValue('topFields', [updatedTopField], {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                    })
                    methods.setValue('bottomFields', [updatedBottomField], {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                    })
                } else {
                    if (overParent === 'cart-top') {
                        const movedBlock = { ...newBlock, parent: 'cart-top' }

                        updateData((draft) => {
                            draft.bottomFields.splice(0, 1)
                            draft.topFields.splice(0, 1, movedBlock)
                        })

                        // TODO: move these setValue calls into a reusable function
                        methods.setValue('topFields', [movedBlock], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        })
                        methods.setValue('bottomFields', [], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        })
                    } else if (overParent === 'cart-bottom') {
                        const movedBlock = {
                            ...newBlock,
                            parent: 'cart-bottom',
                        }

                        updateData((draft) => {
                            draft.topFields.splice(0, 1)
                            draft.bottomFields.splice(0, 1, movedBlock)
                        })

                        methods.setValue('bottomFields', [movedBlock], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        })
                        methods.setValue('topFields', [], {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        })
                    }
                }
            }
        }

        setSidebarFieldsRegenKey(Date.now())
        cleanUp()
    }

    const handleRemoveBlock = (parent, id) => {
        if (parent === 'cart-bottom') {
            updateData((draft) => {
                draft.bottomFields.splice(0, 1)
            })
            methods.setValue('bottomFields', [], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            })
        } else {
            updateData((draft) => {
                draft.topFields.splice(0, 1)
            })
            methods.setValue('topFields', [], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            })
        }
    }

    const { topFields, bottomFields } = data

    return (
        <div className="app">
            <FormProvider {...methods}>
                <div className="content">
                    <DndContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        autoScroll
                        collisionDetection={rectIntersection}
                    >
                        <SortableContext
                            strategy={verticalListSortingStrategy}
                            items={[...topFields, ...bottomFields].map(
                                (field) => field.id
                            )}
                        >
                            <Sidebar fieldsRegKey={sidebarFieldsRegenKey} />
                            <CartPreview
                                handleRemoveBlock={handleRemoveBlock}
                                topFields={topFields}
                                bottomFields={bottomFields}
                                hideButton={
                                    activeSidebarBlock || activePreviewBlock
                                }
                            />
                        </SortableContext>
                        <DragOverlay dropAnimation={false}>
                            {activeSidebarBlock ? (
                                <SidebarBlock
                                    overlay
                                    field={activeSidebarBlock}
                                />
                            ) : null}
                            {activePreviewBlock ? (
                                <PreviewBlock
                                    hideButton={
                                        activeSidebarBlock || activePreviewBlock
                                    }
                                    overlay
                                    field={activePreviewBlock}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                    {/* <DevTool control={methods.control} /> */}
                    <p>
                        showSave:{' '}
                        <strong>
                            {JSON.stringify(methods.formState.isDirty)}
                        </strong>
                    </p>
                </div>
            </FormProvider>
        </div>
    )
}

export default App
