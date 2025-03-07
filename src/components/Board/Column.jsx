import { useState, useEffect } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import "./css/Column.css";

const Task = ({ task, index, onEdit }) => {
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
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onEdit(task)}
        >
            {task.title}
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
    const handleSubmit = () => {
        const columnId = props.column.id;
        props.addNewTask({ title, description, columnId });
    };

    // Edit task
    const handleEditTask = (task) => {
        props.editTask(task);
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
                    name: newTitle
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
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Description..."
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button type="submit" onClick={() => handleSubmit()}>
                            Done
                        </button>
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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Add this to your Column.css file
const cssToAdd = `
.column-title-text:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.title-edit-container input:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.title-save-btn:hover {
    background-color: #218838;
}

.title-cancel-btn:hover {
    background-color: #c82333;
}
`;

export default Column;
