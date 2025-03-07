import { useState, useEffect } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import "./css/Column.css";

const Task = ({ task, index, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        padding: "8px",
        margin: "5px 0",
        background: "#e9ecef",
        borderRadius: "4px",
        cursor: "grab",
        position: "relative",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onEdit(task)}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>{task.title}</div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();  // Prevent triggering edit
                        onDelete(task.id);
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#dc3545",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "2px 6px",
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const Column = (props) => {
    const [showTaskCard, setShowTaskCard] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [columnTitle, setColumnTitle] = useState(props.column.name || props.column.title);

    const { setNodeRef, isOver } = useDroppable({
        id: props.column.id,
    });

    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
        id: props.column.id,
    });

    // Update local title when props change
    useEffect(() => {
        setColumnTitle(props.column.name || props.column.title);
    }, [props.column.name, props.column.title]);

    // Show / Hide new Task card
    const handleClick = () => {
        setShowTaskCard(!showTaskCard);
    };

    // Add new Task Card
    const handleSubmit = async () => {
        if (!title.trim()) {
            alert("Task title cannot be empty");
            return;
        }

        const columnId = props.column.id;
        const taskData = {
            title,
            description,
            columnId,
            name: title  // Adding name property equal to title
        };

        try {
            await props.addNewTask(taskData);
            // Clear form fields after successful submission
            setTitle("");
            setDescription("");
            setShowTaskCard(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Edit task
    const handleEditTask = (task) => {
        props.editTask({
            ...task,
            name: task.title  // Ensure name is updated with title
        });
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            // Show confirmation dialog
            if (window.confirm("Are you sure you want to delete this task?")) {
                await axios.delete(
                    `http://109.87.215.193:8000/api/tasks/${taskId}/`,
                    {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // If successful, update local state via parent component
                if (props.onTaskDelete) {
                    props.onTaskDelete(taskId);
                }
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Start editing column title
    const startEditingTitle = () => {
        setNewTitle(columnTitle);
        setIsEditingTitle(true);
    };

    // Save column title
    const saveColumnTitle = async () => {
        if (!newTitle.trim()) {
            setIsEditingTitle(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const boardId = props.column.board;

            // Immediately update the UI
            setColumnTitle(newTitle);
            setIsEditingTitle(false);

            const response = await axios.put(
                `http://109.87.215.193:8000/api/columns/${props.column.id}/`,
                {
                    title: newTitle,
                    name: newTitle,  // Update both title and name
                    board: boardId
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Column title updated successfully:', response.data);

            // Notify parent component if needed
            if (props.onColumnUpdate) {
                props.onColumnUpdate({
                    ...props.column,
                    title: newTitle,
                    name: newTitle  // Update both title and name
                });
            }
        } catch (error) {
            console.error('Error updating column title:', error);
            console.log('Response:', error.response?.data);

            // Revert to original title on error
            setColumnTitle(props.column.name || props.column.title);
        }
    };

    // Cancel editing
    const cancelEditingTitle = () => {
        setIsEditingTitle(false);
    };

    useEffect(() => {
        setShowTaskCard(false);
    }, [props]);

    // CSS styles for title editing
    const titleEditStyles = {
        inputContainer: {
            display: "flex",
            flex: 1,
            marginRight: "5px"
        },
        input: {
            flex: 1,
            padding: "4px 8px",
            fontSize: "14px",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            outline: "none",
            backgroundColor: "#fff"
        },
        saveButton: {
            padding: "2px 6px",
            fontSize: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "5px"
        },
        cancelButton: {
            padding: "2px 6px",
            fontSize: "12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "5px"
        },
        titleText: {
            cursor: "pointer",
            flex: 1,
            fontWeight: "500",
            padding: "4px",
            borderRadius: "4px",
            transition: "background-color 0.2s"
        }
    };

    return (
        <div
            ref={setDraggableRef}
            style={{
                transform: CSS.Transform.toString(transform),
            }}
        >
            <div className="column">
                {/* Column title with drag handle and edit option */}
                <div className="column-title">
                    <span {...attributes} {...listeners} style={{ cursor: "grab" }}>
                        ≡ {/* Drag handle icon */}
                    </span>

                    {isEditingTitle ? (
                        <div className="title-edit-container" style={titleEditStyles.inputContainer}>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        saveColumnTitle();
                                    }
                                }}
                                style={titleEditStyles.input}
                                autoFocus
                            />
                            <button
                                onClick={saveColumnTitle}
                                className="title-save-btn"
                                style={titleEditStyles.saveButton}
                            >
                                ✓
                            </button>
                            <button
                                onClick={cancelEditingTitle}
                                className="title-cancel-btn"
                                style={titleEditStyles.cancelButton}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flex: 1, justifyContent: "space-between" }}>
                            <span
                                onClick={startEditingTitle}
                                style={titleEditStyles.titleText}
                                className="column-title-text"
                                title="Click to edit column title"
                            >
                                {columnTitle}
                            </span>
                            <span className="task-length">{props.tasks.length}</span>
                        </div>
                    )}
                </div>

                {/* Add New Task Button */}
                <button
                    type="submit"
                    name="add-task"
                    className="add-button"
                    onClick={() => handleClick()}
                >
                    +
                </button>

                {/* New Task Card */}
                {showTaskCard && (
                    <div className="new-task-card">
                        <input
                            type="text"
                            placeholder="Give your task a title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                            <button
                                type="button"
                                onClick={() => setShowTaskCard(false)}
                                style={{
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={() => handleSubmit()}
                                style={{
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: "pointer"
                                }}
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}

                <div
                    ref={setNodeRef}
                    style={{
                        background: isOver ? "#f8f9fa" : "transparent",
                        minHeight: "200px",
                        padding: "8px",
                    }}
                >
                    {props.tasks.map((task, index) => (
                        <Task
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Column;
