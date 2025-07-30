import { Header } from "./components/Header";
import { Board } from "./components/TaskList";
import "./index.css";
import SearchBar from "./components/common/SearchBar";
import DeleteIcon from "./components/icons/DeleteIcon";
import DoneIcon from "./components/icons/DoneIcon";
import UncompleteIcon from "./components/icons/UncompleteIcon";
import ClearIcon from "./components/icons/ClearIcon";
import IconButton from "./components/common/IconButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBoard } from "./hooks/useBoard";
import FilterAndAddColumn from "./components/FilterAndAddColumn";

/*
 * Root component of the Todo App.
 * Manages global state, search/filter, columns and cards, and passes handlers to Board.
 */
export function App() {
  const {
    data,
    searchTerm,
    filter,
    setSearchTerm,
    setFilter,
    handleAddColumn,
    handleAddCard,
    handleEdit,
    handleDelete,
    handleToggleComplete,
    handleToggleSelect,
    handleSelectAll,
    handleDeleteColumn,
    handleEditColumn,
    handleDeleteSelected,
    handleMarkSelectedComplete,
    handleMarkSelectedIncomplete,
    handleClearSelection,
  } = useBoard();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex-1 p-6">
        <div className="mb-8 space-y-6">
          {/* Search and filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search tasks
                </label>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-full"
                  placeholder="Search tasks..."
                />
              </div>
              <FilterAndAddColumn
                filter={filter}
                onFilterChange={setFilter}
                onAddColumn={() => {
                  handleAddColumn();
                  toast.success("Column added!");
                }}
              />
            </div>
          </div>

          {/* Mass operations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Operations with Selected
            </h3>
            <div className="flex flex-wrap gap-3">
              <IconButton
                onClick={handleDeleteSelected}
                icon={<DeleteIcon className="w-4 h-4" />}
                label="Delete selected"
                variant="danger"
              />
              <IconButton
                onClick={handleMarkSelectedComplete}
                icon={<DoneIcon className="w-4 h-4" />}
                label="Mark as completed"
                variant="success"
              />
              <IconButton
                onClick={handleMarkSelectedIncomplete}
                icon={<UncompleteIcon className="w-4 h-4" />}
                label="Mark as uncompleted"
                variant="warning"
              />
              <IconButton
                onClick={handleClearSelection}
                icon={<ClearIcon className="w-4 h-4" />}
                label="Clear selection"
                variant="secondary"
              />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Board
            initial={data}
            searchTerm={searchTerm}
            filter={filter}
            onAddCard={handleAddCard}
            onDeleteColumn={handleDeleteColumn}
            onEditColumn={handleEditColumn}
            onToggleComplete={handleToggleComplete}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
