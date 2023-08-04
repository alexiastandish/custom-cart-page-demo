# Prototype for a DndKit implementation with a Reusable Blocks Bank

## Description

This project is a phase 1 prototype for Custom Blocks on Cart Feature. Though it's scoped for phase 1 of the custom blocks on cart release, it's built to be scalable for future iterations where we allow merchants to add more than 2 blocks at a time. The custom cart blocks are stored as arrays on the backend so building the phase 1 prototype with the future goal in mind seemed appropriate.

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

`SortableBlock.jsx`

-   Contains `useSortable` hook (https://docs.dndkit.com/presets/sortable/usesortable)
    -   In addition to the attributes, listeners,transform and setNodeRef arguments (also provided by `useDraggable` hook) a transition argument is provided as well
    -   transition: disables transform transitions while not dragging, but ensures that items transition back to their final positions when the drag operation is ended or cancelled
-   Contains `PreviewBlock.jsx` component which is responsible for deciphering how to render each block

`Sidebar.jsx`

-   `sidebarFieldsRegenKey` is updated each time a draggable/sortable block is dropped and the prop is passed as the key to the outmost div of the `Sidebar` component
-   inside of this component, the provided, "static" blocks are iterated through and passed into the `DraggableSidebarBlock` component

`DraggableSidebarBlock.jsx`

-   in order to populate a random id for each sidebar block on each dnd event: const id = useRef(nanoid())
-   bc of this, the blocks in the sidebar act like reusable building blocks library to pull from rather than moving them from point a to point b
-   in the useDraggable hook, the data argument receives the current field ({type, name}) and fromSidebar (boolean) in order to access additional data about the draggable element in event handlers

`PreviewBlock.jsx`

-   calls `getRenderer` function which handles displaying either a spacer block or a custom block with data

`SidebarBlock.jsx`

-   receives `overlay` prop in order to render a different style for when a sidebar block is being dragged

### Helpers

-   `handleDragStart`:

    -   checks to see if the block came from the sidebar; if so a spacer block is populated into the droppable areas that don't already have a block
    -   handles logic for creating spacer (in empty droppable) and/or swapping top and bottom sortable blocks if the drag came from one of the cart preview droppable areas

-   `handleDragEnd`:

    -   check if over droppable aread already has a block
        -   resets active block parent to new dropped id
        -   resets non active block parent to other drop id
    -   handles a drag end into an empty space/non droppable area
    -   populates new block from sidebar data and sets parent based on location that the block was dropped
    -   checks to see if blocks exist in both droppables
        -   if so, runs a function to swap locations of top and bottom blocks but updates parent property to new droppable parent id
        -   if not, handles logic for removing a block from the active block container and pushes active block into empty droppable container (also updates parent id to be that of it's new parent container)

-   `cleanUp`: resets state and refs on drag end

-   `getRenderer`: handles displaying either a spacer block or a custom block with data; pulls data to be rendered from `renderer` object

```
export const renderers = {
    'custom-block-1': () => <div>custom block 1</div>,
    'custom-block-2': () => <div>custom block 2</div>
    ...
```

-   `createSpacer`: creates placeholder/spacer block to be rendered on a drag event ONLY where a block in the preview does not already exist
-

### Obstacles / Challenges

-   deciphering how to handle drag/drop events based on where the block is coming from (sidebar, cart-top, cart-bottom)
-   creating sidebar draggables that interact as a draggable item for the cart preview but still persist in the array of sidebar block options after a drop into the cart preview has been made
-   handling two separate droppable areas / arrays in the cart preview but treating the blocks within them as sortable items between the two different droppable areas
-   conditionally creating placeholder blocks that render on drag start based on starting a drag event, if any blocks exist within each droppable area, and where the block is dropped onDragEnd
-   buildling a prototype that considers future iterations where there can be several blocks in each droppable, allowing them to sort within their own droppable parent (top or bottom), but also allowing them to sort outside of the current droppable parent

### Reasons for moving away from react-beautiful-dnd

-   Have not shipped a new version change since 2020
-   Outdated dependencies
-   Dnd kit has more flexibility
-   does not provide seamless restriction on drag to a single axis (dnd kit does) which is needed in dashboard features such as navigation and account page; will allow us to move to dndkit in all dnd dashboard features with plenty of x/y axis flexibility
    Br

Spent some time working on a custom cart page prototype using the new drag and drop library we're implementing into the dashbaord along with react hook form
