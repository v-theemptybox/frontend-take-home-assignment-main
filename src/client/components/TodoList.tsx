import { useState, type SVGProps } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Tabs from '@radix-ui/react-tabs'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import { api } from '@/utils/client/api'

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  // A5: Use formkit auto animate
  const [parent, enableAnimations] = useAutoAnimate()

  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })

  // A6: Filter sorted list by status
  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === 'all') {
      return true
    }
    return todo?.status === filterStatus
  })

  // A6: Change filter status view state when click to corresponding tab button
  const handleTabChange = (value: string) => {
    setFilterStatus(value)
  }

  const apiContext = api.useContext()

  // A3: Call api and update status
  const { mutate: updateTodoStatus } = api.todoStatus.update.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const handleClickToUpdateStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    updateTodoStatus({
      todoId: id,
      status: newStatus,
    })
  }

  // A4: Call api and delete todo item
  const { mutate: deleteTodo } = api.todo.delete.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this todo?')) {
      deleteTodo({
        id: id,
      })
    }
  }

  return (
    <>
      {/* Answer 6: Customize navbar using radix*/}
      <Tabs.Root
        defaultValue="all"
        value={filterStatus}
        onValueChange={handleTabChange}
      >
        <Tabs.List className="mb-5">
          <Tabs.Trigger
            className="mr-3 rounded-full bg-gray-800 px-5 py-3 text-center text-white"
            value="all"
          >
            All
          </Tabs.Trigger>
          <Tabs.Trigger
            className="mr-3 rounded-full bg-gray-800 px-5 py-3 text-center text-white"
            value="pending"
          >
            Pending
          </Tabs.Trigger>
          <Tabs.Trigger
            className="mr-3 rounded-full bg-gray-800 px-5 py-3 text-center text-white"
            value="completed"
          >
            Completed
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value={filterStatus}>
          {/* Answer 5: Use formkit auto animate */}
          <ul className="grid grid-cols-1 gap-y-3" ref={parent}>
            {filteredTodos.map((todo) => (
              <li
                key={todo?.id}
                onClick={() => {
                  handleClickToUpdateStatus(todo?.id, todo?.status)
                }}
              >
                <div
                  className={`${
                    todo?.status === 'completed' ? 'bg-gray-100' : ''
                  } flex items-center justify-between rounded-12 border border-gray-200 px-4 py-3 shadow-sm`}
                >
                  <div className="flex items-center">
                    <Checkbox.Root
                      id={String(todo?.id)}
                      checked={todo?.status === 'completed'}
                      className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-4 w-4 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>

                    <label
                      className={`${
                        todo?.status === 'completed' ? 'line-through' : ''
                      } block pl-3 font-medium`}
                      htmlFor={String(todo?.id)}
                    >
                      {todo?.body}
                    </label>
                  </div>
                  {/* Answer 4: Delete todo item */}
                  <XMarkIcon
                    aria-label="Delete todo item"
                    className="h-6 w-6 cursor-pointer justify-self-end focus:outline-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteItem(todo.id)
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
