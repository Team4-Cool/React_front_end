import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BoardView = () => {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [boardMembers, setBoardMembers] = useState([]);

    // Task state
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskLabels, setTaskLabels] = useState([]);
    const [taskAssignees, setTaskAssignees] = useState([]);
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskData, setEditingTaskData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        labels: [],
        assignees: [],
        column: 0
    });

    // Available priorities and labels
    const priorityOptions = ["L", "M", "H"];
    const availableLabels = []; // Replace with actual label IDs from your system

    const token = localStorage.getItem('token');
    const API_BASE_URL = "http://127.0.0.1:8000/api";

    const fetchBoard = () => {
        setLoading(true);
        axios.get(`${API_BASE_URL}/boards/${id}`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
            .then(response => {
                setBoard(response.data);
                setBoardMembers(response.data.members || []);
                setError(null);
            })
            .catch(error => {
                console.error("Error fetching board:", error);
                setError("Failed to load board data. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBoard();
    }, [id, token]);

    // CREATE: Add a new column
    const handleAddColumn = async () => {
        if (!newColumnTitle.trim()) {
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/columns/`,
                {
                    title: newColumnTitle,
                    name: newColumnTitle, // Include name property
                    board: id
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state with the new column
            setBoard(prevBoard => ({
                ...prevBoard,
                columns: [...prevBoard.columns, { ...response.data, tasks: [] }]
            }));

            // Reset form
            setNewColumnTitle("");
            setIsAddingColumn(false);

            console.log('Column created successfully:', response.data);
        } catch (error) {
            console.error('Error creating column:', error);
            alert("Failed to create column. Please try again.");
        }
    };

    // Task Modal Controls
    const openAddTaskModal = (columnId) => {
        setSelectedColumnId(columnId);
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskLabels([]);
        setTaskAssignees([]);
        setIsAddingTask(true);
    };

    const closeTaskModal = () => {
        setIsAddingTask(false);
        setEditingTaskId(null);
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskLabels([]);
        setTaskAssignees([]);
        setSelectedColumnId(null);
        setEditingTaskData({
            title: "",
            description: "",
            priority: "medium",
            labels: [],
            assignees: []
        });
    };

    // Handler for label checkbox changes
    const handleLabelChange = (labelId) => {
        if (editingTaskId) {
            const currentLabels = [...editingTaskData.labels];
            if (currentLabels.includes(labelId)) {
                setEditingTaskData({
                    ...editingTaskData,
                    labels: currentLabels.filter(id => id !== labelId)
                });
            } else {
                setEditingTaskData({
                    ...editingTaskData,
                    labels: [...currentLabels, labelId]
                });
            }
        } else {
            if (taskLabels.includes(labelId)) {
                setTaskLabels(taskLabels.filter(id => id !== labelId));
            } else {
                setTaskLabels([...taskLabels, labelId]);
            }
        }
    };

    // Handler for assignee checkbox changes
    const handleAssigneeChange = (userId) => {
        if (editingTaskId) {
            const currentAssignees = [...editingTaskData.assignees];
            if (currentAssignees.includes(userId)) {
                setEditingTaskData({
                    ...editingTaskData,
                    assignees: currentAssignees.filter(id => id !== userId)
                });
            } else {
                setEditingTaskData({
                    ...editingTaskData,
                    assignees: [...currentAssignees, userId]
                });
            }
        } else {
            if (taskAssignees.includes(userId)) {
                setTaskAssignees(taskAssignees.filter(id => id !== userId));
            } else {
                setTaskAssignees([...taskAssignees, userId]);
            }
        }
    };

    // CREATE: Add a new task
    const handleAddTask = async () => {
        if (!taskTitle.trim() || !selectedColumnId) {
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/tasks/`,
                {
                    title: taskTitle,
                    name: taskTitle, // Include name property
                    description: taskDescription,
                    priority: taskPriority,
                    labels: taskLabels,
                    assignees: taskAssignees,
                    column: selectedColumnId
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state with the new task
            setBoard(prevBoard => {
                const updatedColumns = prevBoard.columns.map(column => {
                    if (column.id === selectedColumnId) {
                        return {
                            ...column,
                            tasks: [...column.tasks, response.data]
                        };
                    }
                    return column;
                });
                return { ...prevBoard, columns: updatedColumns };
            });

            // Reset task form and close modal
            closeTaskModal();

            console.log('Task created successfully:', response.data);
        } catch (error) {
            console.error('Error creating task:', error);
            alert("Failed to create task. Please try again.");
        }
    };

    // Open Edit Task Modal
    const openEditTaskModal = (task, columnId) => {
        setEditingTaskId(task.id);
        setSelectedColumnId(columnId);
        setEditingTaskData({
            title: task.title,
            description: task.description || "",
            priority: task.priority || "Medium",
            labels: task.labels || [],
            assignees: task.assignees || [],
            column: columnId
        });
    };

    // UPDATE: Save edited task
    const handleSaveTask = async ( columnId) => {
        if (!editingTaskData.title.trim() || !editingTaskId) {
            return;
        }

        try {
            const response = await axios.put(
                `${API_BASE_URL}/tasks/${editingTaskId}/`,
                {
                    title: editingTaskData.title,
                    name: editingTaskData.title,
                    description: editingTaskData.description,
                    priority: editingTaskData.priority,
                    labels: editingTaskData.labels,
                    assignees: editingTaskData.assignees,
                    column: editingTaskData.column
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state with the updated task
            setBoard(prevBoard => {
                const updatedColumns = prevBoard.columns.map(column => {
                    const updatedTasks = column.tasks.map(task =>
                        task.id === editingTaskId
                            ? {
                                ...task,
                                title: editingTaskData.title,
                                description: editingTaskData.description,
                                priority: editingTaskData.priority,
                                labels: editingTaskData.labels,
                                assignees: editingTaskData.assignees,
                                column: editingTaskData.column
                            }
                            : task
                    );
                    return { ...column, tasks: updatedTasks };
                });
                return { ...prevBoard, columns: updatedColumns };
            });

            // Close edit modal
            closeTaskModal();

            console.log('Task updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating task:', error);
            alert("Failed to update task. Please try again.");
        }
    };

    // DELETE: Remove task
    const handleDeleteTask = async (taskId, columnId) => {
        // Confirmation dialog
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            await axios.delete(
                `${API_BASE_URL}/tasks/${taskId}/`,
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );

            // Update local state by removing the deleted task
            setBoard(prevBoard => {
                const updatedColumns = prevBoard.columns.map(column => {
                    if (column.id === columnId) {
                        return {
                            ...column,
                            tasks: column.tasks.filter(task => task.id !== taskId)
                        };
                    }
                    return column;
                });
                return { ...prevBoard, columns: updatedColumns };
            });

            console.log('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            alert("Failed to delete task. Please try again.");
        }
    };

    // MOVE: Move task between columns
    const handleMoveTask = async (taskId, sourceColumnId, targetColumnId) => {
        if (sourceColumnId === targetColumnId) return;

        try {
            // Find the task in the source column
            const taskToMove = board.columns
                .find(col => col.id === sourceColumnId)
                .tasks.find(task => task.id === taskId);

            if (!taskToMove) return;

            // Update the task on the server
            const response = await axios.put(
                `${API_BASE_URL}/tasks/${taskId}/`,
                {
                    ...taskToMove,
                    column: targetColumnId
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            setBoard(prevBoard => {
                const updatedColumns = prevBoard.columns.map(column => {
                    if (column.id === sourceColumnId) {
                        // Remove task from source column
                        return {
                            ...column,
                            tasks: column.tasks.filter(task => task.id !== taskId)
                        };
                    } else if (column.id === targetColumnId) {
                        // Add task to target column
                        return {
                            ...column,
                            tasks: [...column.tasks, taskToMove]
                        };
                    }
                    return column;
                });
                return { ...prevBoard, columns: updatedColumns };
            });

            console.log('Task moved successfully');
        } catch (error) {
            console.error('Error moving task:', error);
            alert("Failed to move task. Please try again.");
        }
    };

    // Get label color based on label ID (this is just a sample implementation)
    const getLabelColor = (labelId) => {
        const colors = {
            1: "#ff5252", // Red
            2: "#4caf50", // Green
            3: "#2196f3", // Blue
            4: "#ff9800", // Orange
            5: "#9c27b0"  // Purple
        };
        return colors[labelId] || "#757575"; // Default to gray
    };

    // Get label name based on label ID (this is just a sample implementation)
    const getLabelName = (labelId) => {
        const names = {
            1: "Bug",
            2: "Feature",
            3: "Documentation",
            4: "Enhancement",
            5: "Question"
        };
        return names[labelId] || `Label ${labelId}`;
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            low: "#4caf50",    // Green
            medium: "#ff9800", // Orange
            high: "#f44336"    // Red
        };
        return colors[priority] || "#757575"; // Default to gray
    };

    // Get member name by ID
    const getMemberName = (memberId) => {
        const member = boardMembers.find(m => m.id === memberId);
        return member ? member.username : "Unknown";
    };

    // Get member initials for avatar
    const getMemberInitials = (memberId) => {
        const member = boardMembers.find(m => m.id === memberId);
        if (!member || !member.username) return "?";

        return member.username
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Loading and error states
    if (loading && !board) {
        return <div className="container mt-4">Loading board data...</div>;
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={fetchBoard}>Retry</button>
            </div>
        );
    }

    if (!board) {
        return <div className="container mt-4">No board data available.</div>;
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="text-center">{board.name}</h1>
                    <p className="text-center">Owner: {board.members.find(m => m.id === board.owner)?.username || "Unknown"}</p>
                </div>
            </div>

            {/* Centered Add Column Button */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-center">
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAddingColumn(!isAddingColumn)}
                    >
                        {isAddingColumn ? "Cancel" : "Add Column"}
                    </button>
                </div>
            </div>

            {/* Centered New Column Form */}
            {isAddingColumn && (
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-center">
                        <div className="card" style={{ width: "400px" }}>
                            <div className="card-header text-center">
                                <h5 className="mb-0">Create New Column</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label htmlFor="columnTitle" className="form-label">Column Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="columnTitle"
                                        value={newColumnTitle}
                                        onChange={(e) => setNewColumnTitle(e.target.value)}
                                        placeholder="Enter column title"
                                        autoFocus
                                    />
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button
                                        className="btn btn-secondary me-2"
                                        onClick={() => {
                                            setIsAddingColumn(false);
                                            setNewColumnTitle("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={handleAddColumn}
                                        disabled={!newColumnTitle.trim()}
                                    >
                                        Create Column
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Add/Edit Modal */}
            {(isAddingTask || editingTaskId) && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTaskId ? "Edit Task" : "Create New Task"}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeTaskModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="mb-3">
                                            <label className="form-label">Task Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingTaskId ? editingTaskData.title : taskTitle}
                                                onChange={(e) =>
                                                    editingTaskId
                                                        ? setEditingTaskData({...editingTaskData, title: e.target.value})
                                                        : setTaskTitle(e.target.value)
                                                }
                                                placeholder="Enter task title"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                value={editingTaskId ? editingTaskData.description : taskDescription}
                                                onChange={(e) =>
                                                    editingTaskId
                                                        ? setEditingTaskData({...editingTaskData, description: e.target.value})
                                                        : setTaskDescription(e.target.value)
                                                }
                                                placeholder="Enter task description"
                                                rows="3"
                                            ></textarea>
                                        </div>

                                            <div className="mb-3">
                                                <label className="form-label">Column</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedColumnId || ""}
                                                    onChange={(e) => setSelectedColumnId(e.target.value)}
                                                    disabled={selectedColumnId !== null}
                                                >
                                                    <option value="">Select Column</option>
                                                    {board.columns.map(column => (
                                                        <option key={column.id} value={column.id}>
                                                            {column.name || column.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Priority</label>
                                            <select
                                                className="form-select"
                                                value={editingTaskId ? editingTaskData.priority : taskPriority}
                                                onChange={(e) =>
                                                    editingTaskId
                                                        ? setEditingTaskData({...editingTaskData, priority: e.target.value})
                                                        : setTaskPriority(e.target.value)
                                                }
                                            >
                                                {priorityOptions.map(priority => (
                                                    <option key={priority} value={priority}>
                                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Labels</label>
                                            <div className="card">
                                                <div className="card-body p-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                    {availableLabels.map(labelId => (
                                                        <div className="form-check" key={labelId}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`label-${labelId}`}
                                                                checked={
                                                                    editingTaskId
                                                                        ? editingTaskData.labels.includes(labelId)
                                                                        : taskLabels.includes(labelId)
                                                                }
                                                                onChange={() => handleLabelChange(labelId)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`label-${labelId}`}>
                                                                <span
                                                                    className="badge"
                                                                    style={{ backgroundColor: getLabelColor(labelId) }}
                                                                >
                                                                    {getLabelName(labelId)}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Assignees</label>
                                            <div className="card">
                                                <div className="card-body p-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                    {boardMembers.map(member => (
                                                        <div className="form-check" key={member.id}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`member-${member.id}`}
                                                                checked={
                                                                    editingTaskId
                                                                        ? editingTaskData.assignees.includes(member.id)
                                                                        : taskAssignees.includes(member.id)
                                                                }
                                                                onChange={() => handleAssigneeChange(member.id)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`member-${member.id}`}>
                                                                {member.username}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeTaskModal}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={editingTaskId ? handleSaveTask : handleAddTask}
                                    disabled={
                                        editingTaskId
                                            ? !editingTaskData.title.trim()
                                            : !taskTitle.trim() || !selectedColumnId
                                    }
                                >
                                    {editingTaskId ? "Save Changes" : "Create Task"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                gap: '16px',
                padding: '8px 0',
                justifyContent: 'center',  // Center items horizontally
                alignItems: 'center'       // Center items vertically (if needed)
            }}>

                {board.columns.map((column) => (
                    <div key={column.id} style={{minWidth: '320px', maxWidth: '320px'}}>
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span className="fw-bold">{column.name || column.title}</span>
                                <div>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => openAddTaskModal(column.id)}
                                    >
                                        <i className="bi bi-plus"></i> Add Task
                                    </button>
                                </div>
                            </div>

                            {/* Tasks List */}
                            <div className="card-body p-2" style={{maxHeight: '600px', overflowY: 'auto'}}>
                                {column.tasks.length === 0 ? (
                                    <p className="text-center text-muted p-3">No tasks in this column</p>
                                ) : (
                                    column.tasks.map((task) => (
                                        <div key={task.id} className="card mb-2 task-card">
                                            <div className="card-body p-2">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="card-title mb-0">{task.title}</h6>
                                                    <span
                                                        className="badge rounded-pill"
                                                        style={{
                                                            backgroundColor: getPriorityColor(task.priority),
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        {task.priority || 'medium'}
                                                    </span>
                                                </div>

                                                {task.description && (
                                                    <p className="card-text small text-muted mb-2">
                                                        {task.description.length > 50
                                                            ? task.description.substring(0, 50) + '...'
                                                            : task.description}
                                                    </p>
                                                )}

                                                {/* Labels */}
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="mb-2">
                                                        {task.labels.map(labelId => (
                                                            <span
                                                                key={labelId}
                                                                className="badge me-1"
                                                                style={{
                                                                    backgroundColor: getLabelColor(labelId),
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            >
                                                                {getLabelName(labelId)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Assignees */}
                                                {task.assignees && task.assignees.length > 0 && (
                                                    <div className="d-flex mb-2">
                                                        {task.assignees.map(assigneeId => (
                                                            <div
                                                                key={assigneeId}
                                                                className="avatar me-1"
                                                                title={getMemberName(assigneeId)}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#6c757d',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {getMemberInitials(assigneeId)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-between mt-2">
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                            type="button"
                                                            id={`moveTask${task.id}`}
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false">
                                                            Move
                                                        </button>
                                                        <ul className="dropdown-menu"
                                                            aria-labelledby={`moveTask${task.id}`}>
                                                            {board.columns
                                                                .filter(col => col.id !== column.id)
                                                                .map(col => (
                                                                    <li key={col.id}>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => handleMoveTask(task.id, column.id, col.id)}
                                                                        >
                                                                            To {col.name || col.title}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning me-1"
                                                            onClick={() => openEditTaskModal(task, column.id)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteTask(task.id, column.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardView;
