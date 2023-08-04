# Prototype for a DndKit implementation with a Reusable Blocks Bank

## Description

This project is a phase 1 prototype for Custom Blocks on Cart Feature. Though it's scoped for phase 1 of the custom blocks on cart release, it's build to be scalable for future iterations where we allow merchants to add more than 2 blocks at a time. The custom cart blocks are stored as arrays on the backend so building the phase 1 prototype with the future goal in mind seemed appropriate.

#### Phase 1

-   can only add 1 custom block on top and one custom block on bottom
-   no extra tooling/editable functionality outside of drag and drop blocks

#### Phase 2

-   an extra tab in the sidebar for editing cart settings configuration (current in the Setting {age)
-   ability to add more than 1-2 custom blocks, allowing the cart page to be more customizable and flexible

## Libraries

-   DndKit (@dnd-kit/core, @dnd-kit/sortable): https://docs.dndkit.com/
-   Immer: https://github.com/immerjs/immer#readme
-   useImmer: https://github.com/immerjs/use-immer#readme

## Architecture

### Components

`App.jsx`

-   Contains state for blocks bank (draggable blocks - data.topFields and data.bottomFields)
-   Contains state for preview blocks (blocks live in `CartPreview.jsx`
    -   The cart preview component contains both droppable areas (cart top and cart bottom)
-   Contains all `DndConext` functionality
-   Contains `SortableContext` (https://docs.dndkit.com/presets/sortable/sortable-context)
    -   items props iterates through the top and bottom block(s) that have been added to the cart preview

`CartPreview.jsx`

-   Holds `CartTop` and `CartBottom` droppable components
-   Contains placeholder div that represents where the static ui in the cart page preview will be rendered

`CartTop.jsx` & `CartBottom.jsx`

-   Contains `useDroppable` hook from dnd-kit/core
-   Id passed into `useDroppable` hook is either cart-top or cart-bottom
    -   These ids help us decipher how to make adjustments to the data based on the parent id given to the active sortable block (`SortableBlock.jsx`)
-   Passes parent id and block object to SortableBlock component

`SortableBlock.tsx`

-   Contains `useSortable` hook (https://docs.dndkit.com/presets/sortable/usesortable)
    -   In addition to the attributes, listeners,transform and setNodeRef arguments (also provided by `useDraggable` hook) a transition argument is provided as well
    -   transition: disables transform transitions while not dragging, but ensures that items transition back to their final positions when the drag operation is ended or cancelled
-   Contains `PreviewBlock.jsx` component which is responsible for deciphering how to render each block
